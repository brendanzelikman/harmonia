import { RootState } from "redux/store";
import { createSelector } from "reselect";
import {
  ScaleId,
  getNestedScaleNotes,
  realizeNestedScaleNotes,
} from "types/Scale";
import { getProperties, getProperty } from "types/util";
import { PresetScaleList, PresetScaleMap } from "presets/scales";
import { ScaleTrackScaleName } from "types/ScaleTrack";

/**
 * Select all scale IDs from the store.
 * @param state - The Redux store state.
 * @returns An array of all scale IDs.
 */
export const selectScaleIds = (state: RootState): ScaleId[] =>
  state.scales.present.allIds;

/**
 * Select the scale map from the store.
 * @param state - The Redux store state.
 * @returns The scale map.
 */
export const selectScaleMap = (state: RootState) => state.scales.present.byId;

/**
 * Select all scales from the store (including track scales)
 * @param state - The Redux store state.
 * @returns An array of scales.
 */
export const selectScales = createSelector(
  [selectScaleMap, selectScaleIds],
  (scaleMap, ids) => getProperties(scaleMap, ids)
);

/**
 * Select all custom scales from the store (excluding track scales).
 * @param state - The Redux store state.
 * @returns An array of scales.
 */
export const selectCustomScales = createSelector(
  [selectScaleMap, selectScaleIds],
  (scaleMap, ids) => {
    const scales = getProperties(scaleMap, ids);
    return scales.filter((scale) => scale.name !== ScaleTrackScaleName);
  }
);

/**
 * Select a specific scale from the store.
 * @param state - The Redux store state.
 * @param id - The ID of the scale to select.
 * @returns The scale.
 */
export const selectScaleById = (state: RootState, id: ScaleId) => {
  const scaleMap = selectScaleMap(state);
  return getProperty(scaleMap, id);
};
