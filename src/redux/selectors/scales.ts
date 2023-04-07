import { RootState } from "redux/store";
import { createSelector } from "reselect";
import Scales, { ScaleId } from "types/scales";

// Select the ID of a scale
export const selectScaleId = (state: RootState, id: ScaleId) => id;

// Select all scales from the store.
export const selectScales = createSelector(
  [(state: RootState) => state.scales.present],
  (scales) => [...Scales.Presets, ...scales.allIds.map((id) => scales.byId[id])]
);

// Select all non-preset scales from the store
export const selectCustomScales = createSelector([selectScales], (scales) =>
  scales.filter(
    (scale) =>
      scale.name !== Scales.TrackScaleName &&
      !Scales.Presets.find((preset) => preset.id === scale.id)
  )
);

// Select all scale IDs from the store.
export const selectScaleIds = (state: RootState): ScaleId[] => {
  return state.scales.present.allIds;
};

// Select a specific scale from the store.
export const selectScale = createSelector(
  [selectScales, selectScaleId],
  (scales, id) => scales.find((scale) => scale.id === id)
);
