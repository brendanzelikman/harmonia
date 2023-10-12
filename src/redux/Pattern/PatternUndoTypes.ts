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
  "patterns/addPattern": (
    action: PayloadAction<PatternSlice.AddPatternPayload>
  ) => {
    const patternTag = createTag(action.payload, getPatternTag);
    return `ADD_PATTERN:${patternTag}`;
  },
  "patterns/removePattern": (
    action: PayloadAction<PatternSlice.RemovePatternPayload>
  ) => {
    return `REMOVE_PATTERN:${action.payload}`;
  },
  "patterns/updatePattern": (
    action: PayloadAction<PatternSlice.UpdatePatternPayload>
  ) => {
    const tag = createTag(action.payload, getPatternTag);
    return `UPDATE_PATTERN:${action.payload}`;
  },
  "patterns/addPatternNote": (
    action: PayloadAction<PatternSlice.AddPatternNotePayload>
  ) => {
    const patternNoteTag = getPatternNoteTag(action.payload.patternNote);
    return `ADD_PATTERN_NOTE:${action.payload.id}:${patternNoteTag}`;
  },
  "patterns/addPatternChord": (
    action: PayloadAction<PatternSlice.AddPatternChordPayload>
  ) => {
    const patternChordTag = getPatternChordTag(action.payload.patternChord);
    return `ADD_PATTERN_CHORD:${action.payload.id}:${patternChordTag}`;
  },
  "patterns/updatePatternNote": (
    action: PayloadAction<PatternSlice.UpdatePatternNotePayload>
  ) => {
    return `UPDATE_PATTERN_NOTE:${action.payload.id}:${action.payload.index}`;
  },
  "patterns/updatePatternChord": (
    action: PayloadAction<PatternSlice.UpdatePatternChordPayload>
  ) => {
    return `UPDATE_PATTERN_CHORD:${action.payload.id}:${action.payload.index}`;
  },
  "patterns/insertPatternNote": (
    action: PayloadAction<PatternSlice.InsertPatternNotePayload>
  ) => {
    return `INSERT_PATTERN_NOTE:${action.payload.id}:${action.payload.index}`;
  },
  "patterns/removePatternNote": (
    action: PayloadAction<PatternSlice.RemovePatternNotePayload>
  ) => {
    return `REMOVE_PATTERN_NOTE:${action.payload.id}:${action.payload.index}`;
  },
  "patterns/transposePattern": (
    action: PayloadAction<PatternSlice.TransposePatternPayload>
  ) => {
    return `TRANSPOSE_PATTERN:${action.payload.id}:${action.payload.transpose}`;
  },
  "patterns/repeatPattern": (
    action: PayloadAction<PatternSlice.RepeatPatternPayload>
  ) => {
    return `REPEAT_PATTERN:${action.payload.id}:${action.payload.repeat}`;
  },
  "patterns/continuePattern": (
    action: PayloadAction<PatternSlice.ContinuePatternPayload>
  ) => {
    return `CONTINUE_PATTERN:${action.payload.id}:${action.payload.length}`;
  },
  "patterns/phasePattern": (
    action: PayloadAction<PatternSlice.PhasePatternPayload>
  ) => {
    return `PHASE_PATTERN:${action.payload.id}:${action.payload.phase}`;
  },
  "patterns/diminishPattern": (
    action: PayloadAction<PatternSlice.DiminishPatternPayload>
  ) => {
    return `DIMINISH_PATTERN:${action.payload}`;
  },
  "patterns/augmentPattern": (
    action: PayloadAction<PatternSlice.AugmentPatternPayload>
  ) => {
    return `AUGMENT_PATTERN:${action.payload}`;
  },
  "patterns/reversePattern": (
    action: PayloadAction<PatternSlice.ReversePatternPayload>
  ) => {
    return `REVERSE_PATTERN:${action.payload}`;
  },
  "patterns/shufflePattern": (
    action: PayloadAction<PatternSlice.ShufflePatternPayload>
  ) => {
    return `SHUFFLE_PATTERN:${action.payload}`;
  },
  "patterns/harmonizePattern": (
    action: PayloadAction<PatternSlice.HarmonizePatternPayload>
  ) => {
    return `HARMONIZE_PATTERN:${action.payload.id}:${action.payload.interval}`;
  },
  "patterns/randomizePattern": (
    action: PayloadAction<PatternSlice.RandomizePatternPayload>
  ) => {
    return `RANDOMIZE_PATTERN:${action.payload}`;
  },
  "patterns/clearPattern": (
    action: PayloadAction<PatternSlice.ClearPatternPayload>
  ) => {
    return `CLEAR_PATTERN:${action.payload}`;
  },
};
