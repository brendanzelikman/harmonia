import { PayloadAction } from "@reduxjs/toolkit";
import { CLIP_UNDO_TYPES } from "./Clip/ClipUndoTypes";
import { PATTERN_UNDO_TYPES } from "./Pattern/PatternUndoTypes";
import { PATTERN_TRACK_UNDO_TYPES } from "./PatternTrack/PatternTrackUndoTypes";
import { SCALE_UNDO_TYPES } from "./Scale/ScaleUndoTypes";
import { SCALE_TRACK_UNDO_TYPES } from "./ScaleTrack/ScaleTrackUndoTypes";
import { TRANSPOSITION_UNDO_TYPES } from "./Transposition/TranspositionUndoTypes";
import { TRACK_HIERARCHY_UNDO_TYPES } from "./TrackHierarchy/TrackHierarchyUndoTypes";
import { INSTRUMENT_UNDO_TYPES } from "./Instrument/InstrumentUndoTypes";
import { isSliceAction } from "./util";

export const UndoTypes = {
  undoArrangement: "arrangement/undo",
  redoArrangement: "arrangement/redo",
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
  if (isActionTyped("instruments")) {
    return INSTRUMENT_UNDO_TYPES[type]?.(action) || type;
  }
  if (isActionTyped("trackHierarchy")) {
    return TRACK_HIERARCHY_UNDO_TYPES[type]?.(action) || type;
  }
  return `${type}:${payload}`;
};
