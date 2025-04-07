import * as Tone from "tone";
import { Tick } from "types/units";
import encodeWAV from "audiobuffer-to-wav";
import { selectTransport, selectTransportBPM } from "./TransportSelectors";
import { dispatchCustomEvent } from "utils/html";
import {
  DURATION_TYPES,
  getDurationTicks,
  PPQ,
  secondsToTicks,
  SixteenthNoteTicks,
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
import {
  emitPauseTransport,
  emitStartTransport,
  emitStopTransport,
} from "hooks/useTransportState";
import {
  CLOSE_STATE,
  dispatchClose,
  dispatchOpen,
  OPEN_STATE,
} from "hooks/useToggle";
import {
  dispatchDownloadTickEvent,
  dispatchTick,
  RECORD_TRANSPORT,
  startDownloadingTransport,
  stopDownloadingTransport,
} from "./TransportTypes";

let scheduleId: number | undefined;

/** Seek the transport to the given tick. */
export const seekTransport =
  ({ data }: Payload<Tick>): Thunk =>
  (dispatch) => {
    const tick = data;
    if (tick < 0) return;
    const started = Tone.getTransport().state === "started";
    Tone.getTransport().pause();
    Tone.getTransport().cancel();
    Tone.getTransport().ticks = tick;
    dispatchTick(tick);
    if (started) dispatch(startTransport());
  };

/** Start the transport, using `Tone.scheduleRepeat` to schedule all samplers. */
export const startTransport = (): Thunk => (dispatch, getProject) => {
  if (Tone.getContext().state !== "running") return;
  emitStartTransport();

  // Clear any previous events
  if (scheduleId !== undefined) {
    Tone.getTransport().clear(scheduleId);
    scheduleId = undefined;
  }

  // Keep track of the start time
  let startTime = Tone.getTransport().now();
  let startSeconds = Tone.getTransport().seconds;

  // Schedule a new event
  scheduleId = Tone.getTransport().scheduleRepeat((time) => {
    const project = getProject();
    const transport = selectTransport(project);
    const { bpm, loop, swing, loopStart, loopEnd, volume, mute } = transport;

    // Set the volume and mute state
    if (volume !== Tone.getDestination().volume.value) {
      Tone.getDestination().volume.value = volume;
    }
    if (mute !== Tone.getDestination().mute) {
      Tone.getDestination().mute = mute;
    }

    // Compute the time using precise values
    const seconds = time - startTime + startSeconds;
    let newTick = Math.round((seconds * bpm * PPQ) / 60);

    // If looping, reset the tick to the loop start
    if (loop && newTick === loopEnd) {
      newTick = loopStart;
      startTime = time;
      startSeconds = (60 * loopStart) / (bpm * PPQ);
    }

    // If swinging, offset the time
    const stepIndex = Math.floor(newTick / SixteenthNoteTicks);
    const isSwing = stepIndex % 2 === 1;
    if (swing && isSwing) {
      const swingOffset = (60 / bpm) * (swing / 8);
      time += swingOffset;
    }

    // Dispatch a tick update event
    dispatchTick(newTick);

    // If the transport is muted, skip the playback
    if (mute) return;

    // Select the memoized record of chords to be played at the current tick
    const chordRecord = selectMidiChordsByTicks(project)[newTick];

    // Iterate over the instruments that are to be played at the current tick
    if (chordRecord) {
      for (const instrumentId in chordRecord) {
        const chord = chordRecord[instrumentId];
        if (!chord) continue;

        // Get the live audio instance
        const instance = LIVE_AUDIO_INSTANCES[instrumentId];
        if (!instance?.isLoaded()) continue;

        // Play the realized pattern chord using the sampler
        playPatternChord(instance.sampler, chord, time);
      }
    }
  }, `1i`);

  // Start the transport
  Tone.getTransport().start();
};

/** Stop the transport, canceling all scheduled events. */
export const stopTransport = () => {
  Tone.getTransport().stop();
  Tone.getTransport().cancel(0);
  emitStopTransport();
  dispatchTick(0);
};

export const pauseTransport = () => {
  Tone.getTransport().pause();
  Tone.getTransport().cancel();
  emitPauseTransport();
};

/** Toggle the transport between playing and paused/stopped. */
export const toggleTransport = (): Thunk => (dispatch) => {
  if (Tone.getTransport().state === "started") {
    pauseTransport();
  } else if (Tone.getTransport().state === "paused") {
    dispatch(startTransport());
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
    dispatch(
      seekTransport({ data: Tone.getTransport().ticks - (amount ?? ticks) })
    );
  };

/** Move the playhead of the transport one tick right. */
export const movePlayheadRight =
  (amount?: Tick): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const ticks = selectSubdivisionTicks(project);
    dispatch(
      seekTransport({ data: Tone.getTransport().ticks + (amount ?? ticks) })
    );
  };

export const MOUNT_TRANSPORT = "mount_transport";
export const LOAD_TRANSPORT = OPEN_STATE(MOUNT_TRANSPORT);
export const UNLOAD_TRANSPORT = CLOSE_STATE(MOUNT_TRANSPORT);

/** Load the transport on mount. */
export const loadTransport = (): Thunk => async (dispatch, getProject) => {
  dispatchCustomEvent(UNLOAD_TRANSPORT);

  // Build the instruments
  const project = getProject();
  const transport = selectTransport(project);
  const patternTracks = selectPatternTracks(project);

  try {
    // Wait for the Tone context to start
    await Tone.start();

    // Copy the transport state into the Tone transport
    const { bpm, volume, mute } = transport;
    Tone.getTransport().PPQ = PPQ;
    Tone.getTransport().bpm.value = bpm;
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
    dispatchCustomEvent(LOAD_TRANSPORT);
  }
};

/** Unload the transport when unmounting, destroying all instruments. */
export const unloadTransport = () => {
  stopTransport();
  destroyInstruments();
};

/** Start recording the transport. */
export const startRecordingTransport = (): Thunk => (dispatch) => {
  dispatchOpen(RECORD_TRANSPORT);

  // Start the recorder if not started
  if (LIVE_RECORDER_INSTANCE.state === "started") return;
  LIVE_RECORDER_INSTANCE.start();
};

/** Stop recording the transport and save the recording. */
export const stopRecordingTransport = (): Thunk => (dispatch, getProject) => {
  dispatchClose(RECORD_TRANSPORT);
  if (LIVE_RECORDER_INSTANCE.state !== "started") return;

  // Stop the transport
  stopTransport();

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

    const bpm = selectTransportBPM(project);
    const ticks = selectLastArrangementTick(project);

    // Get the samplers
    const trackMap = selectTrackMap(project);
    const samplers = selectTrackAudioInstanceMap(project);

    // Calculate the duration and pulse
    const duration = ticksToSeconds(ticks, bpm);
    const tail = 1;
    const pulse = ticksToSeconds(1, bpm);

    // Start downloading
    startDownloadingTransport();

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
      offlineContext.transport.bpm.value = bpm;
      offlineContext.transport.PPQ = PPQ;
      const chordsByTick = selectMidiChordsByTicks(project);

      offlineContext.transport.scheduleRepeat((time) => {
        const tick = offlineContext.transport.ticks - 1; // Starts from 1
        // Dispatch the tick update
        dispatchDownloadTickEvent(tick);

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
    stopDownloadingTransport();
    return blob;
  };

export const convertStringToTicks =
  (string: string): Thunk<Tick | undefined> =>
  (_, getProject) => {
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
      const { timeSignature } = selectTransport(getProject());
      return bars * (timeSignature / 4) * PPQ;
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
      return secondsToTicks(seconds, selectTransport(getProject()).bpm);
    }

    // Return undefined if no match
    return undefined;
  };
