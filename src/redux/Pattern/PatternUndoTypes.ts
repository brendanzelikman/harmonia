import { PayloadAction } from "@reduxjs/toolkit";
import { ActionGroup } from "types/units";
import {
  getPatternTag,
  getPatternNoteTag,
  getPatternChordTag,
} from "types/Pattern";
import * as PatternSlice from "./PatternSlice";
import { createTag } from "types/util";

export const PATTERN_UNDO_TYPES: ActionGroup = {
  "patterns/addPatterns": (action: PayloadAction<PatternSlice.AddPatterns>) => {
    const patternTag = createTag(action.payload, getPatternTag);
    return `ADD_PATTERNS:${patternTag}`;
  },
  "patterns/removePatterns": (
    action: PayloadAction<PatternSlice.RemovePatterns>
  ) => {
    return `REMOVE_PATTERNS:${action.payload.join(",")}`;
  },
  "patterns/updatePatterns": (
    action: PayloadAction<PatternSlice.UpdatePatterns>
  ) => {
    return `UPDATE_PATTERNS:${action.payload.join(",")}`;
  },
  "patterns/addPatternNote": (
    action: PayloadAction<PatternSlice.AddPatternNote>
  ) => {
    const patternNoteTag = getPatternNoteTag(action.payload.patternNote);
    return `ADD_PATTERN_NOTE:${action.payload.id}:${patternNoteTag}`;
  },
  "patterns/addPatternChord": (
    action: PayloadAction<PatternSlice.AddPatternChord>
  ) => {
    const patternChordTag = getPatternChordTag(action.payload.patternChord);
    return `ADD_PATTERN_CHORD:${action.payload.id}:${patternChordTag}`;
  },
  "patterns/updatePatternNote": (
    action: PayloadAction<PatternSlice.UpdatePatternNote>
  ) => {
    return `UPDATE_PATTERN_NOTE:${action.payload.id}:${action.payload.index}`;
  },
  "patterns/updatePatternChord": (
    action: PayloadAction<PatternSlice.UpdatePatternChord>
  ) => {
    return `UPDATE_PATTERN_CHORD:${action.payload.id}:${action.payload.index}`;
  },
  "patterns/insertPatternNote": (
    action: PayloadAction<PatternSlice.InsertPatternNote>
  ) => {
    return `INSERT_PATTERN_NOTE:${action.payload.id}:${action.payload.index}`;
  },
  "patterns/removePatternNote": (
    action: PayloadAction<PatternSlice.RemovePatternNote>
  ) => {
    return `REMOVE_PATTERN_NOTE:${action.payload.id}:${action.payload.index}`;
  },
  "patterns/transposePattern": (
    action: PayloadAction<PatternSlice.TransposePattern>
  ) => {
    return `TRANSPOSE_PATTERN:${action.payload.id}:${action.payload.transpose}`;
  },
  "patterns/repeatPattern": (
    action: PayloadAction<PatternSlice.RepeatPattern>
  ) => {
    return `REPEAT_PATTERN:${action.payload.id}:${action.payload.repeat}`;
  },
  "patterns/continuePattern": (
    action: PayloadAction<PatternSlice.ContinuePattern>
  ) => {
    return `CONTINUE_PATTERN:${action.payload.id}:${action.payload.length}`;
  },
  "patterns/phasePattern": (
    action: PayloadAction<PatternSlice.PhasePattern>
  ) => {
    return `PHASE_PATTERN:${action.payload.id}:${action.payload.phase}`;
  },
  "patterns/diminishPattern": (
    action: PayloadAction<PatternSlice.DiminishPattern>
  ) => {
    return `DIMINISH_PATTERN:${action.payload}`;
  },
  "patterns/augmentPattern": (
    action: PayloadAction<PatternSlice.AugmentPattern>
  ) => {
    return `AUGMENT_PATTERN:${action.payload}`;
  },
  "patterns/reversePattern": (
    action: PayloadAction<PatternSlice.ReversePattern>
  ) => {
    return `REVERSE_PATTERN:${action.payload}`;
  },
  "patterns/shufflePattern": (
    action: PayloadAction<PatternSlice.ShufflePattern>
  ) => {
    return `SHUFFLE_PATTERN:${action.payload}`;
  },
  "patterns/harmonizePattern": (
    action: PayloadAction<PatternSlice.HarmonizePattern>
  ) => {
    return `HARMONIZE_PATTERN:${action.payload.id}:${action.payload.interval}`;
  },
  "patterns/randomizePattern": (
    action: PayloadAction<PatternSlice.RandomizePattern>
  ) => {
    return `RANDOMIZE_PATTERN:${action.payload}`;
  },
  "patterns/clearPattern": (
    action: PayloadAction<PatternSlice.ClearPattern>
  ) => {
    return `CLEAR_PATTERN:${action.payload}`;
  },
};
