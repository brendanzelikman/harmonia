import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "redux/store";
import { selectClipMap } from "./clips";
import { Clip } from "types/clips";
import { Transform } from "types/transform";
import { selectTransformMap } from "./transforms";
import { selectPatternMap } from "./patterns";

// Select the timeline
export const selectRoot = (state: RootState) => {
  return state.root;
};

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
  [selectSelectedPatternId, selectPatternMap],
  (id, patterns) => (id ? patterns[id] : undefined)
);

// Select the selected clips
export const selectSelectedClips = createSelector(
  [selectSelectedClipIds, selectClipMap],
  (ids, clips) => {
    return ids.map((id) => clips[id]).filter(Boolean) as Clip[];
  }
);

// Select the selected transforms
export const selectSelectedTransforms = createSelector(
  [selectSelectedTransformIds, selectTransformMap],
  (ids, transforms) => {
    return ids.map((id) => transforms[id]).filter(Boolean) as Transform[];
  }
);
