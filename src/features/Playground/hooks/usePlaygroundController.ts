import { MAX_VOLUME, MIN_VOLUME } from "utils/constants";
import { throttle } from "lodash";
import { ControlChangeMessageEvent, MessageEvent, WebMidi } from "webmidi";
import { useCallback, useEffect } from "react";
import { use, useDeep, useProjectDispatch } from "types/hooks";
import { normalize, mod } from "utils/math";

import { getMidiPitch } from "utils/midi";

import { useAuth } from "providers/auth";
import { LIVE_AUDIO_INSTANCES } from "types/Instrument/InstrumentClass";
import {
  UpdateInstrumentPayload,
  updateInstrument,
} from "types/Instrument/InstrumentSlice";
import { PoseVector } from "types/Pose/PoseTypes";
import { setSelectedTrackId } from "types/Timeline/TimelineSlice";
import {
  selectSelectedTrackIndex,
  selectSelectedTrack,
} from "types/Timeline/TimelineSelectors";
import {
  selectPatternTrackMap,
  selectPatternTracks,
  selectOrderedTrackIds,
} from "types/Track/TrackSelectors";
import { selectTransport } from "types/Transport/TransportSelectors";
import { updateSelectedPoses } from "types/Pose/PoseThunks";
import {
  stopTransport,
  pauseTransport,
  startTransport,
  setTransportLoop,
} from "types/Transport/TransportThunks";
import { PatternTrack } from "types/Track/PatternTrack/PatternTrackTypes";

const ARTURIA_KEYLAB_TRACK_CC = 60;
const ARTURIA_KEYLAB_VOLUME_CCS = [73, 75, 79, 72, 80, 81, 82, 83];
const ARTURIA_KEYLAB_PAN_CCS = [74, 71, 76, 77, 93, 18, 19, 16];

const ARTURIA_KEYLAB_STOP_BYTE = 93;
const ARTURIA_KEYLAB_PLAY_BYTE = 94;
const ARTURIA_KEYLAB_LOOP_BYTE = 86;

const ARTURIA_KEYLAB_PITCH_BYTE = 224;
const ARTURIA_KEYLAB_MOD_BYTE = 176;

// CC support for my MIDI controller :)
export function usePlaygroundController() {
  const dispatch = useProjectDispatch();
  const { isProdigy } = useAuth();
  const transport = use(selectTransport);
  const patternTrackMap = useDeep(selectPatternTrackMap);
  const orderedTrackIds = useDeep(selectOrderedTrackIds);
  const trackIndex = use(selectSelectedTrackIndex);
  const patternTracks = useDeep(selectPatternTracks);
  const selectedTrack = use(selectSelectedTrack);
  const selectedAudioInstance = selectedTrack
    ? LIVE_AUDIO_INSTANCES[(selectedTrack as PatternTrack).instrumentId]
    : undefined;

  // Throttle the instrument updates to avoid lag
  const throttledUpdates: Record<string, Function> = {};
  const handleInstrumentUpdate = useCallback(
    (obj: UpdateInstrumentPayload) => {
      // Create a throttled function if it doesn't exist
      const func = () => dispatch(updateInstrument({ data: obj }));
      const throttledFunc = throttle(func, 50, { trailing: true });
      throttledUpdates[obj.id] = throttledFunc;

      // Call the throttled function
      throttledUpdates[obj.id]();
    },
    [throttledUpdates]
  );

  // Throttle the pose updates to avoid lag
  const handlePoseUpdate = throttle(
    (obj: PoseVector) => dispatch(updateSelectedPoses(obj)),
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
        handlePoseUpdate({ chromatic: offset });
        return;
      }

      // Handle the chordal byte
      if (dataByte === ARTURIA_KEYLAB_MOD_BYTE && note === 1) {
        if (trackIndex < 0) return;
        const normalValue = normalize(e.message.data?.[2], 0, 127);
        const chordalRange = 12;
        const offset =
          Math.floor(normalValue * chordalRange) - chordalRange / 2;
        handlePoseUpdate({ chordal: offset });
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
    [trackIndex, transport, handlePoseUpdate]
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

        dispatch(setSelectedTrackId({ data: newTrackId }));
      }

      // Handle the volume index if it's a volume CC
      const volumeIndex = ARTURIA_KEYLAB_VOLUME_CCS.indexOf(
        e.controller.number
      );
      if (volumeIndex >= 0) {
        const patternTrack = patternTracks[volumeIndex];
        if (!patternTrack) return;
        const normalValue = normalize(e.rawValue, 0, 127);
        const volumeRange = MAX_VOLUME - MIN_VOLUME;
        const volume = volumeRange * normalValue + MIN_VOLUME;
        const instrumentId = patternTrack.instrumentId;
        handleInstrumentUpdate({
          id: instrumentId,
          update: { volume },
        });
        return;
      }

      // Handle the pan index if it's a pan CC
      const panIndex = ARTURIA_KEYLAB_PAN_CCS.indexOf(e.controller.number);
      if (panIndex >= 0) {
        const patternTrack = patternTracks[panIndex];
        if (!patternTrack) return;
        const normalValue = normalize(e.rawValue, 0, 127);
        const pan = normalValue * 2 - 1;
        const instrumentId = patternTrack.instrumentId;
        handleInstrumentUpdate({
          id: instrumentId,
          update: { pan },
        });
        return;
      }
    },
    [patternTrackMap, trackIndex, orderedTrackIds]
  );

  const playInstanceNote = useCallback(
    (midiNumber: number) => {
      let instance = selectedAudioInstance;
      if (!instance?.isLoaded()) instance = LIVE_AUDIO_INSTANCES.global;
      if (!instance?.isLoaded()) return;
      const pitch = getMidiPitch(midiNumber);
      instance.sampler.triggerAttack(pitch);
    },
    [selectedAudioInstance]
  );

  const stopInstanceNote = useCallback(
    (midiNumber: number) => {
      let instance = selectedAudioInstance;
      if (!instance?.isLoaded()) instance = LIVE_AUDIO_INSTANCES.global;
      if (!instance?.isLoaded()) return;
      const pitch = getMidiPitch(midiNumber);
      instance.sampler.triggerRelease(pitch);
    },
    [selectedAudioInstance]
  );

  // Synchronize with MIDI controller via WebMidi
  useEffect(() => {
    if (isProdigy) return;
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
  }, [
    isProdigy,
    midiListener,
    controlListener,
    playInstanceNote,
    stopInstanceNote,
  ]);
}
