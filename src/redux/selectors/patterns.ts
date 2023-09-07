import { RootState } from "redux/store";
import { createSelector } from "reselect";
import { PatternId } from "types/pattern";
import { PresetPatternMap } from "types/presets/patterns";

// Select the ID of a pattern
export const selectPatternId = (state: RootState, id: PatternId) => id;
export const selectPatternIds = (state: RootState) => {
  return state.patterns.present.allIds;
};
export const selectPatternMap = createSelector(
  [(state: RootState) => state.patterns.present.byId],
  (patterns) => ({ ...patterns, ...PresetPatternMap })
);
// Select a specific pattern from the store.
export const selectPattern = createSelector(
  [selectPatternMap, selectPatternId],
  (patterns, id) => patterns[id]
);

// Select all patterns from the store.
export const selectPatterns = createSelector(
  [selectPatternMap, selectPatternIds],
  (patterns, ids) => ids.map((id) => patterns[id])
);

// Select all non-preset patterns from the store
export const selectCustomPatterns = createSelector(
  [selectPatterns],
  (patterns) =>
    patterns.filter(
      ({ id }) =>
        id && (id === "new-pattern" || PresetPatternMap[id] === undefined)
    )
);
