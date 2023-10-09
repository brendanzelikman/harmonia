import { PayloadAction } from "@reduxjs/toolkit";
import { CLIP_UNDO_TYPES } from "./Clip";
import { PATTERN_UNDO_TYPES } from "./Pattern";
import { PATTERN_TRACK_UNDO_TYPES } from "./PatternTrack";
import { SCALE_UNDO_TYPES } from "./Scale";
import { SCALE_TRACK_UNDO_TYPES } from "./ScaleTrack";
import { TRANSPOSITION_UNDO_TYPES } from "./Transposition";
import { SESSION_UNDO_TYPES } from "./Session";
import { INSTRUMENT_UNDO_TYPES } from "./Instrument";
import { isSliceAction } from "./util";

export const UndoTypes = {
  undoSession: "session/undo",
  redoSession: "session/redo",
  undoScales: "scales/undo",
  redoScales: "scales/redo",
  undoPatterns: "patterns/undo",
  redoPatterns: "patterns/redo",
};

export const groupByActionType = (action: PayloadAction) => {
  const { type, payload } = action;
  const isActionTyped = (slice: string) => isSliceAction(slice)(action);

  if (isActionTyped("scales")) {
    return SCALE_UNDO_TYPES[type]?.(action) || type;
  }
  if (isActionTyped("patterns")) {
    return PATTERN_UNDO_TYPES[type]?.(action) || type;
  }
  if (isActionTyped("clips")) {
    return CLIP_UNDO_TYPES[type]?.(action) || type;
  }
  if (isActionTyped("transpositions")) {
    return TRANSPOSITION_UNDO_TYPES[type]?.(action) || type;
  }
  if (isActionTyped("scaleTracks")) {
    return SCALE_TRACK_UNDO_TYPES[type]?.(action) || type;
  }
  if (isActionTyped("patternTracks")) {
    return PATTERN_TRACK_UNDO_TYPES[type]?.(action) || type;
  }
  if (isActionTyped("session")) {
    return SESSION_UNDO_TYPES[type]?.(action) || type;
  }
  if (isActionTyped("instruments")) {
    return INSTRUMENT_UNDO_TYPES[type]?.(action) || type;
  }

  return `${type}:${payload}`;
};
