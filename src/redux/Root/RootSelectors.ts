import { RootState } from "redux/store";
import {
  selectClipMap,
  selectOrderedTrackIds,
  selectPatternMap,
  selectTrackMap,
  selectTrackParents,
  selectTranspositionMap,
} from "redux/selectors";
import { getProperties, getProperty } from "types/util";
import { TranspositionOffsetRecord } from "types/Transposition";
import { createDeepEqualSelector } from "redux/util";
import { Media } from "types/Media";

/**
 * Select the root.
 * @param state The root state.
 * @returns The root.
 */
export const selectRoot = (state: RootState) => state.root;

/**
 * Select the currently selected pattern ID.
 * @param state The root state.
 * @returns The currently selected pattern ID or undefined if none is selected.
 */
export const selectSelectedPatternId = (state: RootState) =>
  state.root.selectedPatternId;

/**
 * Select the currently selected track ID.
 * @param state The root state.
 * @returns The currently selected track ID or undefined if none is selected.
 */
export const selectSelectedTrackId = (state: RootState) =>
  state.root.selectedTrackId;

/**
 * Select the currently selected clip IDs.
 * @param state The root state.
 * @returns The currently selected clip IDs.
 */
export const selectSelectedClipIds = (state: RootState) =>
  state.root.selectedClipIds;

/**
 * Select the currently selected transposition IDs.
 * @param state The root state.
 * @returns The currently selected transposition IDs.
 */
export const selectSelectedTranspositionIds = (state: RootState) =>
  state.root.selectedTranspositionIds;

/**
 * Select the currently selected pattern.
 * @param state The root state.
 * @returns The currently selected pattern or undefined if none is selected or found.
 */
export const selectSelectedPattern = (state: RootState) => {
  const patternMap = selectPatternMap(state);
  const selectedPatternId = selectSelectedPatternId(state);
  return getProperty(patternMap, selectedPatternId);
};

/**
 * Select the currently selected track.
 * @param state The root state.
 * @returns The currently selected track or undefined if none is selected or found.
 */
export const selectSelectedTrack = (state: RootState) => {
  const trackMap = selectTrackMap(state);
  const selectedTrackId = selectSelectedTrackId(state);
  return getProperty(trackMap, selectedTrackId);
};

/**
 * Select the index of the currently selected track.
 * @param state The root state.
 * @returns The index of the currently selected track or -1 if none is selected.
 */
export const selectSelectedTrackIndex = (state: RootState) => {
  const selectedTrackId = selectSelectedTrackId(state);
  if (!selectedTrackId) return -1;
  const orderedTrackIds = selectOrderedTrackIds(state);
  return orderedTrackIds.indexOf(selectedTrackId);
};

/**
 * Select the parents of the currently selected track.
 * @param state The root state.
 * @returns The parents of the currently selected track or an empty array if none is selected.
 */
export const selectSelectedTrackParents = (state: RootState) => {
  const selectedTrack = selectSelectedTrack(state);
  if (!selectedTrack) return [];
  return selectTrackParents(state, selectedTrack.id);
};

/**
 * Select the currently selected clips.
 * @param state The root state.
 * @returns The currently selected clips.
 */
export const selectSelectedClips = createDeepEqualSelector(
  [selectClipMap, selectSelectedClipIds],
  (clipMap, selectedClipIds) => getProperties(clipMap, selectedClipIds)
);

/**
 * Select the currently selected transpositions.
 * @param state The root state.
 * @returns The currently selected transpositions or an empty array if none are selected or found.
 */
export const selectSelectedTranspositions = createDeepEqualSelector(
  [selectTranspositionMap, selectSelectedTranspositionIds],
  (transpositionMap, selectedTranspositionIds) =>
    getProperties(transpositionMap, selectedTranspositionIds)
);

/**
 * Select all selected media.
 * @param state The root state.
 * @returns An array of selected media.
 */
export const selectSelectedMedia = createDeepEqualSelector(
  [selectSelectedClips, selectSelectedTranspositions],
  (selectedClips, selectedTranspositions): Media[] => [
    ...selectedClips,
    ...selectedTranspositions,
  ]
);

/**
 * Select the transposition offsets.
 * @param state The root state.
 * @returns The transposition offsets.
 */

export const selectTranspositionOffsets = (
  state: RootState
): TranspositionOffsetRecord => {
  const offsets = state.root.toolkit.transpositionOffsets;
  return {
    ...offsets,
    _chromatic: offsets._chromatic || 0,
    _self: offsets._self || 0,
  };
};
