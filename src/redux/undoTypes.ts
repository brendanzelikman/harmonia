import { PayloadAction } from "@reduxjs/toolkit";
import {
  createClipTag,
  createPatternChordTag,
  createPatternNoteTag,
  createPatternTag,
  createTranspositionTag,
} from "types";
import {
  AddClipsPayload,
  ClearClipsByTrackIdPayload,
  RemoveClipsByTrackIdPayload,
  RemoveClipsPayload,
  SliceClipPayload,
  UpdateClipsPayload,
} from "./slices/clips";
import {
  AddTranspositionsPayload,
  ClearTranspositionsByTrackIdPayload,
  RemoveTranspositionsByTrackIdPayload,
  RemoveTranspositionsPayload,
  UpdateTranspositionsPayload,
} from "./slices/transpositions";
import {
  AddScaleTrackPayload,
  RemoveScaleTrackPayload,
  UpdateScaleTrackPayload,
} from "./slices/scaleTracks";
import { createTrackTag } from "types/tracks";
import {
  AddPatternTrackPayload,
  RemovePatternTrackPayload,
  UpdatePatternTrackPayload,
} from "./slices/patternTracks";
import {
  AddClipsToSessionPayload,
  AddObjectsToSessionPayload,
  AddTrackToSessionPayload,
  ClearTrackInSessionPayload,
  CollapseTracksInSessionPayload,
  ExpandTracksInSessionPayload,
  MigrateTrackInSessionPayload,
  MoveTrackInSessionPayload,
  RemoveClipsFromSessionPayload,
  RemoveObjectsFromSessionPayload,
  RemoveTrackFromSessionPayload,
  RemoveTranspositionsFromSessionPayload,
} from "./slices/sessionMap";
import {
  AddPatterns,
  RemovePatterns,
  UpdatePatterns,
  AddPatternNote,
  AddPatternChord,
  InsertPatternNote,
  RemovePatternNote,
  TransposePattern,
} from "./slices/patterns";

export const UndoTypes = {
  undoSession: "session/undo",
  redoSession: "session/redo",
  undoScales: "scales/undo",
  redoScales: "scales/redo",
  undoPatterns: "patterns/undo",
  redoPatterns: "patterns/redo",
};

type ActionType = {
  type: string;
  payload: any;
};
type ActionGroup = {
  [key: string]: (action: ActionType) => string;
};

const createTag = (items: any[], createTag: (t: any) => string): string => {
  return items.map(createTag).join(",");
};

const groupByPatternAction: ActionGroup = {
  "patterns/addPatterns": (action: PayloadAction<AddPatterns>) => {
    const patternTag = createTag(action.payload, createPatternTag);
    return `ADD_PATTERNS:${patternTag}`;
  },
  "patterns/removePatterns": (action: PayloadAction<RemovePatterns>) => {
    return `REMOVE_PATTERNS:${action.payload.join(",")}`;
  },
  "patterns/updatePatterns": (action: PayloadAction<UpdatePatterns>) => {
    return `UPDATE_PATTERNS:${action.payload.join(",")}`;
  },
  "patterns/addPatternNote": (action: PayloadAction<AddPatternNote>) => {
    const patternNoteTag = createPatternNoteTag(action.payload.patternNote);
    return `ADD_PATTERN_NOTE:${action.payload.id}:${patternNoteTag}`;
  },
  "patterns/addPatternChord": (action: PayloadAction<AddPatternChord>) => {
    const patternChordTag = createPatternChordTag(action.payload.patternChord);
    return `ADD_PATTERN_CHORD:${action.payload.id}:${patternChordTag}`;
  },
  "patterns/insertPatternNote": (action: PayloadAction<InsertPatternNote>) => {
    return `INSERT_PATTERN_NOTE:${action.payload.id}:${action.payload.index}`;
  },
  "patterns/removePatternNote": (action: PayloadAction<RemovePatternNote>) => {
    return `REMOVE_PATTERN_NOTE:${action.payload.id}:${action.payload.index}`;
  },
  "patterns/transposePattern": (action: PayloadAction<TransposePattern>) => {
    return `TRANSPOSE_PATTERN:${action.payload.id}`;
  },
};

const groupByClipAction: ActionGroup = {
  "clips/sliceClip": (action: PayloadAction<SliceClipPayload>) => {
    const { oldClip } = action.payload;
    return `SLICE_CLIP:${oldClip.id}`;
  },
  "clips/addClips": (action: PayloadAction<AddClipsPayload>) => {
    const clips = action.payload.clips || [];
    const transpositions = action.payload.transpositions || [];
    const clipTag = createTag(clips, createClipTag);
    const transpositionTag = createTag(transpositions, createTranspositionTag);
    return `ADD_CLIPS_AND_TRANSPOSITIONS:${clipTag},${transpositionTag}`;
  },
  "clips/removeClips": (action: PayloadAction<RemoveClipsPayload>) => {
    const clips = action.payload.clips || [];
    const transpositions = action.payload.transpositions || [];
    const clipTag = createTag(clips, createClipTag);
    const transpositionTag = createTag(transpositions, createTranspositionTag);
    return `REMOVE_CLIPS_AND_TRANSPOSITIONS:${clipTag},${transpositionTag}`;
  },
  "clips/updateClips": (action: PayloadAction<UpdateClipsPayload>) => {
    const clips = action.payload.clips || [];
    const transpositions = action.payload.transpositions || [];
    const clipTag = createTag(clips, createClipTag);
    const transpositionTag = createTag(transpositions, createTranspositionTag);
    return `UPDATE_CLIPS_AND_TRANSPOSITIONS:${clipTag},${transpositionTag}`;
  },
  "clips/removeClipsByTrackId": (
    action: PayloadAction<RemoveClipsByTrackIdPayload>
  ) => {
    return `REMOVE_TRACK:${action.payload}`;
  },
  "clips/clearClipsByTrackId": (
    action: PayloadAction<ClearClipsByTrackIdPayload>
  ) => {
    return `CLEAR_TRACK:${action.payload}`;
  },
};

const groupByTranspositionAction: ActionGroup = {
  "transpositions/addTranspositions": (
    action: PayloadAction<AddTranspositionsPayload>
  ) => {
    const clips = action.payload.clips || [];
    const transpositions = action.payload.transpositions || [];
    const clipTag = createTag(clips, createClipTag);
    const transpositionTag = createTag(transpositions, createTranspositionTag);
    return `ADD_CLIPS_AND_TRANSPOSITIONS:${clipTag},${transpositionTag}`;
  },
  "transpositions/removeTranspositions": (
    action: PayloadAction<RemoveTranspositionsPayload>
  ) => {
    const clips = action.payload.clips || [];
    const transpositions = action.payload.transpositions || [];
    const clipTag = createTag(clips, createClipTag);
    const transpositionTag = createTag(transpositions, createTranspositionTag);
    return `REMOVE_CLIPS_AND_TRANSPOSITIONS:${clipTag},${transpositionTag}`;
  },
  "transpositions/updateTranspositions": (
    action: PayloadAction<UpdateTranspositionsPayload>
  ) => {
    const clips = action.payload.clips || [];
    const transpositions = action.payload.transpositions || [];
    const clipTag = createTag(clips, createClipTag);
    const transpositionTag = createTag(transpositions, createTranspositionTag);
    return `UPDATE_CLIPS_AND_TRANSPOSITIONS:${clipTag},${transpositionTag}`;
  },
  "transpositions/removeTranspositionsByTrackId": (
    action: PayloadAction<RemoveTranspositionsByTrackIdPayload>
  ) => {
    return `REMOVE_TRACK:${action.payload}`;
  },
  "transpositions/clearTranspositionsByTrackId": (
    action: PayloadAction<ClearTranspositionsByTrackIdPayload>
  ) => {
    return `CLEAR_TRACK:${action.payload}`;
  },
};

const groupByTrackAction: ActionGroup = {
  "scaleTracks/addScaleTrack": (
    action: PayloadAction<AddScaleTrackPayload>
  ) => {
    const trackTag = createTrackTag(action.payload);
    return `ADD_TRACK:${trackTag}`;
  },
  "scaleTracks/removeScaleTrack": (
    action: PayloadAction<RemoveScaleTrackPayload>
  ) => {
    return `REMOVE_TRACK:${action.payload}`;
  },
  "scaleTracks/updateScaleTrack": (
    action: PayloadAction<UpdateScaleTrackPayload>
  ) => {
    return `UPDATE_TRACK:${action.payload.id}`;
  },
  "patternTracks/addPatternTrack": (
    action: PayloadAction<AddPatternTrackPayload>
  ) => {
    const trackTag = createTrackTag(action.payload);
    return `ADD_TRACK:${trackTag}`;
  },
  "patternTracks/removePatternTrack": (
    action: PayloadAction<RemovePatternTrackPayload>
  ) => {
    return `REMOVE_TRACK:${action.payload}`;
  },
  "patternTracks/updatePatternTrack": (
    action: PayloadAction<UpdatePatternTrackPayload>
  ) => {
    return `UPDATE_TRACK:${action.payload.id}`;
  },
};

const groupBySessionAction: ActionGroup = {
  "session/addScaleTrackToSession": (
    action: PayloadAction<AddTrackToSessionPayload>
  ) => {
    return `ADD_TRACK:${action.payload.id}`;
  },
  "session/removeScaleTrackFromSession": (
    action: PayloadAction<RemoveTrackFromSessionPayload>
  ) => {
    return `REMOVE_TRACK:${action.payload}`;
  },
  "session/addPatternTrackToSession": (
    action: PayloadAction<AddTrackToSessionPayload>
  ) => {
    return `ADD_TRACK:${action.payload.id}`;
  },
  "session/removePatternTrackFromSession": (
    action: PayloadAction<RemoveTrackFromSessionPayload>
  ) => {
    return `REMOVE_TRACK:${action.payload}`;
  },
  "session/moveTrackInSession": (
    action: PayloadAction<MoveTrackInSessionPayload>
  ) => {
    return `MOVE_TRACK:${action.payload}`;
  },
  "session/migrateTrackInSession": (
    action: PayloadAction<MigrateTrackInSessionPayload>
  ) => {
    return `MIGRATE_TRACK:${action.payload}`;
  },
  "session/collapseTracksInSession": (
    action: PayloadAction<CollapseTracksInSessionPayload>
  ) => {
    return `COLLAPSE_TRACKS:${action.payload.join(",")}`;
  },
  "session/expandTracksInSession": (
    action: PayloadAction<ExpandTracksInSessionPayload>
  ) => {
    return `EXPAND_TRACKS:${action.payload.join(",")}`;
  },
  "session/clearTrackInSession": (
    action: PayloadAction<ClearTrackInSessionPayload>
  ) => {
    return `CLEAR_TRACK:${action.payload}`;
  },
  "session/addClipsToSession": (
    action: PayloadAction<AddClipsToSessionPayload>
  ) => {
    const clips = action.payload.clips || [];
    const transpositions = action.payload.transpositions || [];
    const clipTag = createTag(clips, createClipTag);
    const transpositionTag = createTag(transpositions, createTranspositionTag);
    return `ADD_CLIPS_AND_TRANSPOSITIONS:${clipTag},${transpositionTag}`;
  },
  "session/removeClipsFromSession": (
    action: PayloadAction<RemoveClipsFromSessionPayload>
  ) => {
    const clips = action.payload.clips || [];
    const transpositions = action.payload.transpositions || [];
    const clipTag = createTag(clips, createClipTag);
    const transpositionTag = createTag(transpositions, createTranspositionTag);
    return `REMOVE_CLIPS_AND_TRANSPOSITIONS:${clipTag},${transpositionTag}`;
  },
  "session/addTranspositionsToSession": (
    action: PayloadAction<AddTranspositionsPayload>
  ) => {
    const clips = action.payload.clips || [];
    const transpositions = action.payload.transpositions || [];
    const clipTag = createTag(clips, createClipTag);
    const transpositionTag = createTag(transpositions, createTranspositionTag);
    return `ADD_CLIPS_AND_TRANSPOSITIONS:${clipTag},${transpositionTag}`;
  },
  "session/removeTranspositionsFromSession": (
    action: PayloadAction<RemoveTranspositionsFromSessionPayload>
  ) => {
    const clips = action.payload.clips || [];
    const transpositions = action.payload.transpositions || [];
    const clipTag = createTag(clips, createClipTag);
    const transpositionTag = createTag(transpositions, createTranspositionTag);
    return `REMOVE_CLIPS_AND_TRANSPOSITIONS:${clipTag},${transpositionTag}`;
  },
  "session/addClipsAndTranspositionsToSession": (
    action: PayloadAction<AddObjectsToSessionPayload>
  ) => {
    const clips = action.payload.clips || [];
    const transpositions = action.payload.transpositions || [];
    const clipTag = createTag(clips, createClipTag);
    const transpositionTag = createTag(transpositions, createTranspositionTag);
    return `ADD_CLIPS_AND_TRANSPOSITIONS:${clipTag},${transpositionTag}`;
  },
  "session/removeClipsAndTranspositionsFromSession": (
    action: PayloadAction<RemoveObjectsFromSessionPayload>
  ) => {
    const clips = action.payload.clips || [];
    const transpositions = action.payload.transpositions || [];
    const clipTag = createTag(clips, createClipTag);
    const transpositionTag = createTag(transpositions, createTranspositionTag);
    return `REMOVE_CLIPS_AND_TRANSPOSITIONS:${clipTag},${transpositionTag}`;
  },
};

export const groupByActionType = (action: PayloadAction) => {
  if (action.type.startsWith("clips/")) {
    return groupByClipAction[action.type](action);
  }
  if (action.type.startsWith("transpositions/")) {
    return groupByTranspositionAction[action.type](action);
  }
  if (action.type.startsWith("scaleTracks/")) {
    return groupByTrackAction[action.type](action);
  }
  if (action.type.startsWith("patternTracks/")) {
    return groupByTrackAction[action.type](action);
  }
  if (action.type.startsWith("session/")) {
    return groupBySessionAction[action.type](action);
  }
  if (action.type.startsWith("patterns/")) {
    return groupByPatternAction[action.type](action);
  }
  return `${action.type}:${action.payload}`;
};
