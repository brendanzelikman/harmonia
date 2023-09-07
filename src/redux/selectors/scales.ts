import { RootState } from "redux/store";
import { createSelector } from "reselect";
import { PresetScaleList, PresetScaleMap } from "types/presets/scales";
import Scales, { ScaleId } from "types/scale";

export const selectScaleId = (state: RootState, id: ScaleId) => {
  return id;
};
export const selectScaleIds = (state: RootState): ScaleId[] => {
  return state.scales.present.allIds;
};
export const selectScaleMap = (state: RootState) => {
  return state.scales.present.byId;
};

// Select all scales from the store.
export const selectScales = createSelector(
  [selectScaleMap, selectScaleIds],
  (scales, ids) => [...PresetScaleList, ...ids.map((id) => scales[id])]
);

// Select all non-preset scales from the store
export const selectCustomScales = createSelector([selectScales], (scales) =>
  scales.filter(
    (scale) =>
      scale.name !== Scales.TrackScaleName &&
      PresetScaleMap[scale.id] === undefined
  )
);

// Select a specific scale from the store.
export const selectScale = createSelector(
  [selectScaleMap, selectScaleId],
  (scales, id) => scales[id]
);
