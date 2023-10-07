import { RootState } from "redux/store";
import { createSelector } from "reselect";
import { ScaleId, TrackScaleName } from "types/Scale";
import { getProperty } from "types/util";
import { PresetScaleList, PresetScaleMap } from "presets/scales";

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
 * Select all scales from the store (including presets).
 * @param state - The Redux store state.
 * @returns An array of scales.
 */
export const selectScales = createSelector(
  [selectScaleMap, selectScaleIds],
  (scales, ids) => [...PresetScaleList, ...ids.map((id) => scales[id])]
);

/**
 * Select all scales from the store (excluding presets).
 * @param state - The Redux store state.
 * @returns An array of scales.
 */
export const selectCustomScales = createSelector([selectScales], (scales) =>
  scales.filter(
    (scale) =>
      scale.name !== TrackScaleName &&
      scale.id &&
      PresetScaleMap[scale.id] === undefined
  )
);

/**
 * Select a specific scale from the store.
 * @param state - The Redux store state.
 * @param id - The ID of the scale to select.
 * @returns The scale.
 */
export const selectScale = (state: RootState, id: ScaleId) => {
  const scaleMap = selectScaleMap(state);
  return getProperty(scaleMap, id);
};
