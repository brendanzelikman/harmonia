import {
  updateMixerByTrackId,
  updateMixerEffectByTrackId,
} from "redux/slices/mixers";
import { AppThunk } from "redux/store";
import { INSTRUMENTS } from "types/instrument";
import {
  WarpProps,
  ReverbProps,
  ChorusProps,
  DelayProps,
  FilterProps,
} from "types/mixer";
import { TrackId } from "types/tracks";

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
  (dispatch) => {
    if (!INSTRUMENTS[trackId]?.mixer) return;
    const payload = { trackId, type: "delay" };
    INSTRUMENTS[trackId].mixer.updateEffectByType("delay", { ...delay });
    dispatch(updateMixerEffectByTrackId({ ...payload, update: { ...delay } }));
  };

export const setMixerFilter =
  (trackId: TrackId, filter: Partial<FilterProps>): AppThunk =>
  (dispatch) => {
    if (!INSTRUMENTS[trackId]?.mixer) return;
    const payload = { trackId, type: "filter" };
    INSTRUMENTS[trackId].mixer.updateEffectByType("filter", { ...filter });
    dispatch(updateMixerEffectByTrackId({ ...payload, update: { ...filter } }));
  };
