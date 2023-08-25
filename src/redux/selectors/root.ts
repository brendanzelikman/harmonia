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
export const selectSelectedPatternId = createSelector(
  [selectRoot],
  (root) => root.selectedPatternId
);

// Select active track id
export const selectSelectedTrackId = createSelector(
  [selectRoot],
  (root) => root.selectedTrackId
);

// Select the selected pattern
export const selectSelectedPattern = createSelector(
  [selectSelectedPatternId, selectPatternTracks],
  (selectedPatternId, patterns) => {
    if (!selectedPatternId) return;
    return patterns.find((pattern) => pattern.id === selectedPatternId);
  }
);
