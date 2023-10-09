import { startTone } from "index";
import * as Instrument from "redux/Instrument";
import * as TransportSlice from "./TransportSlice";
import * as Tone from "tone";
import { AppThunk } from "redux/store";
import { playPatternChord } from "types/Pattern";
import { Tick } from "types/units";
import encodeWAV from "audiobuffer-to-wav";
import { sleep } from "utils/html";
import { clamp } from "lodash";
import {
  MAX_BPM,
  MAX_TRANSPORT_VOLUME,
  MIN_BPM,
  MIN_TRANSPORT_VOLUME,
} from "appConstants";
import { convertTicksToSeconds, getNextTransportTick } from "types/Transport";
import { selectTransport } from "./TransportSelectors";
import {
  selectPatternTracks,
  selectChordsByTicks,
  selectTimelineEndTick,
  selectPatternTrackMap,
  selectRoot,
  selectPatternTrackAudioInstances,
  selectChordsAtTick,
} from "redux/selectors";
import { LIVE_AUDIO_INSTANCES } from "types/Instrument";

/**
 * Load the transport upon rendering the app.
 */
export const loadTransport = (): AppThunk => async (dispatch, getState) => {
  // Build the instruments
  const state = getState();
  const transport = selectTransport(state);
  const patternTracks = selectPatternTracks(state);

  // Try to load the transport
  try {
    // Wait for the Tone context to start
    await Tone.start();

    // Unload the transport
    dispatch(TransportSlice.setLoaded(false));
    dispatch(TransportSlice.setLoading(true));

    // Copy the transport state into the Tone transport
    const { loop, loopStart, loopEnd, bpm, volume, mute } = transport;
    Tone.Transport.loop = loop;
    Tone.Transport.loopStart = convertTicksToSeconds(transport, loopStart);
    Tone.Transport.loopEnd = convertTicksToSeconds(transport, loopEnd);
    Tone.Transport.bpm.value = bpm;
    Tone.getDestination().volume.value = volume;
    Tone.getDestination().mute = mute;

    // Create the global instrument
    Instrument.createGlobalInstrument();

    // Build the instruments from the pattern tracks
    dispatch(Instrument.buildInstruments(patternTracks));
  } catch (e) {
    // If there is an error, log it
    console.error(e);
  } finally {
    // Take an extra lil bit to load :)
    await sleep(5.12);
    // Set the transport as loaded
    dispatch(TransportSlice.setLoaded(true));
    dispatch(TransportSlice.setLoading(false));
  }
};

/**
 * Unload the transport upon unmounting the app, destroying all instruments.
 */
export const unloadTransport = (): AppThunk => (dispatch) => {
  // Unload and stop the transport
  dispatch(TransportSlice.setLoaded(false));
  dispatch(TransportSlice.setLoading(false));
  dispatch(stopTransport());

  // Destroy all instruments
  Instrument.destroyInstruments();
};

/**
 * Stop the transport, canceling all scheduled events.
 * @param tick - Optional. The tick to seek to.
 */
export const stopTransport =
  (tick?: Tick): AppThunk =>
  (dispatch, getState) => {
    // Make sure the transport is not recording
    const state = getState();
    const transport = selectTransport(state);
    if (transport.recording) return;

    // Stop the transport
    dispatch(TransportSlice._stopTransport());
    Tone.Transport.stop();
    Tone.Transport.cancel();
    Tone.Transport.position = 0;

    // Seek to the given tick if provided
    if (tick) dispatch(seekTransport(tick));
  };

/**
 * Pause the transport.
 */
export const pauseTransport = (): AppThunk => (dispatch, getState) => {
  // Make sure the transport is not recording
  const state = getState();
  const transport = selectTransport(state);
  if (transport.recording) return;

  // Pause the transport
  Tone.Transport.pause();
  dispatch(TransportSlice._pauseTransport());
};

/**
 * Seek the transport to the given tick.
 * @param tick - The tick to seek to.
 */
export const seekTransport =
  (tick: Tick): AppThunk =>
  (dispatch, getState) => {
    // Make sure the transport is not recording
    const state = getState();
    const transport = selectTransport(state);
    if (transport.recording) return;

    // Convert the tick to seconds
    const seconds = convertTicksToSeconds(transport, tick);
    if (tick < 0 || seconds < 0) return;

    // Seek the transport
    Tone.Transport.seconds = seconds;
    dispatch(TransportSlice._seekTransport(tick));
  };

/**
 * Set the transport loop state to true or false.
 * @param loop - The boolean value.
 */
export const setTransportLoop =
  (loop: boolean): AppThunk =>
  (dispatch, getState) => {
    // Get the transport
    const state = getState();
    const transport = selectTransport(state);

    // Set the loop state
    dispatch(TransportSlice._loopTransport(loop));
    Tone.Transport.loop = loop;

    // Update the loop start and end
    if (loop) {
      const { loopStart, loopEnd } = transport;
      Tone.Transport.loopStart = convertTicksToSeconds(transport, loopStart);
      Tone.Transport.loopEnd = convertTicksToSeconds(transport, loopEnd);
    }
  };

/**
 * Toggle the transport loop state.
 */
export const toggleTransportLoop = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const transport = selectTransport(state);
  dispatch(setTransportLoop(!transport.loop));
};

/**
 * Set the transport loop start to the given tick.
 * @param tick - The tick to seek to.
 */
export const setTransportLoopStart =
  (tick: Tick): AppThunk =>
  (dispatch, getState) => {
    // Get the transport
    const state = getState();
    const transport = selectTransport(state);

    // Make sure the loop start is less than the loop end
    if (tick >= transport.loopEnd) return;

    // Set the loop start
    Tone.Transport.loopStart = convertTicksToSeconds(transport, tick);
    dispatch(TransportSlice._setLoopStart(tick));
  };

/**
 * Set the transport loop end to the given tick.
 * @param tick - The tick to seek to.
 */
export const setTransportLoopEnd =
  (tick: Tick): AppThunk =>
  (dispatch, getState) => {
    // Get the transport
    const state = getState();
    const transport = selectTransport(state);

    // Make sure the loop end is greater than the loop start
    if (tick <= transport.loopStart) return;

    // Set the loop end
    Tone.Transport.loopEnd = convertTicksToSeconds(transport, tick);
    dispatch(TransportSlice._setLoopEnd(tick));
  };

/**
 * Set the transport BPM.
 * @param bpm - The BPM.
 */
export const setTransportBPM =
  (bpm: number): AppThunk =>
  (dispatch) => {
    const value = clamp(bpm, MIN_BPM, MAX_BPM);
    Tone.Transport.bpm.value = value;
    dispatch(TransportSlice._setBPM(value));
  };

/**
 * Set the transport time signature.
 * @param timeSignature - The time signature.
 */
export const setTransportTimeSignature =
  (timeSignature: [number, number]): AppThunk =>
  (dispatch) => {
    Tone.Transport.timeSignature = timeSignature;
    dispatch(TransportSlice._setTimeSignature(timeSignature));
  };

/**
 * Set the transport volume.
 * @param volume - The volume.
 */
export const setTransportVolume =
  (volume: number): AppThunk =>
  (dispatch) => {
    const value = clamp(volume, MIN_TRANSPORT_VOLUME, MAX_TRANSPORT_VOLUME);
    Tone.getDestination().volume.value = value;
    dispatch(TransportSlice._setVolume(value));
  };

/**
 * Set the transport mute state.
 * @param mute - The boolean value.
 */
export const setTransportMute =
  (mute: boolean): AppThunk =>
  (dispatch) => {
    Tone.getDestination().mute = mute;
    dispatch(TransportSlice._setMute(mute));
  };

/**
 * Start recording the transport.
 */
export const startRecording = (): AppThunk => (dispatch) => {
  dispatch(TransportSlice.setOfflineTick(0));
  dispatch(TransportSlice.setRecording(true));
};

/**
 * Stop recording the transport.
 * @returns
 */
export const stopRecording = (): AppThunk => (dispatch) => {
  dispatch(TransportSlice.setOfflineTick(0));
  dispatch(TransportSlice.setRecording(false));
};

/**
 * Start the transport, using `Tone.scheduleRepeat` to schedule all samplers to play their patterns.
 * The transport will fetch the chord record every tick so that the state is always up to date.
 * If the transport is already started, this function will do nothing.
 */
export const startTransport = (): AppThunk => (dispatch, getState) => {
  // Make sure the Tone context is running
  if (Tone.getContext().state !== "running") {
    stopTransport();
    startTone(true);
    return;
  }

  // Make sure the transport is not already started or recording
  const oldState = getState();
  const transport = selectTransport(oldState);
  if (transport.state === "started" || transport.recording) return;

  // Schedule patterns if the transport is stopped
  if (transport.state === "stopped") {
    const pulse = convertTicksToSeconds(transport, 1);

    // Schedule the transport
    Tone.Transport.scheduleRepeat((time) => {
      const state = getState();
      const transport = selectTransport(state);

      // Get the chord record at the current tick
      const chordRecord = selectChordsAtTick(state, transport.tick);

      // Iterate over the instruments that are to be played at the current tick
      if (chordRecord) {
        for (const instrumentId in chordRecord) {
          // Get the chord to be played
          const chord = chordRecord[instrumentId];
          if (!chord) continue;

          // Get the live audio instance
          const instance = LIVE_AUDIO_INSTANCES[instrumentId];
          if (!instance.isLoaded()) continue;

          // Play the realized pattern chord using the sampler
          playPatternChord(instance.sampler, chord, time);
        }
      }
      // Schedule the next tick
      const nextTick = getNextTransportTick(transport);
      dispatch(TransportSlice._seekTransport(nextTick));
    }, pulse);
  }

  // Start the transport
  Tone.Transport.start();
  dispatch(TransportSlice._startTransport());
};

/**
 * Download the transport into a WAV file.
 * Uses the `Tone.Offline` transport to schedule the samplers and `encodeWAV` to encode the buffer into a WAV file.
 */
export const downloadTransport = (): AppThunk => async (dispatch, getState) => {
  const oldState = getState();

  // Make sure the transport is started
  const oldTransport = selectTransport(oldState);
  if (oldTransport.state === "started") return;

  // Make sure the recording will be longer than 0 seconds
  const ticks = oldTransport.loop
    ? oldTransport.loopEnd
    : selectTimelineEndTick(oldState);
  if (ticks <= 0) return;

  // Get the samplers
  const patternTrackMap = selectPatternTrackMap(oldState);
  const oldSamplers = selectPatternTrackAudioInstances(oldState);

  // Calculate the duration and pulse
  const duration = convertTicksToSeconds(oldTransport, ticks);
  const pulse = convertTicksToSeconds(oldTransport, 1);

  // Start recording
  dispatch(startRecording());

  // Start the offline transport
  const offlineBuffer = await Tone.Offline(async (offlineContext) => {
    // Create new samplers for the offline transport
    const samplers: Record<string, Tone.Sampler> = {};
    for (const trackId in oldSamplers) {
      const patternTrack = patternTrackMap[trackId];
      const instance = dispatch(
        Instrument.createInstrument(patternTrack, { recording: true })
      );
      if (!instance) continue;
      samplers[trackId] = instance.sampler;
    }

    // Schedule the offline transport
    offlineContext.transport.scheduleRepeat((time) => {
      const state = getState();
      const transport = selectTransport(state);

      // Cancel the operation if recording ever stops
      if (!transport.recording) {
        offlineContext.transport.stop();
        offlineContext.transport.cancel();
        return;
      }

      // Get the chord record at the current tick
      const chordsByTick = selectChordsByTicks(state);
      const chords = chordsByTick[transport.offlineTick] ?? {};
      const instrumentIds = Object.keys(chords);

      // Iterate over the instruments that are to be played at the current tick
      for (const instrumentId of instrumentIds) {
        const chord = chords[instrumentId];
        const sampler = samplers[instrumentId];
        playPatternChord(sampler, chord, time);
      }
      // Schedule the next tick
      dispatch(TransportSlice.setOfflineTick(transport.offlineTick + 1));
    }, pulse);

    // Start the transport
    offlineContext.transport.start();
  }, duration);

  // Make sure the transport is still recording
  const currentTransport = selectTransport(getState());
  if (!currentTransport.recording) return;

  // Get the data from the buffer
  const buffer = offlineBuffer.get();
  if (!buffer) return;

  // Encode the buffer into a WAV file
  const wav = encodeWAV(buffer);
  const blob = new Blob([wav], { type: "audio/wav" });
  const url = URL.createObjectURL(blob);

  // Download the file
  const { projectName } = selectRoot(oldState);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${projectName ?? "project"}.wav`;
  a.click();
  URL.revokeObjectURL(url);

  // Stop the recording
  dispatch(stopRecording());
};
