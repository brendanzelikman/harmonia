import { RootState } from "redux/store";
import {
  selectClipMap,
  selectPatternMap,
  selectTrackMap,
  selectTranspositionMap,
} from "redux/selectors";
import { getProperties, getProperty } from "types/util";
import { TranspositionOffsetRecord } from "types/Transposition";

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
 * Select the currently selected clips.
 * @param state The root state.
 * @returns The currently selected clips.
 */
export const selectSelectedClips = (state: RootState) => {
  const clipMap = selectClipMap(state);
  const selectedClipIds = selectSelectedClipIds(state);
  return getProperties(clipMap, selectedClipIds);
};

/**
 * Select the currently selected transpositions.
 * @param state The root state.
 * @returns The currently selected transpositions or an empty array if none are selected or found.
 */
export const selectSelectedTranspositions = (state: RootState) => {
  const transpositionMap = selectTranspositionMap(state);
  const selectedTranspositionIds = selectSelectedTranspositionIds(state);
  return getProperties(transpositionMap, selectedTranspositionIds);
};

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
