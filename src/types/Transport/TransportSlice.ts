import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { MAX_BPM, MAX_VOLUME, MIN_BPM, MIN_VOLUME } from "utils/constants";
import { clamp } from "lodash";
import { defaultTransport } from "types/Transport/TransportTypes";
import { BPM, Tick, Volume } from "types/units";
import { getTransport } from "tone";

// ------------------------------------------------------------
// Transport Slice Definition
// ------------------------------------------------------------

export const transportSlice = createSlice({
  name: "transport",
  initialState: defaultTransport,
  reducers: {
    /** Set the transport BPM to the given value. */
    setBPM: (state, action: PayloadAction<BPM>) => {
      state.bpm = clamp(action.payload, MIN_BPM, MAX_BPM);
      getTransport().bpm.value = state.bpm;
    },
    /** Set the transport time signature to the given value. */
    setTimeSignature: (state, action: PayloadAction<number>) => {
      state.timeSignature = action.payload;
    },
    /** Set the transport swing to the given value. */
    setSwing: (state, action: PayloadAction<number>) => {
      state.swing = clamp(action.payload, 0, 1);
    },
    /** Set the transport loop to the given boolean. */
    setLoop: (state, action: PayloadAction<boolean | undefined>) => {
      if (action.payload === undefined) state.loop = !state.loop;
      else state.loop = action.payload;
    },
    /** Set the transport loop start to the given tick. */
    setLoopStart: (state, action: PayloadAction<Tick>) => {
      if (action.payload >= state.loopEnd) return;
      state.loopStart = action.payload;
    },
    /** Set the transport loop end to the given tick. */
    setLoopEnd: (state, action: PayloadAction<Tick>) => {
      if (action.payload <= state.loopStart) return;
      state.loopEnd = action.payload;
    },
    /** Set the transport volume to the given value. */
    setVolume: (state, action: PayloadAction<Volume>) => {
      state.volume = clamp(action.payload, MIN_VOLUME, MAX_VOLUME);
    },
    /** Set the transport mute to true or false. */
    setMute: (state, action: PayloadAction<boolean | undefined>) => {
      if (action.payload === undefined) state.mute = !state.mute;
      else state.mute = action.payload;
    },
    /** Set the transport scroll to the given value. */
    setScroll: (state, action: PayloadAction<number | undefined>) => {
      state.scroll = action.payload;
    },
  },
});

export const {
  setBPM,
  setTimeSignature,
  setSwing,
  setLoop,
  setLoopStart,
  setLoopEnd,
  setVolume,
  setMute,
  setScroll,
} = transportSlice.actions;

export const privateTransportActions = [
  "transport/setVolume",
  "transport/setMute",
];
