import {
  createEntityAdapter,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import { clamp, union } from "lodash";
import { Instrument, InstrumentId } from "./InstrumentTypes";
import { SafeEffect, EffectId, EffectKey } from "./InstrumentEffectTypes";
import { MAX_PAN, MAX_VOLUME, MIN_PAN, MIN_VOLUME } from "utils/constants";
import { LIVE_AUDIO_INSTANCES, LiveAudioInstance } from "./InstrumentClass";
import { TrackId } from "types/Track/TrackTypes";
import { Action, unpackAction } from "lib/redux";

// ------------------------------------------------------------
// Payload Types
// ------------------------------------------------------------

/** An `Instrument` can be added with a `PatternTrack` to the store. */
export type AddInstrumentPayload = {
  instrument: Instrument;
};

/** An `Instrument` can be separately added for the OfflineAudioContext. */
export type AddOfflineInstrumentPayload = { instrument: Instrument };

/** An `InstrumentEffect` can be added to an `Instrument` by key. */
export type AddInstrumentEffectPayload = {
  id: InstrumentId;
  key: EffectKey;
};

/** An `Instrument` can be updated by ID. */
export type UpdateInstrumentPayload = {
  id: InstrumentId;
  update: Partial<Instrument>;
};

/** An `InstrumentEffect` can be updated by ID. */
export type UpdateInstrumentEffectPayload = {
  id: InstrumentId;
  effectId: EffectId;
  update: Partial<SafeEffect>;
};

/** An `InstrumentEffect` can be rearranged to a new index. */
export type RearrangeInstrumentEffectPayload = {
  id: InstrumentId;
  effectId: EffectId;
  index: number;
};

/** An `InstrumentEffect` can be removed by ID. */
export type RemoveInstrumentEffectPayload = {
  id: InstrumentId;
  effectId: EffectId;
};

/** An `InstrumentEffect` can be reset by ID. */
export type ResetInstrumentEffectPayload = {
  id: InstrumentId;
  effectId: EffectId;
};

/** All `InstrumentEffects` can be removed from an `Instrument`. */
export type RemoveAllInstrumentEffectsPayload = InstrumentId;

/** An `Instrument` can be muted or unmuted. */
export type ToggleInstrumentMutePayload = InstrumentId;

/** An `Instrument` can be soloed or unsoloed. */
export type ToggleInstrumentSoloPayload = InstrumentId;

// ------------------------------------------------------------
// Slice Definition
// ------------------------------------------------------------

const instrumentAdapter = createEntityAdapter<Instrument>();

export const instrumentsSlice = createSlice({
  name: "instruments",
  initialState: instrumentAdapter.getInitialState(),
  reducers: {
    /** Add an instrument to the slice. */
    addInstrument: (state, action: Action<AddInstrumentPayload>) => {
      const { instrument } = unpackAction(action);
      state.ids = union(state.ids, [instrument.id]);
      state.entities[instrument.id] = instrument;
    },
    /** (PRIVATE) Add an offline instrument. */
    addInstrumentOffline: (
      state,
      action: Action<AddOfflineInstrumentPayload>
    ) => {
      const { instrument } = unpackAction(action);
      state.ids = union(state.ids, [instrument.id]);
      state.entities[instrument.id] = instrument;
    },
    /** Update an instrument. */
    updateInstrument: (state, action: Action<UpdateInstrumentPayload>) => {
      const { id, update } = unpackAction(action);
      const instrument = state.entities[id];

      if (!instrument) return;

      // Update the instrument in the state
      state.entities[instrument.id] = { ...instrument, ...update };

      // Update the live instance if it exists
      const instance = LIVE_AUDIO_INSTANCES[id];
      if (!instance) return;

      // Recreate the sampler if the instrument key changed
      if (update.key !== undefined) {
        instance.key = update.key;
        LIVE_AUDIO_INSTANCES[id] = new LiveAudioInstance({
          ...instance.getInitializationProps(),
          key: update.key,
        });
      }

      // Update mute/solo
      if (update.mute !== undefined) instance.mute = update.mute;
      if (update.solo !== undefined) instance.solo = update.solo;

      // Clamp and update volume/pan
      if (update.volume !== undefined) {
        instance.volume = clamp(update.volume, MIN_VOLUME, MAX_VOLUME);
      }
      if (update.pan !== undefined) {
        instance.pan = clamp(update.pan, MIN_PAN, MAX_PAN);
      }
    },
    /** Remove an instrument from the slice. */
    removeInstrument: (
      state,
      action: Action<{
        id: InstrumentId;
        trackId: TrackId;
      }>
    ) => {
      const { id } = unpackAction(action);
      const instrument = state.entities[id];
      if (!instrument) return;

      // Remove the live instrument
      const instance = LIVE_AUDIO_INSTANCES[id];
      if (!instance) return;
      instance?.dispose();
      delete LIVE_AUDIO_INSTANCES[id];

      // Remove the instrument from the state
      delete state.entities[id];
      const index = state.ids.findIndex((i) => i === id);
      if (index === -1) return;
      state.ids.splice(index, 1);
    },
    /** Add an effect to an instrument. */
    addInstrumentEffect: (
      state,
      action: Action<AddInstrumentEffectPayload>
    ) => {
      const { id, key } = unpackAction(action);
      const instrument = state.entities[id];
      if (!instrument) return;

      // Add the effect to the live instance
      const liveInstance = LIVE_AUDIO_INSTANCES[id];
      if (!liveInstance) return;
      const effectId = liveInstance.addEffect(key);

      // Add the effect to the state
      instrument.effects.push({
        ...LiveAudioInstance.defaultEffect(key),
        id: effectId,
        key,
      });
    },
    /** Update an effect in an instrument. */
    updateInstrumentEffect: (
      state,
      action: Action<UpdateInstrumentEffectPayload>
    ) => {
      const { id, effectId, update } = unpackAction(action);
      const instrument = state.entities[id];
      if (!instrument) return;

      // Update the effect in the live instrument
      const instance = LIVE_AUDIO_INSTANCES[id];
      if (!instance) return;
      instance.updateEffectById(effectId, update);

      // Update the effect in the state
      state.entities[id] = {
        ...instrument,
        effects: instrument.effects.map((effect) => {
          if (effect.id !== effectId) return effect;
          return { ...effect, ...update };
        }),
      };
    },
    /** Remove an effect from an instrument. */
    removeInstrumentEffect: (
      state,
      action: Action<RemoveInstrumentEffectPayload>
    ) => {
      const { id, effectId } = unpackAction(action);
      const instrument = Object.values(state.entities).find(
        (i) => i?.id === id
      );
      if (!instrument) return;

      // Remove the effect from the live instrument
      const instance = LIVE_AUDIO_INSTANCES[id];
      if (!instance) return;
      instance.removeEffectById(effectId);

      // Remove the effect from the state
      const index = instrument.effects.findIndex(({ id }) => id === effectId);
      if (index === -1) return;
      instrument.effects.splice(index, 1);
    },
    /** Rearrange an instrument effect to a new index. */
    rearrangeInstrumentEffect: (
      state,
      action: Action<RearrangeInstrumentEffectPayload>
    ) => {
      const { id, effectId, index } = unpackAction(action);
      const instrument = state.entities[id];
      if (!instrument) return;

      // Get the live instrument
      const instance = LIVE_AUDIO_INSTANCES[id];
      if (!instance) return;

      // Get the old index of the effect
      const oldIndex = instrument.effects.findIndex(
        ({ id }) => id === effectId
      );
      if (oldIndex === -1) return;
      if (index === oldIndex) return;

      // Move the effect in the live instrument
      instance.rearrangeEffectById(effectId, index);

      // Move the effect in the state
      const effect = instrument.effects[oldIndex];
      instrument.effects.splice(oldIndex, 1);
      instrument.effects.splice(index, 0, effect);
    },
    /** Reset an effect of an instrument. */
    resetInstrumentEffect: (
      state,
      action: Action<ResetInstrumentEffectPayload>
    ) => {
      const { id, effectId } = unpackAction(action);
      const instrument = state.entities[id];
      if (!instrument) return;

      // Get the effect from the state
      const index = instrument.effects.findIndex(({ id }) => id === effectId);
      if (index === -1) return;
      const effect = instrument.effects[index];
      if (!effect) return;

      // Reset the effect in the live instrument
      const instance = LIVE_AUDIO_INSTANCES[id];
      if (!instance) return;
      instance.resetEffect(effect);

      // Reset the effect in the state
      instrument.effects[index] = {
        ...effect,
        ...LiveAudioInstance.defaultEffect(effect.key),
        id: effectId,
      };
    },
    /** Remove all effects from an instrument. */
    removeAllInstrumentEffects: (
      state,
      action: PayloadAction<RemoveAllInstrumentEffectsPayload>
    ) => {
      const id = action.payload;
      const instrument = state.entities[id];
      if (!instrument) return;

      // Remove all effects from the live instrument
      const instance = LIVE_AUDIO_INSTANCES[id];
      if (!instance) return;
      instance.removeAllEffects();

      // Remove all effects from the state
      instrument.effects = [];
    },
    /** Toggle an instrument's mute state. */
    toggleInstrumentMute: (
      state,
      action: PayloadAction<ToggleInstrumentMutePayload>
    ) => {
      const id = action.payload;
      const instrument = state.entities[id];
      if (!instrument) return;

      // Toggle mute in the live instrument
      const instance = LIVE_AUDIO_INSTANCES[id];
      if (!instance) return;
      instance.mute = !instance.mute;

      // Toggle mute in the state
      instrument.mute = !instrument.mute;
    },
    /** Toggle an instrument's solo state. */
    toggleInstrumentSolo: (
      state,
      action: PayloadAction<ToggleInstrumentSoloPayload>
    ) => {
      const id = action.payload;
      const instrument = state.entities[id];
      if (!instrument) return;

      // Toggle solo in the live instrument
      const instance = LIVE_AUDIO_INSTANCES[id];
      if (!instance) return;
      instance.solo = !instance.solo;

      // Toggle solo in the state
      instrument.solo = !instrument.solo;
    },
    /** Mute all instruments. */
    muteInstruments: (state) => {
      state.ids.forEach((id) => {
        // Mute the instrument
        const instrument = state.entities[id];
        if (instrument) instrument.mute = true;

        // Mute the instance
        const instance = LIVE_AUDIO_INSTANCES[id];
        if (instance) instance.mute = true;
      });
    },
    /** Unmute all instruments. */
    unmuteInstruments: (state) => {
      state.ids.forEach((id) => {
        // Unmute the instrument
        const instrument = state.entities[id];
        if (instrument) instrument.mute = false;

        // Unmute the instance
        const instance = LIVE_AUDIO_INSTANCES[id];
        if (instance) instance.mute = false;
      });
    },
    /** Solo all instruments. */
    soloInstruments: (state) => {
      state.ids.forEach((id) => {
        // Solo the instrument
        const instrument = state.entities[id];
        if (instrument) instrument.solo = true;

        // Solo the instance
        const instance = LIVE_AUDIO_INSTANCES[id];
        if (instance) instance.solo = true;
      });
    },
    /** Unsolo all instruments. */
    unsoloInstruments: (state) => {
      state.ids.forEach((id) => {
        // Unsolo the instrument
        const instrument = state.entities[id];
        if (instrument) instrument.solo = false;

        // Unsolo the instance
        const instance = LIVE_AUDIO_INSTANCES[id];
        if (instance) instance.solo = false;
      });
    },

    /** (PRIVATE) Remove an offline instrument. */
    _removeOfflineInstrument: (state, action: Action<InstrumentId>) => {
      const instrumentId = unpackAction(action);
      const instrument = state.entities[instrumentId];
      if (!instrument) return;

      // Remove the live instrument
      const instance = LIVE_AUDIO_INSTANCES[instrumentId];
      if (!instance) return;
      instance?.dispose();
      delete LIVE_AUDIO_INSTANCES[instrumentId];

      // Remove the instrument from the state
      delete state.entities[instrumentId];
      const index = state.ids.findIndex((id) => id === instrumentId);
      if (index === -1) return;
      state.ids.splice(index, 1);
    },
  },
});

export const {
  addInstrument,
  updateInstrument,
  removeInstrument,
  addInstrumentEffect,
  updateInstrumentEffect,
  removeInstrumentEffect,
  rearrangeInstrumentEffect,
  resetInstrumentEffect,
  removeAllInstrumentEffects,
  toggleInstrumentMute,
  toggleInstrumentSolo,
  muteInstruments,
  unmuteInstruments,
  soloInstruments,
  unsoloInstruments,
  addInstrumentOffline,
  _removeOfflineInstrument,
} = instrumentsSlice.actions;

export const PRIVATE_INSTRUMENT_ACTIONS = [
  "addInstrumentOffline",
  "_removeOfflineInstrument",
];

export default instrumentsSlice.reducer;
