import { UpdateInstrumentPayload, updateInstrument } from "redux/Instrument";
import { MAX_VOLUME, MIN_VOLUME } from "utils/constants";
import { throttle } from "lodash";
import { TranspositionOffsetRecord } from "types/Transposition";
import { ControlChangeMessageEvent, MessageEvent, WebMidi } from "webmidi";
import { useCallback, useEffect } from "react";
import {
  selectPatternTrackMap,
  selectPatternTrackIds,
} from "redux/PatternTrack";
import {
  selectSelectedTrack,
  selectSelectedTrackIndex,
  setSelectedTrackId,
} from "redux/Timeline";
import {
  useAppSelector,
  useDeepEqualSelector,
  useAppDispatch,
} from "redux/hooks";
import { normalize, mod } from "utils";
import { updateSelectedTranspositions } from "redux/Transposition";
import {
  stopTransport,
  pauseTransport,
  startTransport,
  setTransportLoop,
  selectTransport,
} from "redux/Transport";
import { LIVE_AUDIO_INSTANCES } from "types/Instrument";
import { getProperty } from "types/util";
import { PatternTrack } from "types/PatternTrack";
import { MIDI } from "types/midi";
import { selectOrderedTrackIds } from "redux/Track";

const ARTURIA_KEYLAB_TRACK_CC = 60;
const ARTURIA_KEYLAB_VOLUME_CCS = [73, 75, 79, 72, 80, 81, 82, 83];
const ARTURIA_KEYLAB_PAN_CCS = [74, 71, 76, 77, 93, 18, 19, 16];

const ARTURIA_KEYLAB_STOP_BYTE = 93;
const ARTURIA_KEYLAB_PLAY_BYTE = 94;
const ARTURIA_KEYLAB_LOOP_BYTE = 86;

const ARTURIA_KEYLAB_PITCH_BYTE = 224;
const ARTURIA_KEYLAB_MOD_BYTE = 176;

// CC support for my MIDI controller :)
export default function useMidiController() {
  const dispatch = useAppDispatch();
  const transport = useAppSelector(selectTransport);
  const patternTrackMap = useAppSelector(selectPatternTrackMap);
  const orderedTrackIds = useDeepEqualSelector(selectOrderedTrackIds);
  const trackIndex = useAppSelector(selectSelectedTrackIndex);
  const patternTrackIds = useDeepEqualSelector(selectPatternTrackIds);
  const selectedTrack = useAppSelector(selectSelectedTrack);
  const selectedAudioInstance = getProperty(
    LIVE_AUDIO_INSTANCES,
    (selectedTrack as PatternTrack)?.instrumentId
  );

  // Throttle the instrument updates to avoid lag
  const throttledUpdates: Record<string, Function> = {};
  const handleInstrumentUpdate = useCallback(
    (obj: UpdateInstrumentPayload) => {
      const { instrumentId, update } = obj;

      // Create a throttled function if it doesn't exist
      if (!throttledUpdates[instrumentId]) {
        const func = (_obj: typeof obj) => dispatch(updateInstrument(_obj));
        const throttledFunc = throttle(func, 50, { trailing: true });
        throttledUpdates[instrumentId] = throttledFunc;
      }

      // Call the throttled function
      throttledUpdates[instrumentId]({ instrumentId, update });
    },
    [throttledUpdates]
  );

  // Throttle the transposition updates to avoid lag
  const handleTranspositionUpdate = throttle(
    (obj: TranspositionOffsetRecord) =>
      dispatch(updateSelectedTranspositions(obj)),
    50,
    { trailing: true }
  );

  // Add a listener for MIDI messages
  const midiListener = useCallback(
    (e: MessageEvent) => {
      const dataByte = e.message.data?.[0];
      const note = e.message.data?.[1];
      const noteDown = e.message.data?.[2] === 127;

      // Handle the chromatic byte
      if (dataByte === ARTURIA_KEYLAB_PITCH_BYTE) {
        if (trackIndex < 0) return;
        const normalValue = normalize(e.message.data?.[2], 0, 127);
        const pitchRange = 12;
        const offset = Math.floor(normalValue * pitchRange) - pitchRange / 2;
        handleTranspositionUpdate({ _chromatic: offset });
        return;
      }

      // Handle the chordal byte
      if (dataByte === ARTURIA_KEYLAB_MOD_BYTE && note === 1) {
        if (trackIndex < 0) return;
        const normalValue = normalize(e.message.data?.[2], 0, 127);
        const chordalRange = 12;
        const offset =
          Math.floor(normalValue * chordalRange) - chordalRange / 2;
        handleTranspositionUpdate({ _self: offset });
        return;
      }

      // Handle the stop byte
      if (dataByte === ARTURIA_KEYLAB_STOP_BYTE && noteDown) {
        dispatch(stopTransport());
        return;
      }
      // Handle the play/pause byte
      if (dataByte === ARTURIA_KEYLAB_PLAY_BYTE && noteDown) {
        if (transport.state === "started") {
          dispatch(pauseTransport());
        } else {
          dispatch(startTransport());
        }
        return;
      }
      // Handle the loop byte
      if (dataByte === ARTURIA_KEYLAB_LOOP_BYTE && noteDown) {
        dispatch(setTransportLoop(!transport.loop));
        return;
      }
    },
    [trackIndex, transport.loop, transport.state]
  );

  // Add a listener for control change messages
  const controlListener = useCallback(
    (e: ControlChangeMessageEvent) => {
      if (e.rawValue === undefined) return;
      // Handle the track selection if it's a track CC
      if (e.controller.number === ARTURIA_KEYLAB_TRACK_CC) {
        if (trackIndex < 0) return;
        const sign = e.rawValue < 64 ? 1 : -1;
        const newIndex = mod(trackIndex + sign, orderedTrackIds.length);
        const newTrackId = orderedTrackIds[newIndex];
        if (!newTrackId) return;

        dispatch(setSelectedTrackId(newTrackId));
      }

      // Handle the volume index if it's a volume CC
      const volumeIndex = ARTURIA_KEYLAB_VOLUME_CCS.indexOf(
        e.controller.number
      );
      if (volumeIndex >= 0) {
        const patternTrackId = patternTrackIds[volumeIndex];
        if (!patternTrackId) return;
        const patternTrack = patternTrackMap[patternTrackId];
        if (!patternTrack) return;
        const normalValue = normalize(e.rawValue, 0, 127);
        const volumeRange = MAX_VOLUME - MIN_VOLUME;
        const volume = volumeRange * normalValue + MIN_VOLUME;
        handleInstrumentUpdate({
          instrumentId: patternTrack.instrumentId,
          update: { volume },
        });
        return;
      }

      // Handle the pan index if it's a pan CC
      const panIndex = ARTURIA_KEYLAB_PAN_CCS.indexOf(e.controller.number);
      if (panIndex >= 0) {
        const patternTrackId = patternTrackIds[panIndex];
        if (!patternTrackId) return;
        const patternTrack = patternTrackMap[patternTrackId];
        if (!patternTrack) return;
        const normalValue = normalize(e.rawValue, 0, 127);
        const pan = normalValue * 2 - 1;
        handleInstrumentUpdate({
          instrumentId: patternTrack.instrumentId,
          update: { pan },
        });
        return;
      }
    },
    [patternTrackIds, patternTrackMap, trackIndex, orderedTrackIds]
  );

  const playInstanceNote = useCallback(
    (midiNumber: number) => {
      let instance = selectedAudioInstance;
      if (!instance?.isLoaded()) instance = LIVE_AUDIO_INSTANCES.global;
      if (!instance?.isLoaded()) return;
      const pitch = MIDI.toPitch(midiNumber);
      instance.sampler.triggerAttack(pitch);
    },
    [selectedAudioInstance]
  );

  const stopInstanceNote = useCallback(
    (midiNumber: number) => {
      let instance = selectedAudioInstance;
      if (!instance?.isLoaded()) instance = LIVE_AUDIO_INSTANCES.global;
      if (!instance?.isLoaded()) return;
      const pitch = MIDI.toPitch(midiNumber);
      instance.sampler.triggerRelease(pitch);
    },
    [selectedAudioInstance]
  );

  // Synchronize with MIDI controller via WebMidi
  useEffect(() => {
    const onEnabled = () => {
      WebMidi.inputs.forEach((input) => {
        input.addListener("midimessage", midiListener);
        input.addListener("controlchange", controlListener);
        input.addListener("noteon", (e) => playInstanceNote(e.note.number));
        input.addListener("noteoff", (e) => stopInstanceNote(e.note.number));
      });
    };
    WebMidi.enable().then(onEnabled);
    return () => {
      WebMidi.inputs.forEach((input) => {
        input.removeListener();
      });
    };
  }, [midiListener, controlListener, playInstanceNote, stopInstanceNote]);
}
