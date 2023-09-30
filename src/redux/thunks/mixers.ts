import { MAX_VOLUME, MIN_VOLUME } from "appConstants";
import { clamp } from "lodash";
import {
  selectMixerById,
  selectPatternTrack,
  selectPatternTrackByMixerId,
} from "redux/selectors";
import { updateMixer } from "redux/slices/mixers";
import { AppThunk } from "redux/store";
import { MixerId, TrackId } from "types";
import { INSTRUMENTS } from "types/instrument";

export const setMixerVolume =
  (mixerId: MixerId, volume: number): AppThunk =>
  (dispatch, getState) => {
    // Get the state mixer
    const state = getState();
    const stateMixer = selectMixerById(state, mixerId);
    if (!stateMixer) return;

    // Get the live mixer
    const track = selectPatternTrackByMixerId(state, mixerId);
    if (!track) return;
    const liveMixer = INSTRUMENTS[track.id]?.mixer;
    if (!liveMixer) return;

    // Update the state mixer
    const value = clamp(volume, MIN_VOLUME, MAX_VOLUME);
    dispatch(
      updateMixer({ mixerId: stateMixer.id, update: { volume: value } })
    );

    // Update the live mixer
    liveMixer.volume = value;
  };

export const setMixerPan =
  (mixerId: MixerId, pan: number): AppThunk =>
  (dispatch, getState) => {
    // Get the state mixer
    const state = getState();
    const stateMixer = selectMixerById(state, mixerId);
    if (!stateMixer) return;

    // Get the live mixer
    const track = selectPatternTrackByMixerId(state, mixerId);
    if (!track) return;
    const liveMixer = INSTRUMENTS[track.id]?.mixer;
    if (!liveMixer) return;

    // Update the state mixer
    dispatch(updateMixer({ mixerId: stateMixer.id, update: { pan } }));

    // Update the live mixer
    liveMixer.pan = pan;
  };

export const setMixerMute =
  (mixerId: MixerId, mute: boolean): AppThunk =>
  (dispatch, getState) => {
    // Get the state mixer
    const state = getState();
    const stateMixer = selectMixerById(state, mixerId);
    if (!stateMixer) return;

    // Get the live mixer
    const track = selectPatternTrackByMixerId(state, mixerId);
    if (!track) return;
    const liveMixer = INSTRUMENTS[track.id]?.mixer;
    if (!liveMixer) return;

    // Update the state mixer
    dispatch(updateMixer({ mixerId: stateMixer.id, update: { mute } }));

    // Update the live mixer
    liveMixer.mute = mute;
  };

export const setMixerSolo =
  (mixerId: MixerId, solo: boolean): AppThunk =>
  (dispatch, getState) => {
    // Get the state mixer
    const state = getState();
    const stateMixer = selectMixerById(state, mixerId);
    if (!stateMixer) return;

    // Get the live mixer
    const track = selectPatternTrackByMixerId(state, mixerId);
    if (!track) return;
    const liveMixer = INSTRUMENTS[track.id]?.mixer;
    if (!liveMixer) return;

    // Update the state mixer
    dispatch(updateMixer({ mixerId: stateMixer.id, update: { solo } }));

    // Update the live mixer
    liveMixer.solo = solo;
  };

export const toggleTrackMute =
  (trackId: TrackId): AppThunk =>
  (dispatch, getState) => {
    // Get the state mixer
    const state = getState();
    const track = selectPatternTrack(state, trackId);
    if (!track) return;
    const stateMixer = selectMixerById(state, track.mixerId);
    if (!stateMixer) return;

    // Get the live mixer
    const liveMixer = INSTRUMENTS[track.id]?.mixer;
    if (!liveMixer) return;

    // Update the state mixer
    dispatch(
      updateMixer({
        mixerId: stateMixer.id,
        update: { mute: !stateMixer.mute },
      })
    );

    // Update the live mixer
    liveMixer.mute = !liveMixer.mute;
  };

export const toggleTrackSolo =
  (trackId: TrackId): AppThunk =>
  (dispatch, getState) => {
    // Get the state mixer
    const state = getState();
    const track = selectPatternTrack(state, trackId);
    if (!track) return;
    const stateMixer = selectMixerById(state, track.mixerId);
    if (!stateMixer) return;

    // Get the live mixer
    const liveMixer = INSTRUMENTS[track.id]?.mixer;
    if (!liveMixer) return;

    // Update the state mixer
    dispatch(
      updateMixer({
        mixerId: stateMixer.id,
        update: { solo: !stateMixer.solo },
      })
    );

    // Update the live mixer
    liveMixer.solo = !liveMixer.solo;
  };
