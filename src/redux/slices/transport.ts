import { BPM, Time, Volume } from "types/units";
import { PlaybackState, Time as ToneTime, Transport } from "tone";
import { createSlice } from "@reduxjs/toolkit";

import {
  DEFAULT_BPM,
  MAX_BPM,
  MAX_VOLUME,
  MIN_BPM,
  MIN_VOLUME,
} from "appConstants";

import { clamp } from "lodash";

// The transport is synchronized with the Tone.js audio context
export interface Transport {
  time: Time; // Current time in ticks
  state: PlaybackState;
  bpm: BPM;
  loop: boolean;
  loopStart: Time;
  loopEnd: Time;
  volume: Volume;
  mute: boolean;
  timeSignature: [number, number];
  loaded: boolean;
  recording: boolean;
}

export const defaultTransport: Transport = {
  time: 0,
  state: "stopped",
  bpm: DEFAULT_BPM,
  loop: false,
  loopStart: 0,
  loopEnd: 15,
  volume: -6,
  mute: false,
  timeSignature: [16, 16],
  loaded: false,
  recording: false,
};

export const transportSlice = createSlice({
  name: "transport",
  initialState: defaultTransport,
  reducers: {
    _startTransport: (state) => {
      state.state = "started";
    },
    _stopTransport: (state) => {
      state.time = 0;
      state.state = "stopped";
    },
    _pauseTransport: (state) => {
      state.state = "paused";
    },
    _seekTransport: (state, action) => {
      state.time = action.payload;
    },
    _loopTransport: (state, action) => {
      state.loop = action.payload;
    },
    _setLoopStart: (state, action) => {
      state.loopStart = action.payload;
    },
    _setLoopEnd: (state, action) => {
      state.loopEnd = action.payload;
    },
    _setBPM: (state, action) => {
      const bpm = action.payload;
      state.bpm = clamp(bpm, MIN_BPM, MAX_BPM);
    },
    _setTimeSignature: (state, action) => {
      state.timeSignature = action.payload;
    },
    _setVolume: (state, action) => {
      const volume = action.payload;
      state.volume = clamp(volume, MIN_VOLUME, MAX_VOLUME);
    },
    _setMute: (state, action) => {
      state.mute = action.payload;
    },
    _setLoaded: (state, action) => {
      state.loaded = action.payload;
    },
    _startRecording: (state) => {
      state.recording = true;
    },
    _stopRecording: (state) => {
      state.recording = false;
    },
  },
});

export const {
  _pauseTransport,
  _seekTransport,
  _loopTransport,
  _setLoopStart,
  _setLoopEnd,
  _setBPM,
  _setTimeSignature,
  _setVolume,
  _setMute,
  _setLoaded,
} = transportSlice.actions;

export default transportSlice.reducer;

export const convertTimeToSeconds = (
  transport: Transport,
  time: Time
): number => {
  const numerator = transport.timeSignature?.[0] ?? 16;
  const denominator = transport.timeSignature?.[1] ?? 16;
  const beatsPerMeasure = numerator / denominator;
  const beatDuration = 60 / transport.bpm;
  const sixteenthDuration = beatDuration / 4;
  return time * sixteenthDuration;
  // return ToneTime(time * beatsPerMeasure * beatDuration).toSeconds();
};
