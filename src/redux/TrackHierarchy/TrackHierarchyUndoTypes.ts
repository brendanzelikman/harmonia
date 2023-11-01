import * as _ from ".";

import { PayloadAction } from "@reduxjs/toolkit";
import { ActionGroup } from "redux/util";
import { getClipAsString, getClipUpdateAsString } from "types/Clip";
import {
  getTranspositionAsString,
  getTranspositionUpdateAsString,
} from "types/Transposition";
import { toString } from "utils/objects";
import { getTrackAsString } from "types/Track";

export const TRACK_HIERARCHY_UNDO_TYPES: ActionGroup = {
  "trackHierarchy/addScaleTrackToHierarchy": (
    action: PayloadAction<_.AddTrackToHierarchyPayload>
  ) => {
    const tag = toString(action.payload, getTrackAsString);
    return `ADD_TRACK:${tag}`;
  },
  "trackHierarchy/removeScaleTrackFromHierarchy": (
    action: PayloadAction<_.RemoveTrackFromHierarchyPayload>
  ) => {
    return `REMOVE_TRACK:${action.payload}`;
  },
  "trackHierarchy/addPatternTrackToHierarchy": (
    action: PayloadAction<_.AddTrackToHierarchyPayload>
  ) => {
    const tag = toString(action.payload, getTrackAsString);
    return `ADD_TRACK:${tag}`;
  },
  "trackHierarchy/removePatternTrackFromHierarchy": (
    action: PayloadAction<_.RemoveTrackFromHierarchyPayload>
  ) => {
    return `REMOVE_TRACK:${action.payload}`;
  },
  "trackHierarchy/moveTrackInHierarchy": (
    action: PayloadAction<_.MoveTrackInHierarchyPayload>
  ) => {
    return `MOVE_TRACK:${action.payload}`;
  },
  "trackHierarchy/migrateTrackInHierarchy": (
    action: PayloadAction<_.MigrateTrackInHierarchyPayload>
  ) => {
    return `MIGRATE_TRACK:${action.payload}`;
  },
  "trackHierarchy/collapseTracksInHierarchy": (
    action: PayloadAction<_.CollapseTracksInHierarchyPayload>
  ) => {
    return `COLLAPSE_TRACKS:${action.payload.join(",")}`;
  },
  "trackHierarchy/expandTracksInHierarchy": (
    action: PayloadAction<_.ExpandTracksInHierarchyPayload>
  ) => {
    return `EXPAND_TRACKS:${action.payload.join(",")}`;
  },
  "trackHierarchy/clearTrackInHierarchy": (
    action: PayloadAction<_.ClearTrackInHierarchyPayload>
  ) => {
    return `CLEAR_TRACK:${action.payload}`;
  },
  "trackHierarchy/addMediaToHierarchy": (
    action: PayloadAction<_.AddMediaToHierarchyPayload>
  ) => {
    const { clips, transpositions } = action.payload;
    const clipTag = toString(clips, getClipAsString);
    const poseTag = toString(transpositions, getTranspositionAsString);
    return `ADD_MEDIA:${clipTag},${poseTag}`;
  },
  "trackHierarchy/removeMediaFromHierarchy": (
    action: PayloadAction<_.RemoveMediaFromHierarchyPayload>
  ) => {
    const { clipIds, transpositionIds } = action.payload;
    const clipTag = toString(clipIds);
    const poseTag = toString(transpositionIds);
    return `REMOVE_MEDIA:${clipTag},${poseTag}`;
  },
  "trackHierarchy/updateMediaInHierarchy": (
    action: PayloadAction<_.UpdateMediaInHierarchyPayload>
  ) => {
    const { clips, transpositions } = action.payload;
    const clipTag = toString(clips, getClipUpdateAsString);
    const poseTag = toString(transpositions, getTranspositionUpdateAsString);
    return `UPDATE_MEDIA:${clipTag},${poseTag}`;
  },
  "trackHierarchy/sliceMediaInHierarchy": (
    action: PayloadAction<_.SliceMediaInHierarchyPayload>
  ) => {
    const { oldId, newIds } = action.payload;
    return `SLICE_MEDIA:${oldId},${newIds.join(",")}`;
  },
};
