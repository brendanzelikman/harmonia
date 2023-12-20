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
  "patterns/clearPattern": (action: PayloadAction<_.ClearPatternPayload>) => {
    return `CLEAR_PATTERN:${action.payload}`;
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
  "patterns/shufflePatternStream": (
    action: PayloadAction<_.ShufflePatternPayload>
  ) => {
    return `SHUFFLE_PATTERN_STREAM:${action.payload}`;
  },
  "patterns/shufflePatternPitches": (
    action: PayloadAction<_.ShufflePatternPayload>
  ) => {
    return `SHUFFLE_PATTERN_PITCHES:${action.payload}`;
  },
  "patterns/shufflePatternVelocities": (
    action: PayloadAction<_.ShufflePatternPayload>
  ) => {
    return `SHUFFLE_PATTERN_VELOCITIES:${action.payload}`;
  },
  "patterns/subdividePattern": (
    action: PayloadAction<_.SubdividePatternPayload>
  ) => {
    return `SUBDIVIDE_PATTERN:${action.payload}`;
  },
  "patterns/mergePattern": (action: PayloadAction<_.MergePatternPayload>) => {
    return `MERGE_PATTERN:${action.payload}`;
  },
  "patterns/flattenPattern": (
    action: PayloadAction<_.FlattenPatternPayload>
  ) => {
    return `FLATTEN_PATTERN:${action.payload}`;
  },
  "patterns/harmonizePattern": (
    action: PayloadAction<_.HarmonizePatternPayload>
  ) => {
    return `HARMONIZE_PATTERN:${action.payload.id}:${action.payload.interval}`;
  },
  "patterns/interpolatePattern": (
    action: PayloadAction<_.InterpolatePatternPayload>
  ) => {
    return `HARMONIZE_PATTERN:${action.payload.id}:${action.payload.fillCount}`;
  },
  "patterns/setPatternPitches": (
    action: PayloadAction<_.SetPatternPitchesPayload>
  ) => {
    const { id, pitch } = action.payload;
    return `SET_PATTERN_PITCHES:${id},${pitch}`;
  },
  "patterns/setPatternDurations": (
    action: PayloadAction<_.SetPatternDurationsPayload>
  ) => {
    const { id, duration } = action.payload;
    return `SET_PATTERN_DURATIONS:${id},${duration}`;
  },
  "patterns/setPatternVelocities": (
    action: PayloadAction<_.SetPatternVelocitiesPayload>
  ) => {
    const { id, velocity } = action.payload;
    return `SET_PATTERN_VELOCITIES:${id},${velocity}`;
  },
  "patterns/graduatePatternVelocities": (
    action: PayloadAction<_.GraduatePatternVelocitiesPayload>
  ) => {
    const { id, startIndex, endIndex, startVelocity, endVelocity } =
      action.payload;
    return `GRADUATE_PATTERN_VELOCITIES:${id},${startIndex},${endIndex},${startVelocity},${endVelocity}`;
  },
  "patterns/randomizePatternVelocities": (
    action: PayloadAction<_.RandomizePatternPayload>
  ) => {
    const id = action.payload;
    return `RANDOMIZE_PATTERN_VELOCITIES:${id}`;
  },
  "patterns/randomizePatternDurations": (
    action: PayloadAction<_.RandomizePatternPayload>
  ) => {
    const id = action.payload;
    return `RANDOMIZE_PATTERN_DURATIONS:${id}`;
  },
};
