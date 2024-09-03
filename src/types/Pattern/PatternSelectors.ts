import {
  PresetPatternGroupList,
  PresetPatternGroupMap,
  PresetPatternMap,
} from "assets/patterns";
import { createDeepSelector } from "lib/redux";
import { Project, SafeProject } from "types/Project/ProjectTypes";
import { defaultPatternState, patternAdapter } from "./PatternSlice";
import { Pattern, PatternId, PatternMap, PatternState } from "./PatternTypes";

// Create a safe selector for the pattern state.
export const selectPatternState = (project: SafeProject) =>
  (project?.present?.motifs?.pattern ?? defaultPatternState) as PatternState;

// Use the memoized selectors from the entity adapter.
const patternSelectors =
  patternAdapter.getSelectors<Project>(selectPatternState);

export const selectPatternIds = patternSelectors.selectIds as (
  project: Project
) => PatternId[];
export const _selectPatternMap = patternSelectors.selectEntities;
export const selectPatternMap = createDeepSelector(
  [_selectPatternMap],
  (patternMap): PatternMap => ({ ...patternMap, ...PresetPatternMap })
);

// Select all patterns.
export const selectPatterns = createDeepSelector(
  [selectPatternMap],
  (patternMap) => Object.values(patternMap) as Pattern[]
);

// Select a pattern by ID, or use a preset pattern if it exists.
export const selectPatternById = (
  ...args: Parameters<typeof patternSelectors.selectById>
) =>
  patternSelectors.selectById(...args) ||
  PresetPatternMap[args[1] as PatternId];

/** Select all non-preset patterns. */
export const selectCustomPatterns = createDeepSelector(
  [selectPatterns],
  (patterns) =>
    patterns.filter(({ id }) => id && PresetPatternMap[id] === undefined)
);

/** Select all preset patterns */
export const selectPresetPatterns = createDeepSelector(
  [selectPatterns],
  (patterns) =>
    patterns.filter(({ id }) => id && PresetPatternMap[id] !== undefined)
);

export const selectPatternName = (_: Project, id: string) => {
  return selectPatternById(_, id)?.name ?? "Unknown Pattern";
};

/** Select the category of a pattern by ID. */
export const selectPatternCategory = (_: Project, id?: string) => {
  return (
    PresetPatternGroupList.find((c) =>
      PresetPatternGroupMap[c].some((m) => m.id === id)
    ) ?? "Custom Patterns"
  );
};
