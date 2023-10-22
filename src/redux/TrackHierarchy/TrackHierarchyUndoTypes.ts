import { PayloadAction } from "@reduxjs/toolkit";
import { ActionGroup } from "types/units";
import { getClipTag } from "types/Clip";
import { getTranspositionTag } from "types/Transposition";
import { createTag } from "types/util";
import * as HierarchySlice from ".";
import { getTrackTag } from "types/Track";

export const TRACK_HIERARCHY_UNDO_TYPES: ActionGroup = {
  "trackHierarchy/addScaleTrackToHierarchy": (
    action: PayloadAction<HierarchySlice.AddTrackToHierarchyPayload>
  ) => {
    const tag = createTag(action.payload, getTrackTag);
    return `ADD_TRACK:${tag}`;
  },
  "trackHierarchy/removeScaleTrackFromHierarchy": (
    action: PayloadAction<HierarchySlice.RemoveTrackFromHierarchyPayload>
  ) => {
    return `REMOVE_TRACK:${action.payload}`;
  },
  "trackHierarchy/addPatternTrackToHierarchy": (
    action: PayloadAction<HierarchySlice.AddTrackToHierarchyPayload>
  ) => {
    const tag = createTag(action.payload, getTrackTag);
    return `ADD_TRACK:${tag}`;
  },
  "trackHierarchy/removePatternTrackFromHierarchy": (
    action: PayloadAction<HierarchySlice.RemoveTrackFromHierarchyPayload>
  ) => {
    return `REMOVE_TRACK:${action.payload}`;
  },
  "trackHierarchy/moveTrackInHierarchy": (
    action: PayloadAction<HierarchySlice.MoveTrackInHierarchyPayload>
  ) => {
    return `MOVE_TRACK:${action.payload}`;
  },
  "trackHierarchy/migrateTrackInHierarchy": (
    action: PayloadAction<HierarchySlice.MigrateTrackInHierarchyPayload>
  ) => {
    return `MIGRATE_TRACK:${action.payload}`;
  },
  "trackHierarchy/collapseTracksInHierarchy": (
    action: PayloadAction<HierarchySlice.CollapseTracksInHierarchyPayload>
  ) => {
    return `COLLAPSE_TRACKS:${action.payload.join(",")}`;
  },
  "trackHierarchy/expandTracksInHierarchy": (
    action: PayloadAction<HierarchySlice.ExpandTracksInHierarchyPayload>
  ) => {
    return `EXPAND_TRACKS:${action.payload.join(",")}`;
  },
  "trackHierarchy/clearTrackInHierarchy": (
    action: PayloadAction<HierarchySlice.ClearTrackInHierarchyPayload>
  ) => {
    return `CLEAR_TRACK:${action.payload}`;
  },
  "trackHierarchy/addMediaToHierarchy": (
    action: PayloadAction<HierarchySlice.AddMediaToHierarchyPayload>
  ) => {
    const clips = action.payload.clips || [];
    const transpositions = action.payload.transpositions || [];
    const clipTag = createTag(clips, getClipTag);
    const transpositionTag = createTag(transpositions, getTranspositionTag);
    return `ADD_MEDIA:${clipTag},${transpositionTag}`;
  },
  "trackHierarchy/removeMediaFromHierarchy": (
    action: PayloadAction<HierarchySlice.RemoveMediaFromHierarchyPayload>
  ) => {
    const clips = action.payload.clips || [];
    const transpositions = action.payload.transpositions || [];
    const clipTag = createTag(clips, getClipTag);
    const transpositionTag = createTag(transpositions, getTranspositionTag);
    return `REMOVE_MEDIA:${clipTag},${transpositionTag}`;
  },
  "trackHierarchy/updateMediaInHierarchy": (
    action: PayloadAction<HierarchySlice.UpdateMediaInHierarchyPayload>
  ) => {
    const clips = action.payload.clips || [];
    const transpositions = action.payload.transpositions || [];
    const clipTag = createTag(clips, getClipTag);
    const transpositionTag = createTag(transpositions, getTranspositionTag);
    return `UPDATE_MEDIA:${clipTag},${transpositionTag}`;
  },
  "trackHierarchy/sliceMediaInHierarchy": (
    action: PayloadAction<HierarchySlice.SliceMediaInHierarchyPayload>
  ) => {
    const { oldId, newIds } = action.payload;
    return `SLICE_MEDIA:${oldId},${newIds.join(",")}`;
  },
};
