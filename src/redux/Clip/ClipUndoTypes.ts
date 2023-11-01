import * as _ from "./ClipSlice";
import { PayloadAction } from "@reduxjs/toolkit";
import { ActionGroup } from "redux/util";
import { getClipAsString, getClipUpdateAsString } from "types/Clip";
import {
  getTranspositionAsString,
  getTranspositionUpdateAsString,
} from "types/Transposition";
import { toString } from "utils/objects";

export const CLIP_UNDO_TYPES: ActionGroup = {
  "clips/addClips": (action: PayloadAction<_.AddClipsPayload>) => {
    const { clips, transpositions } = action.payload;
    const clipTag = toString(clips, getClipAsString);
    const poseTag = toString(transpositions, getTranspositionAsString);
    return `ADD_MEDIA:${clipTag},${poseTag}`;
  },
  "clips/updateClips": (action: PayloadAction<_.UpdateClipsPayload>) => {
    const { clips, transpositions } = action.payload;
    const clipTag = toString(clips, getClipUpdateAsString);
    const poseTag = toString(transpositions, getTranspositionUpdateAsString);
    return `UPDATE_MEDIA:${clipTag},${poseTag}`;
  },
  "clips/removeClips": (action: PayloadAction<_.RemoveClipsPayload>) => {
    const { clipIds, transpositionIds } = action.payload;
    return `REMOVE_MEDIA:${clipIds.join(",")},${transpositionIds.join(",")}`;
  },
  "clips/_sliceClip": (action: PayloadAction<_.SliceClipPayload>) => {
    const { oldClip, firstClip, secondClip } = action.payload;
    return `SLICE_MEDIA:${oldClip.id},${firstClip.id},${secondClip.id}`;
  },
  "clips/removeClipsByTrackId": (
    action: PayloadAction<_.RemoveClipsByTrackIdPayload>
  ) => {
    return `REMOVE_TRACK:${action.payload}`;
  },
  "clips/clearClipsByTrackId": (
    action: PayloadAction<_.ClearClipsByTrackIdPayload>
  ) => {
    return `CLEAR_TRACK:${action.payload}`;
  },
};
