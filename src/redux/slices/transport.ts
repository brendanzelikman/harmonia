import { BPM, Time, Volume } from "types/units";
import {
  getDestination,
  PlaybackState,
  start,
  Time as ToneTime,
  Transport,
} from "tone";
import { createSlice } from "@reduxjs/toolkit";
import { AppThunk } from "../store";
import { selectTransport } from "redux/selectors/transport";
import { selectTracks } from "redux/selectors";
import { buildInstruments, createGlobalInstrument } from "types/instrument";

import {
  DEFAULT_BPM,
  MAX_BPM,
  MAX_SUBDIVISION,
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
    _setVolume: (state, action) => {
      const volume = action.payload;
      state.volume = clamp(volume, MIN_VOLUME, MAX_VOLUME);
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

const {
  _pauseTransport,
  _seekTransport,
  _loopTransport,
  _setLoopStart,
  _setLoopEnd,
  _setBPM,
  _setVolume,
  _setLoaded,
} = transportSlice.actions;

export default transportSlice.reducer;

export const convertTimeToSeconds = (
  transport: Transport,
  time: Time
): number => {
  const multiplier = (60 / transport.bpm) * (4 / MAX_SUBDIVISION);
  return ToneTime(time * multiplier).toSeconds();
};

// Seek the transport
export const seekTransport =
  (time: Time): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const transport = selectTransport(state);
    Transport.position = convertTimeToSeconds(transport, time);
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

// Set the volume
export const setTransportVolume =
  (volume: number): AppThunk =>
  (dispatch) => {
    getDestination().volume.value = volume;
    dispatch(_setVolume(volume));
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
