import { PayloadAction } from "@reduxjs/toolkit";
import { ActionGroup } from "types/units";
import { getClipTag } from "types/Clip";
import { getTranspositionTag } from "types/Transposition";
import { createTag } from "types/util";
import * as ClipSlice from "./ClipSlice";

export const CLIP_UNDO_TYPES: ActionGroup = {
  "clips/addClips": (action: PayloadAction<ClipSlice.AddClipsPayload>) => {
    const clips = action.payload.clips || [];
    const transpositions = action.payload.transpositions || [];
    const clipTag = createTag(clips, getClipTag);
    const transpositionTag = createTag(transpositions, getTranspositionTag);
    return `ADD_MEDIA:${clipTag},${transpositionTag}`;
  },
  "clips/removeClips": (
    action: PayloadAction<ClipSlice.RemoveClipsPayload>
  ) => {
    const clips = action.payload.clips || [];
    const transpositions = action.payload.transpositions || [];
    const clipTag = createTag(clips, getClipTag);
    const transpositionTag = createTag(transpositions, getTranspositionTag);
    return `REMOVE_MEDIA:${clipTag},${transpositionTag}`;
  },
  "clips/updateClips": (
    action: PayloadAction<ClipSlice.UpdateClipsPayload>
  ) => {
    const clips = action.payload.clips || [];
    const transpositions = action.payload.transpositions || [];
    const clipTag = createTag(clips, getClipTag);
    const transpositionTag = createTag(transpositions, getTranspositionTag);
    return `UPDATE_MEDIA:${clipTag},${transpositionTag}`;
  },
  "clips/_sliceClip": (action: PayloadAction<ClipSlice.SliceClipPayload>) => {
    const { oldClip, firstClip, secondClip } = action.payload;
    return `SLICE_MEDIA:${oldClip.id},${firstClip.id},${secondClip.id}`;
  },
  "clips/removeClipsByTrackId": (
    action: PayloadAction<ClipSlice.RemoveClipsByTrackIdPayload>
  ) => {
    return `REMOVE_TRACK:${action.payload}`;
  },
  "clips/clearClipsByTrackId": (
    action: PayloadAction<ClipSlice.ClearClipsByTrackIdPayload>
  ) => {
    return `CLEAR_TRACK:${action.payload}`;
  },
};
