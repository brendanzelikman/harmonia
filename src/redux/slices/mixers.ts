import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { selectTransport } from "redux/selectors";
import { AppThunk } from "redux/store";
import { initializeState } from "redux/util";
import { INSTRUMENTS } from "types/instrument";
import {
  Mixer,
  WarpProps,
  ReverbProps,
  ChorusProps,
  DelayProps,
  Effect,
  EffectType,
  FilterProps,
  MixerId,
} from "types/mixer";
import { TrackId } from "types/tracks";
import { convertTimeToSeconds } from "./transport";

interface TrackMixer extends Mixer {
  trackId: TrackId;
  id: MixerId;
}

const initialState = initializeState<MixerId, TrackMixer>([]);

const updateMixerEffectByIndex = (
  mixer: Mixer,
  index: number,
  update: Partial<Effect>
): Mixer => {
  return {
    ...mixer,
    effects: mixer.effects.map((effect, i) => {
      if (i !== index) return effect;
      return { ...effect, ...update };
    }),
  };
};

const updateMixerByType = (
  mixer: Mixer,
  type: EffectType,
  update: Partial<Effect>
): Mixer => {
  const index = mixer.effects.findIndex((effect) => type === effect.type);
  if (index === -1) return mixer;
  return updateMixerEffectByIndex(mixer, index, update);
};

const mixersSlice = createSlice({
  name: "mixers",
  initialState,
  reducers: {
    addMixer: (state, action: PayloadAction<Mixer>) => {
      const mixer = action.payload;
      state.allIds.push(mixer.id);
      state.byId[mixer.id] = mixer;
    },
    updateMixerByTrackId: (state, action) => {
      const { trackId, ...update } = action.payload;
      const mixer = Object.values(state.byId).find(
        (mixer) => mixer.trackId === trackId
      );
      if (!mixer) return;
      state.byId[mixer.id] = { ...mixer, ...update };
    },
    updateMixerEffectByTrackId: (state, action) => {
      const { trackId, type, update } = action.payload;
      const mixer = Object.values(state.byId).find(
        (mixer) => mixer.trackId === trackId
      );
      if (!mixer) return;
      state.byId[mixer.id] = updateMixerByType(mixer, type, { ...update });
    },
    removeMixer: (state, action: PayloadAction<TrackId>) => {
      const trackId = action.payload;
      const mixer = Object.values(state.byId).find(
        (mixer) => mixer.trackId === trackId
      );
      if (!mixer) return;
      delete state.byId[mixer.id];
      const index = state.allIds.findIndex((id) => id === mixer.id);
      if (index === -1) return;
      state.allIds.splice(index, 1);
    },
  },
});

export const {
  addMixer,
  updateMixerByTrackId,
  updateMixerEffectByTrackId,
  removeMixer,
} = mixersSlice.actions;

export const setMixerVolume =
  (trackId: TrackId, volume: number): AppThunk =>
  (dispatch) => {
    if (!INSTRUMENTS[trackId]?.mixer) return;
    INSTRUMENTS[trackId].mixer.volume = volume;
    dispatch(updateMixerByTrackId({ trackId, volume }));
  };

export const setMixerPan =
  (trackId: TrackId, pan: number): AppThunk =>
  (dispatch) => {
    if (!INSTRUMENTS[trackId]?.mixer) return;
    INSTRUMENTS[trackId].mixer.pan = pan;
    dispatch(updateMixerByTrackId({ trackId, pan }));
  };

export const setMixerMute =
  (trackId: TrackId, mute: boolean): AppThunk =>
  (dispatch) => {
    if (!INSTRUMENTS[trackId]?.mixer) return;
    INSTRUMENTS[trackId].mixer.mute = mute;
    dispatch(updateMixerByTrackId({ trackId, mute }));
  };

export const setMixerSolo =
  (trackId: TrackId, solo: boolean): AppThunk =>
  (dispatch) => {
    if (!INSTRUMENTS[trackId]?.mixer) return;
    INSTRUMENTS[trackId].mixer.solo = solo;
    dispatch(updateMixerByTrackId({ trackId, solo }));
  };

export const setMixerWarp =
  (trackId: TrackId, warp: Partial<WarpProps>): AppThunk =>
  (dispatch) => {
    if (!INSTRUMENTS[trackId]?.mixer) return;
    const payload = { trackId, type: "warp" };
    INSTRUMENTS[trackId].mixer.updateEffectByType("warp", { ...warp });
    dispatch(updateMixerEffectByTrackId({ ...payload, update: { ...warp } }));
  };

export const setMixerReverb =
  (trackId: TrackId, reverb: Partial<ReverbProps>): AppThunk =>
  (dispatch) => {
    if (!INSTRUMENTS[trackId]?.mixer) return;
    const payload = { trackId, type: "reverb" };
    INSTRUMENTS[trackId].mixer.updateEffectByType("reverb", { ...reverb });
    dispatch(updateMixerEffectByTrackId({ ...payload, update: { ...reverb } }));
  };

export const setMixerChorus =
  (trackId: TrackId, chorus: Partial<ChorusProps>): AppThunk =>
  (dispatch) => {
    if (!INSTRUMENTS[trackId]?.mixer) return;
    const payload = { trackId, type: "chorus" };
    INSTRUMENTS[trackId].mixer.updateEffectByType("chorus", { ...chorus });
    dispatch(updateMixerEffectByTrackId({ ...payload, update: { ...chorus } }));
  };

export const setMixerDelay =
  (trackId: TrackId, delay: Partial<DelayProps>): AppThunk =>
  (dispatch, getState) => {
    if (!INSTRUMENTS[trackId]?.mixer) return;
    const state = getState();
    const transport = selectTransport(state);
    const payload = { trackId, type: "delay" };
    const incomingDelay = delay?.delay
      ? convertTimeToSeconds(transport, Number(delay.delay))
      : undefined;
    INSTRUMENTS[trackId].mixer.updateEffectByType("delay", {
      ...delay,
      delay: incomingDelay,
    });
    dispatch(
      updateMixerEffectByTrackId({
        ...payload,
        update: { ...delay, delay: incomingDelay },
      })
    );
  };

export const setMixerFilter =
  (trackId: TrackId, filter: Partial<FilterProps>): AppThunk =>
  (dispatch) => {
    if (!INSTRUMENTS[trackId]?.mixer) return;
    const payload = { trackId, type: "filter" };
    INSTRUMENTS[trackId].mixer.updateEffectByType("filter", { ...filter });
    dispatch(updateMixerEffectByTrackId({ ...payload, update: { ...filter } }));
  };

export default mixersSlice.reducer;
