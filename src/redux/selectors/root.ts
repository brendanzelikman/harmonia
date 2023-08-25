import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "redux/store";
import { selectPatternTracks } from "./patternTracks";
import { DEFAULT_CELL_WIDTH } from "appConstants";
import { selectClips } from "./clips";
import { Clip } from "types/clips";
import { Transform } from "types/transform";
import { selectTransforms } from "./transforms";

// Select the timeline
export const selectRoot = (state: RootState) => {
  return state.root;
};

// Select the cell width
export const selectCellWidth = createSelector(
  [selectRoot],
  (root) => root.cellWidth || DEFAULT_CELL_WIDTH
);

// Select selected pattern id
export const selectSelectedPatternId = createSelector(
  [selectRoot],
  (root) => root.selectedPatternId
);

// Select selected track id
export const selectSelectedTrackId = createSelector(
  [selectRoot],
  (root) => root.selectedTrackId
);

// Select selected clip ids
export const selectSelectedClipIds = createSelector(
  [selectRoot],
  (root) => root.selectedClipIds
);

// Select selected transform ids
export const selectSelectedTransformIds = createSelector(
  [selectRoot],
  (root) => root.selectedTransformIds
);

// Select the selected pattern
export const selectSelectedPattern = createSelector(
  [selectSelectedPatternId, selectPatternTracks],
  (selectedPatternId, patterns) => {
    if (!selectedPatternId) return;
    return patterns.find((pattern) => pattern.id === selectedPatternId);
  }
);

// Select the selected clips
export const selectSelectedClips = createSelector(
  [selectSelectedClipIds, selectClips],
  (selectedClipIds, clips) => {
    return selectedClipIds
      .map((clipId) => {
        return clips.find((clip) => clip.id === clipId);
      })
      .filter(Boolean) as Clip[];
  }
);

// Select the selected transforms
export const selectSelectedTransforms = createSelector(
  [selectSelectedTransformIds, selectTransforms],
  (selectedTransformIds, transforms) => {
    return selectedTransformIds
      .map((transformId) => {
        return transforms.find((transform) => transform.id === transformId);
      })
      .filter(Boolean) as Transform[];
  }
);
