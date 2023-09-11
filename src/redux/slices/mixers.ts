import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { union } from "lodash";
import { initializeState } from "redux/util";
import { getLiveMixer, INSTRUMENTS, MixerInstance } from "types";
import { Mixer, Effect, MixerId, EffectId, EffectType } from "types";
import { TrackId } from "types/tracks";

interface TrackMixer extends Mixer {
  trackId: TrackId;
  id: MixerId;
}

const initialState = initializeState<MixerId, TrackMixer>([]);

const updateMixerEffectById = (
  mixer: Mixer,
  effectId: EffectId,
  update: Partial<Effect>
): Mixer => {
  return {
    ...mixer,
    effects: mixer.effects.map((effect) => {
      if (effect.id !== effectId) return effect;
      return { ...effect, ...update };
    }),
  };
};

const mixersSlice = createSlice({
  name: "mixers",
  initialState,
  reducers: {
    addMixer: (state, action: PayloadAction<Mixer>) => {
      const mixer = action.payload;
      state.allIds = union(state.allIds, [mixer.id]);
      state.byId[mixer.id] = mixer;
    },
    addMixerEffect: (
      state,
      action: PayloadAction<{ mixerId: MixerId; type: EffectType }>
    ) => {
      const { mixerId, type } = action.payload;
      const mixer = state.byId[mixerId];
      if (!mixer) return;

      // Add the effect to the live instrument
      const mixerInstrument = getLiveMixer(mixer);
      if (!mixerInstrument) return;
      const effectId = mixerInstrument.addEffect(type);

      // Add the effect to the state
      mixer.effects.push({
        ...MixerInstance.defaultEffect(type),
        id: effectId,
        type,
      });
    },
    updateMixer: (
      state,
      action: PayloadAction<{
        mixerId: MixerId;
        update: Partial<Mixer>;
      }>
    ) => {
      const { mixerId, update } = action.payload;
      const mixer = state.byId[mixerId];
      if (!mixer) return;

      // Update the mixer in the state
      state.byId[mixer.id] = { ...mixer, ...update };
    },
    updateMixerEffect: (
      state,
      action: PayloadAction<{
        mixerId: MixerId;
        effectId: EffectId;
        update: Partial<Effect>;
      }>
    ) => {
      const { mixerId, effectId, update } = action.payload;
      const mixer = state.byId[mixerId];
      if (!mixer) return;

      // Update the effect in the live instrument
      const mixerInstrument = getLiveMixer(mixer);
      if (!mixerInstrument) return;
      mixerInstrument.updateEffectById(effectId, update);

      // Update the effect in the state
      state.byId[mixerId] = updateMixerEffectById(mixer, effectId, {
        ...update,
      });
    },

    rearrangeMixerEffect: (
      state,
      action: PayloadAction<{
        mixerId: MixerId;
        effectId: EffectId;
        index: number;
      }>
    ) => {
      const { mixerId, effectId, index } = action.payload;
      const mixer = state.byId[mixerId];
      if (!mixer) return;

      // Get the live instrument
      const mixerInstrument = getLiveMixer(mixer);
      if (!mixerInstrument) return;

      // Get the old index of the effect
      const oldIndex = mixer.effects.findIndex(({ id }) => id === effectId);
      if (oldIndex === -1) return;
      if (index === oldIndex) return;

      // Move the effect in the live instrument
      mixerInstrument.rearrangeEffectById(effectId, index);

      // Move the effect in the state
      const effect = mixer.effects[oldIndex];
      mixer.effects.splice(oldIndex, 1);
      mixer.effects.splice(index, 0, effect);
    },
    removeMixer: (
      state,
      action: PayloadAction<{ mixerId: MixerId; trackId: TrackId }>
    ) => {
      const { mixerId } = action.payload;
      const mixer = state.byId[mixerId];
      if (!mixer) return;

      // Remove the mixer from the live instrument
      const mixerInstrument = getLiveMixer(mixer);
      if (!mixerInstrument) return;
      mixerInstrument?.dispose();

      // Remove the mixer from the state
      delete state.byId[mixerId];
      const index = state.allIds.findIndex((id) => id === mixerId);
      if (index === -1) return;
      state.allIds.splice(index, 1);
    },
    removeMixerEffect: (
      state,
      action: PayloadAction<{ mixerId: MixerId; effectId: EffectId }>
    ) => {
      const { mixerId, effectId } = action.payload;
      const mixer = Object.values(state.byId).find(({ id }) => id === mixerId);
      if (!mixer) return;

      // Remove the effect from the live instrument
      const mixerInstrument = getLiveMixer(mixer);
      if (!mixerInstrument) return;
      mixerInstrument.removeEffectById(effectId);

      // Remove the effect from the state
      const index = mixer.effects.findIndex(({ id }) => id === effectId);
      if (index === -1) return;
      mixer.effects.splice(index, 1);
    },
    resetMixerEffect: (
      state,
      action: PayloadAction<{ mixerId: MixerId; effectId: EffectId }>
    ) => {
      const { mixerId, effectId } = action.payload;
      const mixer = state.byId[mixerId];
      if (!mixer) return;

      // Get the effect from the state
      const index = mixer.effects.findIndex(({ id }) => id === effectId);
      if (index === -1) return;
      const effect = mixer.effects[index];
      if (!effect) return;

      // Reset the effect in the live instrument
      const mixerInstrument = getLiveMixer(mixer);
      if (!mixerInstrument) return;
      mixerInstrument.resetEffect(effect);

      // Reset the effect in the state
      mixer.effects[index] = {
        ...effect,
        ...MixerInstance.defaultEffect(effect.type),
        id: effectId,
      };
    },
    removeAllMixerEffects: (state, action: PayloadAction<MixerId>) => {
      const mixerId = action.payload;
      const mixer = state.byId[mixerId];
      if (!mixer) return;

      // Remove all effects from the live instrument
      const mixerInstrument = getLiveMixer(mixer);
      if (!mixerInstrument) return;
      mixerInstrument.removeAllEffects();

      // Remove all effects from the state
      mixer.effects = [];
    },
  },
});

export const {
  addMixer,
  addMixerEffect,
  updateMixer,
  updateMixerEffect,
  rearrangeMixerEffect,
  removeMixer,
  removeMixerEffect,
  resetMixerEffect,
  removeAllMixerEffects,
} = mixersSlice.actions;

export default mixersSlice.reducer;
