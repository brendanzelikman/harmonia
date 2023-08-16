import { RootState } from "redux/store";
import { createSelector } from "reselect";
import Patterns, { Pattern, PatternId } from "types/patterns";

// Select the ID of a pattern
export const selectPatternId = (state: RootState, id: PatternId) => id;

// Select all patterns from the store.
export const selectPatterns = createSelector(
  [(state: RootState) => state.patterns.present],
  (patterns) => [
    ...Patterns.Presets,
    ...patterns.allIds.map((id) => patterns.byId[id]),
  ]
);

// Select all non-preset patterns from the store
export const selectCustomPatterns = createSelector(
  [selectPatterns],
  (patterns) =>
    patterns.filter(
      (pattern) =>
        pattern.id === "new-pattern" ||
        !Patterns.Presets.find((preset) => preset.id === pattern.id)
    )
);

// Select all pattern IDs from the store.
export const selectPatternIds = (state: RootState) => {
  return state.patterns.present.allIds;
};

// Select a specific pattern from the store.
export const selectPattern = (
  state: RootState,
  id: PatternId
): Pattern | undefined => {
  const patterns = selectPatterns(state);
  return patterns.find((pattern) => pattern.id === id);
};
