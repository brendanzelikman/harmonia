import { PayloadAction } from "@reduxjs/toolkit";
import { ActionGroup } from "types/units";
import { getClipTag } from "types/Clip";
import { getTranspositionTag } from "types/Transposition";
import { createTag } from "types/util";
import * as SessionSlice from "./SessionSlice";
import { getTrackTag } from "types/Track";

export const SESSION_UNDO_TYPES: ActionGroup = {
  "session/addScaleTrackToSession": (
    action: PayloadAction<SessionSlice.AddTrackToSessionPayload>
  ) => {
    const tag = createTag(action.payload, getTrackTag);
    return `ADD_TRACK:${tag}`;
  },
  "session/removeScaleTrackFromSession": (
    action: PayloadAction<SessionSlice.RemoveTrackFromSessionPayload>
  ) => {
    return `REMOVE_TRACK:${action.payload}`;
  },
  "session/addPatternTrackToSession": (
    action: PayloadAction<SessionSlice.AddTrackToSessionPayload>
  ) => {
    const tag = createTag(action.payload, getTrackTag);
    return `ADD_TRACK:${tag}`;
  },
  "session/removePatternTrackFromSession": (
    action: PayloadAction<SessionSlice.RemoveTrackFromSessionPayload>
  ) => {
    return `REMOVE_TRACK:${action.payload}`;
  },
  "session/moveTrackInSession": (
    action: PayloadAction<SessionSlice.MoveTrackInSessionPayload>
  ) => {
    return `MOVE_TRACK:${action.payload}`;
  },
  "session/migrateTrackInSession": (
    action: PayloadAction<SessionSlice.MigrateTrackInSessionPayload>
  ) => {
    return `MIGRATE_TRACK:${action.payload}`;
  },
  "session/collapseTracksInSession": (
    action: PayloadAction<SessionSlice.CollapseTracksInSessionPayload>
  ) => {
    return `COLLAPSE_TRACKS:${action.payload.join(",")}`;
  },
  "session/expandTracksInSession": (
    action: PayloadAction<SessionSlice.ExpandTracksInSessionPayload>
  ) => {
    return `EXPAND_TRACKS:${action.payload.join(",")}`;
  },
  "session/clearTrackInSession": (
    action: PayloadAction<SessionSlice.ClearTrackInSessionPayload>
  ) => {
    return `CLEAR_TRACK:${action.payload}`;
  },
  "session/addMediaToSession": (
    action: PayloadAction<SessionSlice.AddObjectsToSessionPayload>
  ) => {
    const clips = action.payload.clips || [];
    const transpositions = action.payload.transpositions || [];
    const clipTag = createTag(clips, getClipTag);
    const transpositionTag = createTag(transpositions, getTranspositionTag);
    return `ADD_MEDIA:${clipTag};${transpositionTag}`;
  },
  "session/removeMediaFromSession": (
    action: PayloadAction<SessionSlice.RemoveObjectsFromSessionPayload>
  ) => {
    const clips = action.payload.clips || [];
    const transpositions = action.payload.transpositions || [];
    const clipTag = createTag(clips, getClipTag);
    const transpositionTag = createTag(transpositions, getTranspositionTag);
    return `REMOVE_MEDIA:${clipTag},${transpositionTag}`;
  },
};
