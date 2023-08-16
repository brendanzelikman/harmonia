import { beatsToSubdivision } from "appUtil";
import { startTone } from "index";
import { RECORDER } from "providers/recorder";
import {
  selectTransport,
  selectClipsAtTime,
  selectClipChordAtTime,
  selectPatternTrack,
  selectTransportEndTime,
  selectTracks,
} from "redux/selectors";
import {
  _loopTransport,
  _setBPM,
  _setLoaded,
  _setLoopEnd,
  _setLoopStart,
  _setMute,
  _setTimeSignature,
  _setVolume,
  convertTimeToSeconds,
  transportSlice,
} from "redux/slices/transport";
import { AppThunk } from "redux/store";
import { getContext, getDestination, start, Transport } from "tone";
import {
  buildInstruments,
  createGlobalInstrument,
  getSampler,
} from "types/instrument";
import { MIDI } from "types/midi";
import { isRest } from "types/patterns";
import { Time } from "types/units";

const {
  _startTransport,
  _pauseTransport,
  _stopTransport,
  _seekTransport,
  _startRecording,
  _stopRecording,
} = transportSlice.actions;

export const startTransport = (): AppThunk => (dispatch, getState) => {
  // Make sure the context is started
  if (getContext().state !== "running") return startTone(true);

  const state = getState();
  const transport = selectTransport(state);

  // Schedule patterns
  if (transport.state === "stopped") {
    Transport.scheduleRepeat((time) => {
      const state = getState();
      const transport = selectTransport(state);

      // Iterate over the clips at the current tick
      const currentClips = selectClipsAtTime(state, transport.time);
      for (const clip of currentClips) {
        // Find the notes to play of the clip
        const chord = selectClipChordAtTime(state, clip.id, transport.time);
        if (!chord || !chord.length) continue;
        if (chord.some((note) => isRest(note))) continue;

        // Find the track that contains the clip
        const patternTrack = selectPatternTrack(state, clip.trackId);
        if (!patternTrack) continue;

        // Play the notes with the track sampler
        const sampler = getSampler(patternTrack.id);
        if (!sampler?.loaded) continue;
        const pitches = chord.map((note) => MIDI.toPitch(note.MIDI));
        const subdivision = beatsToSubdivision(chord?.[0].duration);
        sampler.triggerAttackRelease(pitches, subdivision, time);
      }

      // Schedule the next tick
      if (transport.loop && transport.time === transport.loopEnd) {
        dispatch(_seekTransport(transport.loopStart));
      } else {
        dispatch(_seekTransport(transport.time + 1));
      }
    }, "16n");
  }

  Transport.start();
  dispatch(_startTransport());
};

// Stop the transport
export const stopTransport = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  if (state.transport.recording) {
    dispatch(cancelDownload());
  }
  Transport.stop(0);
  Transport.cancel(0);
  Transport.position = 0;
  dispatch(_stopTransport());
};

// Pause the transport
export const pauseTransport = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  if (state.transport.recording) {
    dispatch(cancelDownload());
  }
  Transport.pause();
  dispatch(_pauseTransport());
};

// Seek the transport
export const seekTransport =
  (time: Time): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const transport = selectTransport(state);
    const numerator = transport.timeSignature?.[0] ?? 16;
    const denominator = transport.timeSignature?.[1] ?? 16;
    // Convert into bars beats sixteenths
    const bars = Math.floor(time / (numerator * (16 / denominator)));
    const beats = Math.floor(
      (time % (numerator * (16 / denominator))) / numerator
    );
    const sixteenths = Math.floor(
      (time % (numerator * (16 / denominator))) % numerator
    );
    Transport.position = `${bars}:${beats}:${sixteenths}`;

    // convertTimeToSeconds(transport, time);
    dispatch(_seekTransport(time));
  };

// Set the loop state
export const setTransportLoop =
  (loop: boolean): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const transport = selectTransport(state);
    Transport.loop = loop;
    if (loop) {
      const { loopStart, loopEnd } = transport;
      Transport.loopStart = convertTimeToSeconds(transport, loopStart);
      Transport.loopEnd = convertTimeToSeconds(transport, loopEnd);
    }
    dispatch(_loopTransport(loop));
  };

// Toggle the loop state
export const toggleTransportLoop = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const transport = selectTransport(state);
  dispatch(setTransportLoop(!transport.loop));
};

// Set the loop start
export const setTransportLoopStart =
  (time: Time): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const transport = selectTransport(state);
    if (time >= transport.loopEnd) return;
    Transport.loopStart = convertTimeToSeconds(transport, time);
    dispatch(_setLoopStart(time));
  };

// Set the loop end
export const setTransportLoopEnd =
  (time: Time): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const transport = selectTransport(state);
    if (time <= transport.loopStart) return;
    Transport.loopEnd = convertTimeToSeconds(transport, time);
    dispatch(_setLoopEnd(time));
  };

// Set the BPM
export const setTransportBPM =
  (bpm: number): AppThunk =>
  (dispatch) => {
    Transport.bpm.value = bpm;
    dispatch(_setBPM(bpm));
  };

// Set the time signature
export const setTransportTimeSignature =
  (timeSignature: [number, number]): AppThunk =>
  (dispatch) => {
    Transport.timeSignature = timeSignature;
    dispatch(_setTimeSignature(timeSignature));
  };

// Set the volume
export const setTransportVolume =
  (volume: number): AppThunk =>
  (dispatch) => {
    getDestination().volume.value = volume;
    dispatch(_setVolume(volume));
  };

// Set the mute
export const setTransportMute =
  (mute: boolean): AppThunk =>
  (dispatch) => {
    getDestination().mute = mute;
    dispatch(_setMute(mute));
  };

// Set the loaded state
export const setTransportLoaded =
  (loaded: boolean): AppThunk =>
  (dispatch) => {
    dispatch(_setLoaded(loaded));
  };

// Load the transport
export const loadTransport = (): AppThunk => async (dispatch, getState) => {
  dispatch(setTransportLoaded(false));

  // Build the instruments
  const state = getState();
  const transport = selectTransport(state);
  const tracks = selectTracks(state);
  try {
    // Build the instruments
    await start();
    dispatch(buildInstruments(tracks));
    // Create the global instrument
    await createGlobalInstrument();
    // Set the transport from the state
    Transport.loop = transport.loop;
    Transport.loopStart = convertTimeToSeconds(transport, transport.loopStart);
    Transport.loopEnd = convertTimeToSeconds(transport, transport.loopEnd);
    Transport.bpm.value = transport.bpm;
    getDestination().volume.value = transport.volume;
  } catch (e) {
    console.error(e);
  } finally {
    // Load the transport
    dispatch(setTransportLoaded(true));
  }
};

type AudioFile = "webm";
export const downloadTransport =
  (fileType: AudioFile): AppThunk =>
  async (dispatch, getState) => {
    // Make sure the context is started
    if (getContext().state !== "running") return startTone(true);

    const state = getState();
    const lastTick = selectTransportEndTime(state);
    const lastSecond = convertTimeToSeconds(state.transport, lastTick);
    const duration = lastSecond * 1000;
    try {
      // Start recording
      RECORDER.start();
      dispatch(stopTransport());
      dispatch(startTransport());
      dispatch(_startRecording());
      await downloadFile(duration, fileType);
    } catch (err) {
      console.error(err);
    } finally {
      dispatch(stopTransport());
      dispatch(_stopRecording());
    }
  };

export const downloadFile = async (
  duration: Time,
  fileType: AudioFile
): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      RECORDER.stop().then((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `recording.${fileType}`;
        document.body.appendChild(link);
        link.href = url;
        link.click();
        document.body.removeChild(link);
        resolve();
      });
    }, duration);
  });
};

export const cancelDownload = (): AppThunk => (dispatch) => {
  const recorder = RECORDER;
  if (!recorder) return;

  recorder.stop();
  dispatch(_stopRecording());
};
