import { createSlice, Middleware, PayloadAction } from "@reduxjs/toolkit";
import { clamp, union } from "lodash";
import {
  Instrument,
  InstrumentId,
  LiveAudioInstance,
  LIVE_AUDIO_INSTANCES,
  defaultInstrument,
} from "types/Instrument";
import {
  SafeEffect,
  EffectId,
  EffectKey,
} from "types/Instrument/InstrumentEffectTypes";
import { initializeState } from "types/util";
import { MAX_PAN, MAX_VOLUME, MIN_PAN, MIN_VOLUME } from "utils/constants";
import { UndoTypes } from "../undoTypes";
import { RootState } from "redux/store";
import {
  selectInstrumentIds,
  selectInstrumentMap,
} from "./InstrumentSelectors";
import { PatternTrack } from "types/PatternTrack";
import { TrackId } from "types/Track";

export const defaultInstrumentState = initializeState<InstrumentId, Instrument>(
  [defaultInstrument]
);

/**
 * An `Instrument` can be added with a `PatternTrack` to the store.
 */
export type AddInstrumentPayload = {
  track: PatternTrack;
  instrument: Instrument;
};

/**
 * An `Instrument` can also be added offline without a track.
 */
export type AddInstrumentOfflinePayload = Instrument;

/**
 * An `InstrumentEffect` can be added to an `Instrument` by key.
 */
export type AddInstrumentEffectPayload = {
  instrumentId: InstrumentId;
  key: EffectKey;
};

/**
 * An `Instrument` can be updated by ID.
 */
export type UpdateInstrumentPayload = {
  instrumentId: InstrumentId;
  update: Partial<Instrument>;
};

/**
 * An `InstrumentEffect` can be updated by ID.
 */
export type UpdateInstrumentEffectPayload = {
  instrumentId: InstrumentId;
  effectId: EffectId;
  update: Partial<SafeEffect>;
};

/**
 * An `InstrumentEffect` can be rearranged to a new index.
 */
export type RearrangeInstrumentEffectPayload = {
  instrumentId: InstrumentId;
  effectId: EffectId;
  index: number;
};

/**
 * An `Instrument` needs to be removed from the store with a track ID.
 */
export type RemoveInstrumentPayload = {
  trackId: TrackId;
  instrumentId: InstrumentId;
};

/**
 * An `InstrumentEffect` can be removed by ID.
 */
export type RemoveInstrumentEffectPayload = {
  instrumentId: InstrumentId;
  effectId: EffectId;
};

/**
 * An `InstrumentEffect` can be reset by ID.
 */
export type ResetInstrumentEffectPayload = {
  instrumentId: InstrumentId;
  effectId: EffectId;
};

/**
 * All `InstrumentEffects` can be removed from an `Instrument`.
 */
export type RemoveAllInstrumentEffectsPayload = InstrumentId;

/**
 * An `Instrument` can be muted or unmuted.
 */
export type ToggleInstrumentMutePayload = InstrumentId;

/**
 * An `Instrument` can be soloed or unsoloed.
 */
export type ToggleInstrumentSoloPayload = InstrumentId;

/**
 * The `InstrumentsSlice` stores all `Instrument` objects and effects.
 *
 * @property `addInstrument` - Add an instrument to the store.
 * @property `addInstrumentEffect` - Add an effect to an instrument.
 * @property `updateInstrument` - Update an instrument.
 * @property `updateInstrumentEffect` - Update an instrument effect.
 * @property `rearrangeInstrumentEffect` - Rearrange an instrument effect.
 * @property `removeInstrument` - Remove an instrument.
 * @property `removeInstrumentEffect` - Remove an instrument effect.
 * @property `resetInstrumentEffect` - Reset an instrument effect.
 * @property `removeAllInstrumentEffects` - Remove all effects from an instrument.
 * @property `toggleInstrumentMute` - Toggle an instrument's mute state.
 * @property `toggleInstrumentSolo` - Toggle an instrument's solo state.
 * @property `muteInstruments` - Mute all instruments.
 * @property `unmuteInstruments` - Unmute all instruments.
 * @property `soloInstruments` - Solo all instruments.
 * @property `unsoloInstruments` - Unsolo all instruments.
 *
 */
export const instrumentsSlice = createSlice({
  name: "instruments",
  initialState: defaultInstrumentState,
  reducers: {
    /**
     * Add an instrument to the store (online).
     * @param state The current state.
     * @param action The payload action containing the instrument.
     */
    addInstrument: (state, action: PayloadAction<AddInstrumentPayload>) => {
      const { instrument } = action.payload;
      state.allIds = union(state.allIds, [instrument.id]);
      state.byId[instrument.id] = instrument;
    },
    /**
     * Add an instrument to the store (offline)
     * @param state The current state.
     * @param action The payload action containing the instrument.
     */
    addInstrumentOffline: (
      state,
      action: PayloadAction<AddInstrumentOfflinePayload>
    ) => {
      const instrument = action.payload;
      state.allIds = union(state.allIds, [instrument.id]);
      state.byId[instrument.id] = instrument;
    },
    /**
     * Add an effect to an instrument.
     * @param state The current state.
     * @param action The payload action containing the instrument ID and effect key.
     */
    addInstrumentEffect: (
      state,
      action: PayloadAction<AddInstrumentEffectPayload>
    ) => {
      const { instrumentId, key } = action.payload;
      const instrument = state.byId[instrumentId];
      if (!instrument) return;

      // Add the effect to the live instance
      const liveInstance = LIVE_AUDIO_INSTANCES[instrumentId];
      if (!liveInstance) return;
      const effectId = liveInstance.addEffect(key);

      // Add the effect to the state
      instrument.effects.push({
        ...LiveAudioInstance.defaultEffect(key),
        id: effectId,
        key,
      });
    },
    /**
     * Update an instrument.
     * @param state The current state.
     * @param action The payload action containing the instrument ID and update.
     */
    updateInstrument: (
      state,
      action: PayloadAction<UpdateInstrumentPayload>
    ) => {
      const { instrumentId, update } = action.payload;
      const instrument = state.byId[instrumentId];
      if (!instrument) return;

      // Update the instrument in the state
      state.byId[instrument.id] = { ...instrument, ...update };

      // Update the live instance if it exists
      const instance = LIVE_AUDIO_INSTANCES[instrumentId];
      if (!instance) return;

      // Recreate the sampler if the instrument key changed
      if (update.key !== undefined) {
        instance.key = update.key;
        LIVE_AUDIO_INSTANCES[instrumentId] = new LiveAudioInstance({
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
    /**
     * Update an instrument effect.
     * @param state The current state.
     * @param action The payload action containing the instrument ID, effect ID, and update.
     */
    updateInstrumentEffect: (
      state,
      action: PayloadAction<UpdateInstrumentEffectPayload>
    ) => {
      const { instrumentId, effectId, update } = action.payload;
      const instrument = state.byId[instrumentId];
      if (!instrument) return;

      // Update the effect in the live instrument
      const instance = LIVE_AUDIO_INSTANCES[instrumentId];
      if (!instance) return;
      instance.updateEffectById(effectId, update);

      // Update the effect in the state
      state.byId[instrumentId] = {
        ...instrument,
        effects: instrument.effects.map((effect) => {
          if (effect.id !== effectId) return effect;
          return { ...effect, ...update };
        }),
      };
    },
    /**
     * Rearrange an instrument effect.
     * @param state The current state.
     * @param action The payload action containing the instrument ID, effect ID, and new index.
     */
    rearrangeInstrumentEffect: (
      state,
      action: PayloadAction<RearrangeInstrumentEffectPayload>
    ) => {
      const { instrumentId, effectId, index } = action.payload;
      const instrument = state.byId[instrumentId];
      if (!instrument) return;

      // Get the live instrument
      const instance = LIVE_AUDIO_INSTANCES[instrumentId];
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
    /**
     * Remove an instrument.
     * @param state The current state.
     * @param action The payload action containing the instrument ID.
     */
    removeInstrument: (
      state,
      action: PayloadAction<RemoveInstrumentPayload>
    ) => {
      const { instrumentId } = action.payload;
      const instrument = state.byId[instrumentId];
      if (!instrument) return;

      // Remove the live instrument
      const instance = LIVE_AUDIO_INSTANCES[instrumentId];
      if (!instance) return;
      instance?.dispose();
      delete LIVE_AUDIO_INSTANCES[instrumentId];

      // Remove the instrument from the state
      delete state.byId[instrumentId];
      const index = state.allIds.findIndex((id) => id === instrumentId);
      if (index === -1) return;
      state.allIds.splice(index, 1);
    },
    /**
     * Remove an instrument effect.
     * @param state The current state.
     * @param action The payload action containing the instrument ID and effect ID.
     */
    removeInstrumentEffect: (
      state,
      action: PayloadAction<RemoveInstrumentEffectPayload>
    ) => {
      const { instrumentId, effectId } = action.payload;
      const instrument = Object.values(state.byId).find(
        ({ id }) => id === instrumentId
      );
      if (!instrument) return;

      // Remove the effect from the live instrument
      const instance = LIVE_AUDIO_INSTANCES[instrumentId];
      if (!instance) return;
      instance.removeEffectById(effectId);

      // Remove the effect from the state
      const index = instrument.effects.findIndex(({ id }) => id === effectId);
      if (index === -1) return;
      instrument.effects.splice(index, 1);
    },
    /**
     * Reset an instrument effect.
     * @param state The current state.
     * @param action The payload action containing the instrument ID and effect ID.
     */
    resetInstrumentEffect: (
      state,
      action: PayloadAction<ResetInstrumentEffectPayload>
    ) => {
      const { instrumentId, effectId } = action.payload;
      const instrument = state.byId[instrumentId];
      if (!instrument) return;

      // Get the effect from the state
      const index = instrument.effects.findIndex(({ id }) => id === effectId);
      if (index === -1) return;
      const effect = instrument.effects[index];
      if (!effect) return;

      // Reset the effect in the live instrument
      const instance = LIVE_AUDIO_INSTANCES[instrumentId];
      if (!instance) return;
      instance.resetEffect(effect);

      // Reset the effect in the state
      instrument.effects[index] = {
        ...effect,
        ...LiveAudioInstance.defaultEffect(effect.key),
        id: effectId,
      };
    },
    /**
     * Remove all effects from an instrument.
     * @param state The current state.
     * @param action The payload action containing the instrument ID.
     */
    removeAllInstrumentEffects: (
      state,
      action: PayloadAction<RemoveAllInstrumentEffectsPayload>
    ) => {
      const instrumentId = action.payload;
      const instrument = state.byId[instrumentId];
      if (!instrument) return;

      // Remove all effects from the live instrument
      const instance = LIVE_AUDIO_INSTANCES[instrumentId];
      if (!instance) return;
      instance.removeAllEffects();

      // Remove all effects from the state
      instrument.effects = [];
    },
    /**
     * Toggle an instrument's mute state.
     * @param state The current state.
     * @param action The payload action containing the instrument ID.
     */
    toggleInstrumentMute: (
      state,
      action: PayloadAction<ToggleInstrumentMutePayload>
    ) => {
      const instrumentId = action.payload;
      const instrument = state.byId[instrumentId];
      if (!instrument) return;

      // Toggle mute in the live instrument
      const instance = LIVE_AUDIO_INSTANCES[instrumentId];
      if (!instance) return;
      instance.mute = !instance.mute;

      // Toggle mute in the state
      instrument.mute = !instrument.mute;
    },
    /**
     * Toggle an instrument's solo state.
     * @param state The current state.
     * @param action The payload action containing the instrument ID.
     */
    toggleInstrumentSolo: (
      state,
      action: PayloadAction<ToggleInstrumentSoloPayload>
    ) => {
      const instrumentId = action.payload;
      const instrument = state.byId[instrumentId];
      if (!instrument) return;

      // Toggle solo in the live instrument
      const instance = LIVE_AUDIO_INSTANCES[instrumentId];
      if (!instance) return;
      instance.solo = !instance.solo;

      // Toggle solo in the state
      instrument.solo = !instrument.solo;
    },
    /**
     * Mute all instruments.
     * @param state The current state.
     */
    muteInstruments: (state) => {
      state.allIds.forEach((id) => {
        const instrument = state.byId[id];
        if (!instrument) return;

        // Mute the instrument in the live instrument
        const instance = LIVE_AUDIO_INSTANCES[id];
        if (!instance) return;
        instance.mute = true;

        // Mute the instrument in the state
        instrument.mute = true;
      });
    },
    /**
     * Unmute all instruments.
     * @param state The current state.
     */
    unmuteInstruments: (state) => {
      state.allIds.forEach((id) => {
        const instrument = state.byId[id];
        if (!instrument) return;

        // Mute the instrument in the live instrument
        const instance = LIVE_AUDIO_INSTANCES[id];
        if (!instance) return;
        instance.mute = false;

        // Mute the instrument in the state
        instrument.mute = false;
      });
    },
    /**
     * Solo all instruments.
     * @param state The current state.
     */
    soloInstruments: (state) => {
      state.allIds.forEach((id) => {
        const instrument = state.byId[id];
        if (!instrument) return;

        // Solo the instrument in the live instrument
        const instance = LIVE_AUDIO_INSTANCES[id];
        if (!instance) return;
        instance.solo = true;

        // Solo the instrument in the state
        instrument.solo = true;
      });
    },
    /**
     * Unsolo all instruments.
     * @param state The current state.
     */
    unsoloInstruments: (state) => {
      state.allIds.forEach((id) => {
        const instrument = state.byId[id];
        if (!instrument) return;

        // Solo the instrument in the live instrument
        const instance = LIVE_AUDIO_INSTANCES[id];
        if (!instance) return;
        instance.solo = false;

        // Solo the instrument in the state
        instrument.solo = false;
      });
    },
  },
});

export const {
  addInstrument,
  addInstrumentOffline,
  addInstrumentEffect,
  updateInstrument,
  updateInstrumentEffect,
  rearrangeInstrumentEffect,
  removeInstrument,
  removeInstrumentEffect,
  resetInstrumentEffect,
  removeAllInstrumentEffects,
  toggleInstrumentMute,
  toggleInstrumentSolo,
  muteInstruments,
  unmuteInstruments,
  soloInstruments,
  unsoloInstruments,
} = instrumentsSlice.actions;

export default instrumentsSlice.reducer;

/**
 * A custom middleware to recreate all audio instances when undoing/redoing.
 */
export const handleInstrumentMiddleware: Middleware =
  (store) => (next) => (action) => {
    const type = action.type;

    // Get the old state
    const oldState = store.getState() as RootState;
    const oldInstrumentIds = selectInstrumentIds(oldState);
    const oldInstrumentMap = selectInstrumentMap(oldState);

    // Let the action pass through
    const result = next(action) as RootState;

    // Get the new state
    const nextState = store.getState() as RootState;
    const newInstrumentMap = selectInstrumentMap(nextState);
    const newInstrumentIds = selectInstrumentIds(nextState);

    // Get all instrument IDs
    const allIds = union(oldInstrumentIds, newInstrumentIds);

    // Validate all instruments if undoing/redoing the arrangement
    if (
      type === UndoTypes.undoArrangement ||
      type === UndoTypes.redoArrangement
    ) {
      for (const id of allIds) {
        // Get the instruments
        const oldInstrument = oldInstrumentMap[id];
        const newInstrument = newInstrumentMap[id];
        const instance = LIVE_AUDIO_INSTANCES[id];

        // If the instance has stopped existing, delete it and continue
        if (!newInstrument || !instance) {
          instance?.dispose();
          delete LIVE_AUDIO_INSTANCES[id];
          continue;
        }

        // If the instrument or effect has started existing, recreate the instance
        const oldEffectCount = oldInstrument?.effects.length ?? 0;
        const newEffectCount = newInstrument.effects.length;
        if (!oldInstrument || newEffectCount > oldEffectCount) {
          LIVE_AUDIO_INSTANCES[id] = new LiveAudioInstance({
            ...instance.getInitializationProps(),
            ...newInstrument,
          });
        }
      }
    }

    // Return the result
    return result;
  };
