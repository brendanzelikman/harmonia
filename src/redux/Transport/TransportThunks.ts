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
import {
  convertSecondsToTicks,
  convertTicksToSeconds,
  getNextTransportTick,
} from "types/Transport";
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
import { LIVE_AUDIO_INSTANCES, LIVE_RECORDER_INSTANCE } from "types/Instrument";
import { MIDI } from "types/midi";

export const TICK_UPDATE_EVENT = "tickUpdate";

/**
 * Dispatch a tick update event.
 */
export const dispatchTickUpdate = (tick: Tick) => {
  const customEvent = new CustomEvent(TICK_UPDATE_EVENT, { detail: tick });
  window.dispatchEvent(customEvent);
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

  // Make sure the transport is not already started or downloading
  const oldState = getState();
  const transport = selectTransport(oldState);
  if (transport.state === "started" || transport.downloading) return;

  // Schedule patterns if the transport is stopped
  if (transport.state === "stopped") {
    const pulse = convertTicksToSeconds(transport, 1);
    const bpm = Tone.Transport.bpm.value;
    const conversionRatio = (bpm * Tone.Transport.PPQ) / 60;
    const loopStart = Tone.Time(Tone.Transport.loopStart).toTicks();
    const loopEnd = Tone.Time(Tone.Transport.loopEnd).toTicks();

    // Schedule the transport
    const startTime = Tone.Transport.now();
    Tone.Transport.scheduleRepeat((time) => {
      // Get the current tick
      const currentTime = time - startTime;
      let tick = Math.round(currentTime * conversionRatio);
      if (Tone.Transport.loop) {
        tick = (tick % (loopEnd - loopStart)) + loopStart;
      }

      // Dispatch a tick update event
      dispatchTickUpdate(Tone.Transport.ticks);

      // Get the chord record at the current tick
      const state = getState();
      const chordRecord = selectChordsAtTick(state, tick);

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
    }, pulse);
  }

  // Start the transport
  Tone.Transport.start();
  dispatch(TransportSlice._startTransport());
};

/**
 * Pause the transport.
 */
export const pauseTransport = (): AppThunk => (dispatch, getState) => {
  // Make sure the transport is not downloading
  const state = getState();
  const transport = selectTransport(state);
  if (transport.downloading) return;

  // Pause the transport
  Tone.Transport.pause();
  dispatch(TransportSlice._pauseTransport());
};

/**
 * Stop the transport, canceling all scheduled events.
 * @param tick - Optional. The tick to seek to.
 */
export const stopTransport =
  (tick?: Tick): AppThunk =>
  (dispatch, getState) => {
    // Make sure the transport is not downloading
    const state = getState();
    const transport = selectTransport(state);

    if (transport.downloading) return;

    // Stop the transport
    dispatch(TransportSlice._stopTransport());
    Tone.Transport.stop();
    Tone.Transport.cancel();
    Tone.Transport.position = 0;

    // Dispatch a tick update event
    dispatchTickUpdate(Tone.Transport.ticks);

    // Seek to the given tick if provided
    if (tick) dispatch(seekTransport(tick));
  };

/**
 * Toggle the transport between playing and paused/stopped.
 */
export const toggleTransport = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const transport = selectTransport(state);
  if (transport.state === "started") {
    dispatch(pauseTransport());
  } else {
    dispatch(startTransport());
  }
};

/**
 * Seek the transport to the given tick.
 * @param tick - The tick to seek to.
 */
export const seekTransport =
  (tick: Tick): AppThunk =>
  (dispatch, getState) => {
    if (tick < 0) return;

    // Make sure the transport is not downloading
    const state = getState();
    const transport = selectTransport(state);
    if (transport.downloading) return;

    // Convert the tick to seconds
    const seconds = convertTicksToSeconds(transport, tick);
    if (seconds < 0) return;

    // Seek the transport
    Tone.Transport.seconds = seconds;
  };

/**
 * Move the playhead of the transport one tick left.
 */
export const movePlayheadLeft = (): AppThunk => (dispatch) => {
  dispatch(seekTransport(Tone.Transport.ticks - 1));
};

/**
 * Move the playhead of the transport one tick right.
 */
export const movePlayheadRight = (): AppThunk => (dispatch) => {
  dispatch(seekTransport(Tone.Transport.ticks + 1));
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
 * Toggle the transport mute state.
 */
export const toggleTransportMute = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const transport = selectTransport(state);
  dispatch(setTransportMute(!transport.mute));
};

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
    Tone.Transport.PPQ = MIDI.PPQ;
    Tone.Transport.loop = loop;
    Tone.Transport.loopStart = convertTicksToSeconds(transport, loopStart);
    Tone.Transport.loopEnd = convertTicksToSeconds(transport, loopEnd);
    Tone.Transport.bpm.value = bpm;
    Tone.getDestination().volume.value = volume;
    Tone.getDestination().mute = mute;

    // Create the global instrument
    Instrument.createGlobalInstrument();

    // Connect the recorder
    Tone.getDestination().connect(LIVE_RECORDER_INSTANCE);

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
 * Start recording the transport.
 */
export const startRecordingTransport = (): AppThunk => (dispatch) => {
  dispatch(TransportSlice.setRecording(true));

  // Start the recorder if not started
  if (LIVE_RECORDER_INSTANCE.state === "started") return;
  LIVE_RECORDER_INSTANCE.start();
};

/**
 * Stop recording the transport and save the recording.
 * @returns
 */
export const stopRecordingTransport = (): AppThunk => (dispatch, getState) => {
  dispatch(TransportSlice.setRecording(false));
  if (LIVE_RECORDER_INSTANCE.state !== "started") return;

  // Stop the transport
  dispatch(stopTransport());

  // Stop the recorder and get the blob
  LIVE_RECORDER_INSTANCE.stop().then(async (toneBlob) => {
    // Create an audio context
    const context = new AudioContext();

    // Read blob into array buffer
    const arrayBuffer = await toneBlob.arrayBuffer();

    // Decode the WebM buffer into an audio buffer
    const audioBuffer = await context.decodeAudioData(arrayBuffer);

    // Encode the audio buffer into a WAV file
    const wav = encodeWAV(audioBuffer);

    // Create a blob from the WAV file
    const blob = new Blob([wav], { type: "audio/wav" });
    const url = URL.createObjectURL(blob);

    // Download the file
    const state = getState();
    const { projectName } = selectRoot(state);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName ?? "Project"} Recording.wav`;
    a.click();
    URL.revokeObjectURL(url);
  });
};

/**
 * Toggles the transport recording state.
 */
export const toggleTransportRecording =
  (): AppThunk => (dispatch, getState) => {
    const state = getState();
    const transport = selectTransport(state);
    if (transport.recording) {
      dispatch(stopRecordingTransport());
    } else {
      dispatch(startRecordingTransport());
    }
  };

/**
 * Start downloading the transport.
 */
export const startDownloadingTransport = (): AppThunk => (dispatch) => {
  dispatch(TransportSlice.setOfflineTick(0));
  dispatch(TransportSlice.setDownloading(true));
};

/**
 * Stop downloading the transport.
 */
export const stopDownloadingTransport = (): AppThunk => (dispatch) => {
  dispatch(TransportSlice.setOfflineTick(0));
  dispatch(TransportSlice.setDownloading(false));
};

/**
 * Toggle the transport downloading state.
 */
export const toggleTransportDownloading =
  (): AppThunk => (dispatch, getState) => {
    const state = getState();
    const transport = selectTransport(state);
    if (transport.downloading) {
      dispatch(stopDownloadingTransport());
    } else {
      dispatch(startDownloadingTransport());
    }
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
  const ticks = selectTimelineEndTick(oldState);
  if (ticks <= 0) return;

  // Get the samplers
  const patternTrackMap = selectPatternTrackMap(oldState);
  const oldSamplers = selectPatternTrackAudioInstances(oldState);

  // Calculate the duration and pulse
  const duration = convertTicksToSeconds(oldTransport, ticks);
  const pulse = convertTicksToSeconds(oldTransport, 1);

  // Start downloading
  dispatch(startDownloadingTransport());

  // Start the offline transport
  const offlineBuffer = await Tone.Offline(async (offlineContext) => {
    // Create new samplers for the offline transport
    const samplers: Record<string, Tone.Sampler> = {};
    for (const trackId in oldSamplers) {
      const patternTrack = patternTrackMap[trackId];
      const instance = dispatch(
        Instrument.createInstrument(patternTrack, { downloading: true })
      );
      if (!instance) continue;
      samplers[trackId] = instance.sampler;
    }

    // Schedule the offline transport
    offlineContext.transport.PPQ = MIDI.PPQ;
    offlineContext.transport.scheduleRepeat((time) => {
      const state = getState();
      const transport = selectTransport(state);

      // Cancel the operation if downloading ever stops
      if (!transport.downloading) {
        offlineContext.transport.stop();
        offlineContext.transport.cancel();
        return;
      }

      // Get the chord record at the current tick
      const chordsByTick = selectChordsByTicks(state);
      const chords = chordsByTick[offlineContext.transport.ticks] ?? {};
      const instrumentIds = Object.keys(chords);

      // Iterate over the instruments that are to be played at the current tick
      for (const instrumentId of instrumentIds) {
        const chord = chords[instrumentId];
        const sampler = samplers[instrumentId];
        playPatternChord(sampler, chord, time);
      }
      // Schedule the next tick
      dispatch(
        TransportSlice.setOfflineTick(offlineContext.transport.ticks + 1)
      );
    }, pulse);

    // Start the transport
    offlineContext.transport.start();
  }, duration);

  // Make sure the transport is still downloading
  const currentTransport = selectTransport(getState());
  if (!currentTransport.downloading) return;

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

  // Stop the download
  dispatch(stopDownloadingTransport());
};
