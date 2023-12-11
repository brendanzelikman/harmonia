import { PayloadAction } from "@reduxjs/toolkit";
import { ActionGroup } from "redux/util";
import {
  getPatternAsString,
  getPatternNoteAsString,
  getPatternUpdateAsString,
  getPatternBlockAsString,
} from "types/Pattern";
import * as _ from "./PatternSlice";

export const PATTERN_UNDO_TYPES: ActionGroup = {
  "patterns/addPattern": (action: PayloadAction<_.AddPatternPayload>) => {
    return `ADD_PATTERN:${getPatternAsString(action.payload)}`;
  },
  "patterns/updatePattern": (action: PayloadAction<_.UpdatePatternPayload>) => {
    return `UPDATE_PATTERN:${getPatternUpdateAsString(action.payload)}`;
  },
  "patterns/removePattern": (action: PayloadAction<_.RemovePatternPayload>) => {
    return `REMOVE_PATTERN:${action.payload}`;
  },
  "patterns/addPatternNote": (
    action: PayloadAction<_.AddPatternNotePayload>
  ) => {
    const { id, note } = action.payload;
    return `ADD_PATTERN_NOTE:${id}:${getPatternNoteAsString(note)}`;
  },
  "patterns/insertPatternNote": (
    action: PayloadAction<_.InsertPatternNotePayload>
  ) => {
    return `INSERT_PATTERN_NOTE:${action.payload.id}:${action.payload.index}`;
  },
  "patterns/updatePatternNote": (
    action: PayloadAction<_.UpdatePatternNotePayload>
  ) => {
    return `UPDATE_PATTERN_NOTE:${action.payload.id}:${action.payload.index}`;
  },
  "patterns/addPatternBlock": (
    action: PayloadAction<_.AddPatternBlockPayload>
  ) => {
    const { id, block } = action.payload;
    return `ADD_PATTERN_BLOCK:${id}:${getPatternBlockAsString(block)}`;
  },
  "patterns/insertPatternBlock": (
    action: PayloadAction<_.InsertPatternBlockPayload>
  ) => {
    return `INSERT_PATTERN_BLOCK:${action.payload.id}:${action.payload.index}`;
  },
  "patterns/updatePatternBlock": (
    action: PayloadAction<_.UpdatePatternBlockPayload>
  ) => {
    return `UPDATE_PATTERN_BLOCK:${JSON.stringify(action.payload)}`;
  },
  "patterns/transposePatternBlock": (
    action: PayloadAction<_.TransposePatternBlockPayload>
  ) => {
    return `TRANSPOSE_PATTERN_BLOCK:${JSON.stringify(action.payload)}`;
  },
  "patterns/removePatternBlock": (
    action: PayloadAction<_.RemovePatternBlockPayload>
  ) => {
    return `REMOVE_PATTERN_BLOCK:${action.payload.id}:${action.payload.index}`;
  },
  "patterns/transposePattern": (
    action: PayloadAction<_.TransposePatternPayload>
  ) => {
    return `TRANSPOSE_PATTERN:${action.payload.id}:${action.payload.transpose}`;
  },
  "patterns/repeatPattern": (action: PayloadAction<_.RepeatPatternPayload>) => {
    return `REPEAT_PATTERN:${action.payload.id}:${action.payload.repeat}`;
  },
  "patterns/continuePattern": (
    action: PayloadAction<_.ContinuePatternPayload>
  ) => {
    return `CONTINUE_PATTERN:${action.payload.id}:${action.payload.length}`;
  },
  "patterns/phasePattern": (action: PayloadAction<_.PhasePatternPayload>) => {
    return `PHASE_PATTERN:${action.payload.id}:${action.payload.phase}`;
  },
  "patterns/stretchPattern": (
    action: PayloadAction<_.StretchPatternPayload>
  ) => {
    return `DIMINISH_PATTERN:${action.payload.id}:${action.payload.factor}`;
  },
  "patterns/reversePattern": (
    action: PayloadAction<_.ReversePatternPayload>
  ) => {
    return `REVERSE_PATTERN:${action.payload}`;
  },
  "patterns/shufflePattern": (
    action: PayloadAction<_.ShufflePatternPayload>
  ) => {
    return `SHUFFLE_PATTERN:${action.payload}`;
  },
  "patterns/harmonizePattern": (
    action: PayloadAction<_.HarmonizePatternPayload>
  ) => {
    return `HARMONIZE_PATTERN:${action.payload.id}:${action.payload.interval}`;
  },
  "patterns/clearPattern": (action: PayloadAction<_.ClearPatternPayload>) => {
    return `CLEAR_PATTERN:${action.payload}`;
  },
};
