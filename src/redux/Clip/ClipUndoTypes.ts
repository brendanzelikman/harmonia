import * as _ from "./ClipSlice";
import { PayloadAction } from "@reduxjs/toolkit";
import { ActionGroup } from "redux/util";
import { getClipAsString, getClipUpdateAsString } from "types/Clip";
import { getPortalAsString, getPortalUpdateAsString } from "types/Portal";
import {
  getTranspositionAsString,
  getTranspositionUpdateAsString,
} from "types/Transposition";
import { toString } from "utils/objects";

export const CLIP_UNDO_TYPES: ActionGroup = {
  "clips/addClips": (action: PayloadAction<_.AddClipsPayload>) => {
    const { clips, poses, portals } = action.payload;
    const clipTag = toString(clips, getClipAsString);
    const poseTag = toString(poses, getTranspositionAsString);
    const portalTag = toString(portals, getPortalAsString);
    return `ADD_MEDIA:${clipTag},${poseTag},${portalTag}`;
  },
  "clips/_updateClips": (action: PayloadAction<_.UpdateClipsPayload>) => {
    const { clips, poses, portals } = action.payload;
    const clipTag = toString(clips, getClipUpdateAsString);
    const poseTag = toString(poses, getTranspositionUpdateAsString);
    const portalTag = toString(portals, getPortalUpdateAsString);
    return `UPDATE_MEDIA:${clipTag},${poseTag},${portalTag}`;
  },
  "clips/removeClips": (action: PayloadAction<_.RemoveClipsPayload>) => {
    const { clipIds, poseIds, portalIds } = action.payload;
    const clipTag = toString(clipIds);
    const poseTag = toString(poseIds);
    const portalTag = toString(portalIds);
    return `REMOVE_MEDIA:${clipTag},${poseTag},${portalTag}`;
  },
  "clips/_sliceClip": (action: PayloadAction<_.SliceClipPayload>) => {
    const { oldClip, firstClip, secondClip } = action.payload;
    return `SLICE_MEDIA:${oldClip.id},${firstClip.id},${secondClip.id}`;
  },
  "clips/clearClipsByTrackId": (
    action: PayloadAction<_.ClearClipsByTrackIdPayload>
  ) => {
    return `CLEAR_TRACK:${action.payload}`;
  },
  "clips/removeClipsByTrackId": (
    action: PayloadAction<_.RemoveClipsByTrackIdPayload>
  ) => {
    return `REMOVE_TRACK:${action.payload.originalId}`;
  },
};
