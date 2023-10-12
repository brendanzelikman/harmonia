import { RootState } from "redux/store";
import { createSelector } from "reselect";
import { PatternMap } from "types/Pattern";
import { getProperty, getProperties } from "types/util";
import { PresetPatternMap } from "presets/patterns";

/**
 * Select all pattern IDs from the store.
 * @param state The RootState object.
 * @returns An array of pattern IDs.
 */
export const selectPatternIds = (state: RootState) =>
  state.patterns.present.allIds;

/**
 * Select the pattern map from the store.
 * @param state The RootState object.
 * @returns A map of pattern IDs to pattern objects.
 */
export const _selectPatternMap = (state: RootState) =>
  state.patterns.present.byId;

/**
 * Select the pattern map from the store (integrated with preset patterns).
 * @param state The RootState object.
 * @returns A map of pattern IDs to pattern objects.
 */
export const selectPatternMap = createSelector(
  [_selectPatternMap],
  (patternMap): PatternMap => ({ ...patternMap, ...PresetPatternMap })
);

/**
 * Select all patterns from the store.
 * @param state The RootState object.
 * @returns An array of patterns.
 */
export const selectPatterns = createSelector(
  [selectPatternMap, selectPatternIds],
  (patternMap, patternIds) => getProperties(patternMap, patternIds)
);

/**
 * Select all non-preset patterns from the store.
 * @param state The RootState object.
 * @returns An array of patterns.
 */
export const selectCustomPatterns = createSelector(
  [selectPatterns],
  (patterns) =>
    patterns.filter(({ id }) => id && PresetPatternMap[id] === undefined)
);

/**
 * Select a specific pattern from the store.
 * @param state The RootState object.
 * @param id The pattern ID.
 * @returns The pattern object or undefined if not found.
 */
export const selectPatternById = (state: RootState, id: string) => {
  const patternMap = selectPatternMap(state);
  return getProperty(patternMap, id);
};
