import { beatsToSubdivision } from "appUtil";
import { startTone } from "index";
import { RECORDER } from "providers/recorder";
import {
  selectTransport,
  selectClipsAtTime,
  selectClipChordAtTime,
  selectPatternTrack,
  selectTransportEndTime,
} from "redux/selectors";
import { convertTimeToSeconds, transportSlice } from "redux/slices/transport";
import { AppThunk } from "redux/store";
import { getContext, Transport } from "tone";
import { getSampler } from "types/instrument";
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
