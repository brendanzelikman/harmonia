import { Project } from "types/Project";
import { createSelector } from "reselect";
import { PatternMap } from "types/Pattern";
import { getProperty, getProperties } from "types/util";
import { PresetPatternMap } from "presets/patterns";

/**
 * Select all pattern IDs from the store.
 * @param project The Project object.
 * @returns An array of pattern IDs.
 */
export const selectPatternIds = (project: Project) =>
  project.patterns.present.allIds;

/**
 * Select the pattern map from the store.
 * @param project The Project object.
 * @returns A map of pattern IDs to pattern objects.
 */
export const _selectPatternMap = (project: Project) =>
  project.patterns.present.byId;

/**
 * Select the pattern map from the store (integrated with preset patterns).
 * @param project The Project object.
 * @returns A map of pattern IDs to pattern objects.
 */
export const selectPatternMap = createSelector(
  [_selectPatternMap],
  (patternMap): PatternMap => ({ ...patternMap, ...PresetPatternMap })
);

/**
 * Select all patterns from the store.
 * @param project The Project object.
 * @returns An array of patterns.
 */
export const selectPatterns = createSelector(
  [selectPatternMap, selectPatternIds],
  (patternMap, patternIds) => getProperties(patternMap, patternIds)
);

/**
 * Select all non-preset patterns from the store.
 * @param project The Project object.
 * @returns An array of patterns.
 */
export const selectCustomPatterns = createSelector(
  [selectPatterns],
  (patterns) =>
    patterns.filter(({ id }) => id && PresetPatternMap[id] === undefined)
);

/**
 * Select a specific pattern from the store.
 * @param project The Project object.
 * @param id The pattern ID.
 * @returns The pattern object or undefined if not found.
 */
export const selectPatternById = (project: Project, id: string) => {
  const patternMap = selectPatternMap(project);
  return getProperty(patternMap, id);
};
