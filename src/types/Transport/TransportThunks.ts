import * as TransportSlice from "./TransportSlice";
import * as Tone from "tone";
import { Tick } from "types/units";
import encodeWAV from "audiobuffer-to-wav";
import { clamp } from "lodash";
import {
  MAX_BPM,
  MAX_TRANSPORT_VOLUME,
  MIN_BPM,
  MIN_TRANSPORT_VOLUME,
} from "utils/constants";
import { selectTransport } from "./TransportSelectors";
import { dispatchCustomEvent, sleep } from "utils/html";
import {
  DURATION_TYPES,
  getDurationTicks,
  PPQ,
  secondsToTicks,
  ticksToSeconds,
} from "utils/durations";
import {
  LIVE_AUDIO_INSTANCES,
  LIVE_RECORDER_INSTANCE,
} from "types/Instrument/InstrumentClass";
import { InstrumentId } from "types/Instrument/InstrumentTypes";
import { Project, Thunk } from "types/Project/ProjectTypes";
import { isPatternTrack, TrackId } from "types/Track/TrackTypes";
import {
  isTransportStarted,
  convertTicksToSeconds,
} from "./TransportFunctions";
import {
  selectChordsAtTick,
  selectLastArrangementTick,
  selectMidiChordsByTicks,
} from "types/Arrangement/ArrangementSelectors";
import { selectMeta, selectProjectName } from "types/Meta/MetaSelectors";
import { selectSubdivisionTicks } from "types/Timeline/TimelineSelectors";
import {
  selectPatternTracks,
  selectTrackMap,
  selectTrackAudioInstanceMap,
} from "types/Track/TrackSelectors";
import { Payload } from "lib/redux";
import {
  createGlobalInstrument,
  buildInstruments,
  destroyInstruments,
  createInstrument,
} from "types/Instrument/InstrumentThunks";
import { playPatternChord } from "types/Pattern/PatternThunks";
import { sanitize } from "utils/math";
import { _removeOfflineInstrument } from "types/Instrument/InstrumentSlice";

let scheduleId: number;

export const UPDATE_TICK = "updateTick";
export const UPDATE_OFFLINE_TICK = "updateOfflineTick";
export const START_LOADING_TRANSPORT = "startLoadingTransport";
export const STOP_LOADING_TRANSPORT = "stopLoadingTransport";

/** Dispatch a tick update event. */
export const dispatchTickUpdate = (
  tick: Tick,
  options?: { offline: boolean }
) => {
  const isOffline = !!options?.offline;
  const event = isOffline ? UPDATE_OFFLINE_TICK : UPDATE_TICK;
  dispatchCustomEvent(event, tick);
  if (!isOffline) dispatchCustomEvent("printTick", Tone.Transport.position);
};

/** Seek the transport to the given tick. */
export const seekTransport =
  ({ data }: Payload<Tick>): Thunk =>
  (dispatch) => {
    const tick = data;
    if (tick < 0) return;

    // Turn off loop if the tick is greater than the loop end
    const tickInSeconds = ticksToSeconds(tick, Tone.Transport.bpm.value);
    const loopStart = Tone.Time(Tone.Transport.loopStart).toSeconds();
    if (tickInSeconds > loopStart) {
      dispatch(setTransportLoop(false));
    }

    // Clear the schedule
    if (scheduleId !== undefined) Tone.Transport.clear(scheduleId);

    // Restart the transport if it is started
    if (isTransportStarted(Tone.Transport)) {
      dispatch(stopTransport());
      dispatch(startTransport(tick));
    }
    Tone.Transport.position = Tone.Time(tick, "i").toSeconds();

    // Dispatch a tick update event
    dispatchTickUpdate(tick);
  };

/** Start the transport, using `Tone.scheduleRepeat` to schedule all samplers. */
export const startTransport =
  (tick?: Tick): Thunk =>
  (dispatch, getProject) => {
    if (Tone.getContext().state !== "running") return;

    // Read the old transport
    const oldProject = getProject();
    const transport = selectTransport(oldProject);
    const { loop, loopStart, loopEnd, bpm } = transport;
    const pulse = convertTicksToSeconds(transport, 1);
    const loopStartInSeconds = convertTicksToSeconds(transport, loopStart);
    const loopEndInSeconds = convertTicksToSeconds(transport, loopEnd);

    // Set the current Transport time if specified
    const offset = tick ? convertTicksToSeconds(transport, tick) : 0;
    if (tick !== undefined) {
      Tone.Transport.position = Tone.Time(offset).toBarsBeatsSixteenths();
    }

    // Update the loop or turn it off if the tick is greater than the loop start
    if (Tone.Transport.seconds > loopStartInSeconds) {
      // dispatch(setTransportLoop(false));
    } else {
      Tone.Transport.loop = loop;
      Tone.Transport.loopStart = loopStartInSeconds;
      Tone.Transport.loopEnd = loopEndInSeconds;
    }

    // Get the current start time
    const startTime = Tone.Transport.now();
    const startSeconds = Tone.Transport.seconds;
    const conversionRatio = (bpm * PPQ) / 60;

    // Schedule the transport
    if (scheduleId !== undefined) {
      Tone.Transport.clear(scheduleId);
      Tone.Transport.cancel();
    }

    scheduleId = Tone.Transport.scheduleRepeat((time) => {
      // Get the current time
      const currentTime = time + offset - startTime + startSeconds;

      // Convert the time into the tick and adjust for loop
      let newTick = Math.round(currentTime * conversionRatio);
      if (loop && currentTime >= loopStartInSeconds) {
        newTick =
          (newTick % (loopEnd - loopStart)) + Math.min(loopStart, newTick);
      }

      // Dispatch a tick update event
      dispatchTickUpdate(Tone.Transport.ticks);

      // Get the chord record at the current tick
      const project = getProject();
      const chordRecord = selectChordsAtTick(project, newTick);

      // Iterate over the instruments that are to be played at the current tick
      if (chordRecord) {
        for (const instrumentId in chordRecord) {
          // Get the chord to be played
          const chord = chordRecord[instrumentId];
          if (!chord) continue;

          // Get the live audio instance
          const instance = LIVE_AUDIO_INSTANCES[instrumentId];
          if (!instance?.isLoaded()) continue;

          // Play the realized pattern chord using the sampler
          playPatternChord(instance.sampler, chord, time);
        }
      }
    }, pulse);

    // Start the transport
    Tone.Transport.start();
    dispatch(TransportSlice._startTransport());
  };

/** Pause the transport. */
export const pauseTransport = (): Thunk => (dispatch) => {
  Tone.Transport.pause();
  dispatch(TransportSlice._pauseTransport());
};

/** Stop the transport, canceling all scheduled events. */
export const stopTransport = (): Thunk => (dispatch) => {
  // Stop the transport
  dispatch(TransportSlice._stopTransport());
  Tone.Transport.stop();
  Tone.Transport.cancel();
  Tone.Transport.position = 0;

  // Dispatch a tick update event
  dispatchCustomEvent("resetTimelineScroll");
  dispatchTickUpdate(Tone.Transport.ticks);
};

/** Toggle the transport between playing and paused/stopped. */
export const toggleTransport = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const transport = selectTransport(project);
  if (isTransportStarted(transport)) {
    dispatch(pauseTransport());
  } else {
    dispatch(startTransport());
  }
};

/** Move the playhead of the transport one tick left. */
export const movePlayheadLeft =
  (amount?: Tick): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const ticks = selectSubdivisionTicks(project);
    dispatch(seekTransport({ data: Tone.Transport.ticks - (amount ?? ticks) }));
  };

/** Move the playhead of the transport one tick right. */
export const movePlayheadRight =
  (amount?: Tick): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const ticks = selectSubdivisionTicks(project);
    dispatch(seekTransport({ data: Tone.Transport.ticks + (amount ?? ticks) }));
  };

/** Set the transport loop state to the given boolean. */
export const setTransportLoop =
  (loop: boolean): Thunk =>
  (dispatch, getProject) => {
    // Get the transport
    const project = getProject();
    const transport = selectTransport(project);

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

/** Toggle the transport loop state. */
export const toggleTransportLoop = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const transport = selectTransport(project);
  dispatch(stopTransport());
  dispatch(setTransportLoop(!transport.loop));
};

/** Set the transport loop start to the given tick. */
export const setTransportLoopStart =
  (tick: Tick): Thunk =>
  (dispatch, getProject) => {
    // Get the transport
    const project = getProject();
    const transport = selectTransport(project);

    // Make sure the loop start is less than the loop end
    if (tick >= transport.loopEnd) return;

    // Set the loop start
    Tone.Transport.loopStart = convertTicksToSeconds(transport, tick);
    dispatch(TransportSlice._setLoopStart(tick));
  };

/** Set the transport loop end to the given tick. */
export const setTransportLoopEnd =
  (tick: Tick): Thunk =>
  (dispatch, getProject) => {
    // Get the transport
    const project = getProject();
    const transport = selectTransport(project);

    // Make sure the loop end is greater than the loop start
    if (tick <= transport.loopStart) return;

    // Set the loop end
    Tone.Transport.loopEnd = convertTicksToSeconds(transport, tick);
    dispatch(TransportSlice._setLoopEnd(tick));
  };

/** Set the transport BPM. */
export const setTransportBPM =
  (bpm: number): Thunk =>
  (dispatch) => {
    if (isNaN(bpm)) return;
    const value = clamp(bpm, MIN_BPM, MAX_BPM);
    Tone.getTransport().bpm.value = value;
    dispatch(TransportSlice._setBPM(value));
  };

/** Set the transport time signature. */
export const setTransportTimeSignature =
  (timeSignature: [number, number]): Thunk =>
  (dispatch) => {
    if (isNaN(timeSignature[0]) || isNaN(timeSignature[1])) return;
    Tone.getTransport().timeSignature = timeSignature;
    dispatch(TransportSlice._setTimeSignature(timeSignature));
  };

/** Set the transport volume. */
export const setTransportVolume =
  (volume: number): Thunk =>
  (dispatch) => {
    const value = clamp(volume, MIN_TRANSPORT_VOLUME, MAX_TRANSPORT_VOLUME);
    Tone.getDestination().volume.value = value;
    dispatch(
      TransportSlice._setVolume({ data: value, undoType: "setTransportVolume" })
    );
  };

/** Set the transport mute state. */
export const setTransportMute =
  (mute: boolean): Thunk =>
  (dispatch) => {
    Tone.getDestination().mute = mute;
    dispatch(TransportSlice._setMute(mute));
  };

/** Toggle the transport mute state. */
export const toggleTransportMute = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const transport = selectTransport(project);
  dispatch(setTransportMute(!transport.mute));
};

/** Load the transport on mount. */
export const loadTransport = (): Thunk => async (dispatch, getProject) => {
  // Build the instruments
  const project = getProject();
  const transport = selectTransport(project);
  const patternTracks = selectPatternTracks(project);

  // Try to load the transport
  try {
    // Wait for the Tone context to start
    await Tone.start();
    dispatchCustomEvent(START_LOADING_TRANSPORT);

    // Copy the transport state into the Tone transport
    const { loop, loopStart, loopEnd, bpm, volume, mute } = transport;
    Tone.Transport.PPQ = PPQ;
    Tone.Transport.loop = loop;
    Tone.Transport.loopStart = convertTicksToSeconds(transport, loopStart);
    Tone.Transport.loopEnd = convertTicksToSeconds(transport, loopEnd);
    Tone.Transport.bpm.value = bpm;
    Tone.getDestination().volume.value = volume;
    Tone.getDestination().mute = mute;

    // Create the global instrument
    createGlobalInstrument();

    // Connect the recorder
    Tone.getDestination().connect(LIVE_RECORDER_INSTANCE);

    // Build the instruments from the pattern tracks
    await dispatch(buildInstruments(patternTracks));
  } catch (e) {
    // If there is an error, log it
    console.error(e);
  } finally {
    // Set the transport as loaded
    dispatchCustomEvent(STOP_LOADING_TRANSPORT);
  }
};

/** Unload the transport when unmounting, destroying all instruments. */
export const unloadTransport = (): Thunk => (dispatch) => {
  dispatch(stopTransport());
  destroyInstruments();
};

/** Start recording the transport. */
export const startRecordingTransport = (): Thunk => (dispatch) => {
  dispatch(TransportSlice.setRecording(true));

  // Start the recorder if not started
  if (LIVE_RECORDER_INSTANCE.state === "started") return;
  LIVE_RECORDER_INSTANCE.start();
};

/** Stop recording the transport and save the recording. */
export const stopRecordingTransport = (): Thunk => (dispatch, getProject) => {
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
    const project = getProject();
    const { name } = selectMeta(project);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name ?? "Project"} Recording.wav`;
    a.click();
    URL.revokeObjectURL(url);
  });
};

/** Toggles the transport recording state. */
export const toggleTransportRecording = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const transport = selectTransport(project);
  if (transport.recording) {
    dispatch(stopRecordingTransport());
  } else {
    dispatch(startRecordingTransport());
  }
};

/** Start downloading the transport. */
export const startDownloadingTransport = (): Thunk => (dispatch) => {
  dispatchTickUpdate(0, { offline: true });
  dispatch(TransportSlice.setDownloading(true));
};

/** Stop downloading the transport. */
export const stopDownloadingTransport = (): Thunk => (dispatch) => {
  dispatchTickUpdate(0, { offline: true });
  dispatch(TransportSlice.setDownloading(false));
};

/** Toggle the transport downloading state. */
export const toggleTransportDownloading =
  (): Thunk => (dispatch, getProject) => {
    const project = getProject();
    const transport = selectTransport(project);
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
export const downloadTransport =
  (
    _project?: Project,
    options: { download?: boolean } = { download: true }
  ): Thunk<Promise<Blob>> =>
  async (dispatch, getProject) => {
    const project = _project || getProject();

    const transport = selectTransport(project);
    const ticks = selectLastArrangementTick(project);
    // if (ticks <= 0) throw new Error("The recording is empty!");

    // Get the samplers
    const trackMap = selectTrackMap(project);
    const samplers = selectTrackAudioInstanceMap(project);

    // Calculate the duration and pulse
    const duration = convertTicksToSeconds(transport, ticks);
    const tail = 1;
    const pulse = convertTicksToSeconds(transport, 1);

    // Start downloading
    dispatch(startDownloadingTransport());

    // Start the offline transport
    const offlineInstrumentIds: InstrumentId[] = [];
    const offlineSamplers: Record<string, Tone.Sampler> = {};
    const offlineBuffer = await Tone.Offline(async (offlineContext) => {
      // Create new samplers for the offline transport
      for (const trackId in samplers) {
        const patternTrack = trackMap[trackId as TrackId];
        if (!isPatternTrack(patternTrack)) continue;
        const { instance } = dispatch(
          createInstrument({
            data: {
              track: patternTrack,
              options: { offline: true, downloading: true },
            },
          })
        );
        if (!instance) continue;

        // Store the sampler and instrument id
        offlineSamplers[patternTrack.instrumentId] = instance.sampler;
        offlineInstrumentIds.push(instance.id);
      }

      // Wait for the samplers to load!
      await Tone.loaded();

      // Schedule the offline transport
      offlineContext.transport.bpm.value = transport.bpm;
      offlineContext.transport.PPQ = PPQ;
      const chordsByTick = selectMidiChordsByTicks(project);

      offlineContext.transport.scheduleRepeat((time) => {
        const tick = offlineContext.transport.ticks - 1; // Starts from 1
        // Dispatch the tick update
        dispatchTickUpdate(tick, { offline: true });

        // Get the chord record at the current tick
        const chords = chordsByTick[tick] ?? {};
        const instrumentIds = Object.keys(chords);

        // Iterate over the instruments that are to be played at the current tick
        for (const instrumentId of instrumentIds) {
          const chord = chords[instrumentId];
          const sampler = offlineSamplers[instrumentId];
          playPatternChord(sampler, chord, time);
        }
      }, pulse);

      // Start the transport
      offlineContext.transport.start();
    }, duration + tail);

    // Delete all offline instruments
    offlineInstrumentIds.forEach((id) => {
      dispatch(_removeOfflineInstrument(id));
    });

    // Get the data from the buffer
    const buffer = offlineBuffer.get();
    if (!buffer) throw new Error("The buffer is empty!");

    // Encode the buffer into a WAV file
    const wav = encodeWAV(buffer);
    const blob = new Blob([wav], { type: "audio/wav" });
    const url = URL.createObjectURL(blob);

    // Download the file
    const name = selectProjectName(project);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name ?? "project"}.wav`;
    if (options?.download) a.click();
    URL.revokeObjectURL(url);

    // Stop the download
    dispatch(stopDownloadingTransport());
    return blob;
  };

export const convertStringToTicks =
  (string: string): Thunk<Tick | undefined> =>
  (_, getState) => {
    if (!string.length) return Infinity;

    // If the string matches exactly a number, return the value in ticks
    if (/^\d+\s?$/.test(string)) {
      return sanitize(parseFloat(string));
    }

    // Try to match with `n ticks`
    const ticksMatch = string.match(/^(\d+) ticks?$/);
    if (ticksMatch) {
      return sanitize(parseFloat(ticksMatch[1]));
    }

    // Try to match with `n bars` including decimals
    const barsMatch = string.match(/^(\d+(\.\d+)?) bars?$/);
    if (barsMatch) {
      const bars = parseFloat(barsMatch[1]);
      const { timeSignature } = selectTransport(getState());
      return bars * (timeSignature[0] / 4) * PPQ;
    }

    // Try to match with `n durations` or `n duration notes`
    for (const duration of DURATION_TYPES) {
      let durationMatch = string.match(new RegExp(`^(\\d+) ${duration}s?$`));
      if (durationMatch) {
        const value = sanitize(parseFloat(durationMatch[1]));
        const ticks = value * getDurationTicks(duration);
        return ticks;
      }
    }

    // Try to match with `n seconds` including decimals
    const secondsMatch = string.match(/^(\d+(\.\d+)?) seconds?$/);
    if (secondsMatch) {
      const seconds = parseInt(secondsMatch[1]);
      return secondsToTicks(seconds, selectTransport(getState()).bpm);
    }

    // Return undefined if no match
    return undefined;
  };
