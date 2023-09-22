import { RootState } from "redux/store";
import { createSelector } from "reselect";
import {
  Pattern,
  PatternId,
  rotatePatternStream,
  transposePatternStream,
} from "types/pattern";
import { PresetPatternMap } from "types/presets/patterns";
import { selectScaleMap } from "./scales";
import { selectScaleTrackMap } from "./scaleTracks";
import { TranspositionOffsetRecord } from "types/transposition";
import { getScaleTrackNotes, getScaleTrackScale } from "types";

// Select the ID of a pattern
export const selectPatternId = (state: RootState, id?: PatternId) => id;
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
  (patterns, id) => (id ? patterns[id] : undefined)
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

export const _selectPattern = (state: RootState, p: Pattern) => p;
export const _selectTranspositions = (
  state: RootState,
  pattern: Pattern,
  transpositions: TranspositionOffsetRecord
) => transpositions;

export const selectTransposedPattern = createSelector(
  [_selectPattern, _selectTranspositions, selectScaleTrackMap, selectScaleMap],
  (pattern, transpositions, scaleTracks, scales) => {
    if (!pattern || !transpositions) return pattern;

    // Make sure that chromatic/chordal transpositions are applied last
    const orderedTranspositions = Object.keys(transpositions).sort((a, b) => {
      if (a === "_chromatic" || a === "_self") return 1;
      if (b === "_chromatic" || b === "_self") return -1;
      return 0;
    });

    // Compute the stream by applying each transposition
    const stream = orderedTranspositions.reduce((acc, id) => {
      const offset = transpositions[id];
      if (id === "_chromatic") return transposePatternStream(acc, offset);
      if (id === "_self") return rotatePatternStream(acc, offset);

      // Get the scale from the corresponding scale track
      const scaleTrack = scaleTracks[id];
      const scale = getScaleTrackScale(scaleTrack, { scaleTracks });
      return transposePatternStream(acc, offset, scale);
    }, pattern.stream);

    return {
      ...pattern,
      stream,
    };
  }
);
