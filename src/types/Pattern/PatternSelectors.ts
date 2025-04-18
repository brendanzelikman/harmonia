import { PresetPatternMap } from "lib/presets/patterns";
import { createDeepSelector } from "types/redux";
import { Project, SafeProject } from "types/Project/ProjectTypes";
import { defaultPatternState, patternAdapter } from "./PatternSlice";
import { Pattern, PatternId, PatternState } from "./PatternTypes";

// Create a safe selector for the pattern state.
export const selectPatternState = (project: SafeProject) =>
  (project?.present?.patterns ?? defaultPatternState) as PatternState;

// Use the memoized selectors from the entity adapter.
const patternSelectors =
  patternAdapter.getSelectors<Project>(selectPatternState);

export const selectPatternIds = patternSelectors.selectIds as (
  project: Project
) => PatternId[];
export const selectPatternMap = patternSelectors.selectEntities;

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
