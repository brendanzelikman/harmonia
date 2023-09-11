import { selectMixerById, selectPatternTrackByMixerId } from "redux/selectors";
import { updateMixer } from "redux/slices/mixers";
import { AppThunk } from "redux/store";
import { MixerId } from "types";
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
    dispatch(updateMixer({ mixerId: stateMixer.id, update: { volume } }));

    // Update the live mixer
    liveMixer.volume = volume;
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
