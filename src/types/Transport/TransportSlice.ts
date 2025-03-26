import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { MAX_BPM, MAX_VOLUME, MIN_BPM, MIN_VOLUME } from "utils/constants";
import { clamp } from "lodash";
import { defaultTransport } from "types/Transport/TransportTypes";
import { BPM, Tick, Volume } from "types/units";
import { Action, unpackAction } from "lib/redux";

// ------------------------------------------------------------
// Transport Slice Definition
// ------------------------------------------------------------

export const transportSlice = createSlice({
  name: "transport",
  initialState: defaultTransport,
  reducers: {
    /** (PRIVATE) Set the transport loop to the given boolean. */
    _loopTransport: (state, action: PayloadAction<boolean>) => {
      state.loop = action.payload;
    },
    /** (PRIVATE) Set the transport loop start to the given tick. */
    _setLoopStart: (state, action: PayloadAction<Tick>) => {
      state.loopStart = action.payload;
    },
    /** (PRIVATE) Set the transport loop end to the given tick. */
    _setLoopEnd: (state, action: PayloadAction<Tick>) => {
      state.loopEnd = action.payload;
    },
    /** (PRIVATE) Set the transport BPM to the given value. */
    _setBPM: (state, action: PayloadAction<BPM>) => {
      const bpm = action.payload;
      state.bpm = clamp(bpm, MIN_BPM, MAX_BPM);
    },
    /** (PRIVATE) Set the transport time signature to the given value. */
    _setTimeSignature: (state, action: PayloadAction<[number, number]>) => {
      state.timeSignature = action.payload;
    },
    /** (PRIVATE) Set the transport volume to the given value. */
    _setVolume: (state, action: Action<Volume>) => {
      const volume = unpackAction(action);
      state.volume = clamp(volume, MIN_VOLUME, MAX_VOLUME);
    },
    /** (PRIVATE) Set the transport mute to true or false. */
    _setMute: (state, action: PayloadAction<boolean>) => {
      state.mute = action.payload;
    },
    /** Set the transport recording state to true or false. */
    setRecording: (state, action) => {
      state.recording = action.payload;
    },
    /** Set the transport downloading state to true or false. */
    setDownloading: (state, action) => {
      state.downloading = action.payload;
    },
  },
});

export const {
  _loopTransport,
  _setLoopStart,
  _setLoopEnd,
  _setBPM,
  _setTimeSignature,
  _setVolume,
  _setMute,
  setRecording,
  setDownloading,
} = transportSlice.actions;

export const privateTransportActions = [
  "transport/_loopTransport",
  "transport/_setLoopStart",
  "transport/_setLoopEnd",
  "transport/_setBPM",
  "transport/_setTimeSignature",
];

export default transportSlice.reducer;
