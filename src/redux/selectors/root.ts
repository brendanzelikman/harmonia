import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "redux/store";
import { selectPatternTracks } from "./patternTracks";
import { DEFAULT_CELL_WIDTH } from "appConstants";

// Select the timeline
export const selectRoot = (state: RootState) => {
  return state.root;
};

// Select the cell width
export const selectCellWidth = createSelector(
  [selectRoot],
  (root) => root.cellWidth || DEFAULT_CELL_WIDTH
);

// Select active pattern id
export const selectActivePatternId = createSelector(
  [selectRoot],
  (root) => root.activePatternId
);

// Select active track id
export const selectActiveTrackId = createSelector(
  [selectRoot],
  (root) => root.activeTrackId
);

// Select the active pattern
export const selectActivePattern = createSelector(
  [selectActivePatternId, selectPatternTracks],
  (activePatternId, patterns) => {
    if (!activePatternId) return;
    return patterns.find((pattern) => pattern.id === activePatternId);
  }
);

// Select the selected clips
export const selectSelectedClipIds = createSelector(
  [selectRoot],
  (root) => root.selectedClipIds
);
