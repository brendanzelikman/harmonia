import { Project } from "types/Project";
import { createSelector } from "reselect";
import { PatternMap } from "types/Pattern";
import { getValueByKey, getValuesByKeys } from "utils/objects";
import {
  PresetPatternGroupList,
  PresetPatternGroupMap,
  PresetPatternMap,
} from "presets/patterns";
import { createDeepEqualSelector } from "redux/util";

/** Select the pattern past length. */
export const selectPatternPastLength = (project: Project) =>
  project.patterns.past.length;

/** Select the pattern future length. */
export const selectPatternFutureLength = (project: Project) =>
  project.patterns.future.length;

/** Select the pattern map. */
export const _selectPatternMap = (project: Project) =>
  project.patterns.present.byId;

/** Select all pattern IDs. */
export const selectPatternIds = (project: Project) =>
  project.patterns.present.allIds;

/** Select the pattern map (integrated with preset patterns). */
export const selectPatternMap = createSelector(
  [_selectPatternMap],
  (patternMap): PatternMap => ({ ...patternMap, ...PresetPatternMap })
);

/** Select all patterns. */
export const selectPatterns = createDeepEqualSelector(
  [selectPatternMap, selectPatternIds],
  (patternMap, patternIds) => getValuesByKeys(patternMap, patternIds)
);

/** Select all non-preset patterns. */
export const selectCustomPatterns = createDeepEqualSelector(
  [selectPatterns],
  (patterns) =>
    patterns.filter(({ id }) => id && PresetPatternMap[id] === undefined)
);

/** Select a pattern by ID. */
export const selectPatternById = (project: Project, id?: string) => {
  const patternMap = selectPatternMap(project);
  return getValueByKey(patternMap, id);
};

/** Select the category of a pattern by ID. */
export const selectPatternCategory = (_: Project, id?: string) => {
  return (
    PresetPatternGroupList.find((c) =>
      PresetPatternGroupMap[c].some((m) => m.id === id)
    ) ?? "Custom Patterns"
  );
};
