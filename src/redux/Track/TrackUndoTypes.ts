import * as _ from "./TrackSlice";
import { PayloadAction } from "@reduxjs/toolkit";
import { ActionGroup } from "redux/util";

export const TRACK_UNDO_TYPES: ActionGroup = {
  "tracks/addTrack": (action: PayloadAction<_.AddTrackPayload>) => {
    const { track, callerId } = action.payload;
    const id = callerId || track.id;
    return `ADD_TRACK:${id}`;
  },
  "tracks/removeTrack": (action: PayloadAction<_.RemoveTrackPayload>) => {
    return `REMOVE_TRACK:${action.payload}`;
  },
  "tracks/renameTrack": (action: PayloadAction<_.RenameTrackPayload>) => {
    return `RENAME_TRACK:${action.payload.id},${action.payload.name}`;
  },
  "tracks/moveTrack": (action: PayloadAction<_.MoveTrackPayload>) => {
    return `MOVE_TRACK:${action.payload.id},${action.payload.index}`;
  },
  "tracks/migrateTrack": (action: PayloadAction<_.MigrateTrackPayload>) => {
    return `MIGRATE_TRACK:${action.payload.id},${action.payload.parentId},${action.payload.index}`;
  },
  "tracks/collapseTracks": (action: PayloadAction<_.CollapseTracksPayload>) => {
    return `COLLAPSE_TRACKS:${action.payload.join(",")}`;
  },
  "tracks/expandTracks": (action: PayloadAction<_.ExpandTracksPayload>) => {
    return `EXPAND_TRACKS:${action.payload.join(",")}`;
  },
};
