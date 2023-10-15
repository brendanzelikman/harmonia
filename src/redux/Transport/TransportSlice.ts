import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { MAX_BPM, MAX_VOLUME, MIN_BPM, MIN_VOLUME } from "appConstants";
import { clamp } from "lodash";
import { defaultTransport } from "types/Transport";
import { BPM, Tick, Volume } from "types/units";

/**
 * The transport slice is responsible for synchronizing the Tone.js Transport with the Redux store.
 * It contains the state of the transport, such as the current tick, the current BPM, etc.
 * Some actions are underscored to indicate that they should not be called directly.
 * Instead, they should be called by the corresponding thunk.
 *
 * @property `_startTransport` - Set the transport state to "started".
 * @property `_stopTransport` - Set the transport state to "stopped" and reset the tick to 0.
 * @property `_pauseTransport` - Set the transport state to "paused".
 * @property `_loopTransport` - Set the transport loop to true or false.
 * @property `_setLoopStart` - Set the transport loop start to the given tick.
 * @property `_setLoopEnd` - Set the transport loop end to the given tick.
 * @property `_setBPM` - Set the transport BPM to the given value.
 * @property `_setTimeSignature` - Set the transport time signature to the given value.
 * @property `_setVolume` - Set the transport volume to the given value.
 * @property `_setMute` - Set the transport mute to true or false.
 * @property `setLoaded` - Set the transport loaded state to true or false.
 * @property `setLoading` - Set the transport loading state to true or false.
 * @property `setRecording` - Set the transport recording state to true or false.
 * @property `setDownloading` - Set the transport downloading state to true or false.
 *
 */
export const transportSlice = createSlice({
  name: "transport",
  initialState: defaultTransport,
  reducers: {
    /**
     * Set the transport state to "started".
     * @param state - The current transport state.
     */
    _startTransport: (state) => {
      state.state = "started";
    },
    /**
     * Set the transport state to "stopped" and reset the tick to 0.
     * @param state - The current transport state.
     */
    _stopTransport: (state) => {
      state.state = "stopped";
    },
    /**
     * Set the transport state to "paused".
     * @param state - The current transport state.
     */
    _pauseTransport: (state) => {
      state.state = "paused";
    },
    /**
     * Set the transport loop to true or false.
     * @param state - The current transport state.
     * @param action - The payload action containing the loop value.
     */
    _loopTransport: (state, action: PayloadAction<boolean>) => {
      state.loop = action.payload;
    },
    /**
     * Set the transport loop start to the given tick.
     * @param state - The current transport state.
     * @param action - The payload action containing the loop start tick.
     */
    _setLoopStart: (state, action: PayloadAction<Tick>) => {
      state.loopStart = action.payload;
    },
    /**
     * Set the transport loop end to the given tick.
     * @param state - The current transport state.
     * @param action - The payload action containing the loop end tick.
     */
    _setLoopEnd: (state, action: PayloadAction<Tick>) => {
      state.loopEnd = action.payload;
    },
    /**
     * Set the transport BPM to the given value.
     * @param state - The current transport state.
     * @param action - The payload action containing the BPM value.
     */
    _setBPM: (state, action: PayloadAction<BPM>) => {
      const bpm = action.payload;
      state.bpm = clamp(bpm, MIN_BPM, MAX_BPM);
    },
    /**
     * Set the transport time signature to the given value.
     * @param state - The current transport state.
     * @param action - The payload action containing the time signature value.
     */
    _setTimeSignature: (state, action: PayloadAction<[number, number]>) => {
      state.timeSignature = action.payload;
    },
    /**
     * Set the transport volume to the given value.
     * @param state - The current transport state.
     * @param action - The payload action containing the volume value.
     */
    _setVolume: (state, action: PayloadAction<Volume>) => {
      const volume = action.payload;
      state.volume = clamp(volume, MIN_VOLUME, MAX_VOLUME);
    },
    /**
     * Set the transport mute to true or false.
     * @param state - The current transport state.
     * @param action - The payload action containing the mute value.
     */
    _setMute: (state, action: PayloadAction<boolean>) => {
      state.mute = action.payload;
    },
    /**
     * Set the transport loaded state to true or false.
     * @param state - The current transport state.
     * @param action - The payload action containing the loaded value.
     */
    setLoaded: (state, action) => {
      state.loaded = action.payload;
    },
    /**
     * Set the transport loading state to true or false.
     * @param state - The current transport state.
     * @param action - The payload action containing the loading value.
     */
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    /**
     * Set the transport recording state to true or false.
     * @param state - The current transport state.
     * @param action - The payload action containing the recording value.
     */
    setRecording: (state, action) => {
      state.recording = action.payload;
    },
    /**
     * Set the transport downloading state to true or false.
     * @param state - The current transport state.
     * @param action - The payload action containing the downloading value.
     */
    setDownloading: (state, action) => {
      state.downloading = action.payload;
    },
  },
});

export const {
  _startTransport,
  _stopTransport,
  _pauseTransport,
  _loopTransport,
  _setLoopStart,
  _setLoopEnd,
  _setBPM,
  _setTimeSignature,
  _setVolume,
  _setMute,
  setLoaded,
  setLoading,
  setRecording,
  setDownloading,
} = transportSlice.actions;

export default transportSlice.reducer;
