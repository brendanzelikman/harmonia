import { BPM, Tick, Time } from "types/units";
import { createSlice } from "@reduxjs/toolkit";
import { MAX_BPM, MAX_VOLUME, MIN_BPM, MIN_VOLUME } from "appConstants";
import { clamp } from "lodash";
import { MIDI } from "types/midi";
import { Transport, defaultTransport } from "types/transport";

export const transportSlice = createSlice({
  name: "transport",
  initialState: defaultTransport,
  reducers: {
    _startTransport: (state) => {
      state.state = "started";
    },
    _stopTransport: (state) => {
      state.tick = 0;
      state.state = "stopped";
    },
    _pauseTransport: (state) => {
      state.state = "paused";
    },
    _seekTransport: (state, action) => {
      state.tick = action.payload;
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
    setLoaded: (state, action) => {
      state.loaded = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
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
  setLoaded,
  setLoading,
} = transportSlice.actions;

export default transportSlice.reducer;

export const convertTicksToSeconds = (
  transport: Transport,
  ticks: Tick
): Time => {
  return MIDI.ticksToSeconds(ticks, transport.bpm);
};

export const convertSecondsToTicks = (
  transport: Transport,
  time: Time
): Tick => {
  return MIDI.secondsToTicks(time, transport.bpm);
};
