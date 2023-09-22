import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "redux/store";
import { selectClipMap } from "./clips";
import { Clip } from "types/clip";
import { Transposition } from "types/transposition";
import { selectTranspositionMap } from "./transpositions";
import { selectPatternMap } from "./patterns";
import { selectTracks } from "./tracks";

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

// Select selected track
export const selectSelectedTrack = createSelector(
  [selectSelectedTrackId, selectTracks],
  (trackId, tracks) => tracks.find((track) => track.id === trackId)
);

// Select selected clip ids
export const selectSelectedClipIds = createSelector(
  [selectRoot],
  (root) => root.selectedClipIds
);

// Select selected transposition ids
export const selectSelectedTranspositionIds = createSelector(
  [selectRoot],
  (root) => root.selectedTranspositionIds
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

// Select the selected transpositions
export const selectSelectedTranspositions = createSelector(
  [selectSelectedTranspositionIds, selectTranspositionMap],
  (ids, transpositions) => {
    return ids
      .map((id) => transpositions[id])
      .filter(Boolean) as Transposition[];
  }
);
