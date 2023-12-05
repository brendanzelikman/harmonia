import * as _ from "./ClipSlice";
import { PayloadAction } from "@reduxjs/toolkit";
import { ActionGroup } from "redux/util";
import { getClipUpdateAsString } from "types/Clip";
import { getPortalUpdateAsString } from "types/Portal";
import { toString } from "utils/objects";

export const CLIP_UNDO_TYPES: ActionGroup = {
  "clips/addClips": (action: PayloadAction<_.AddClipsPayload>) => {
    const { clips, portals, callerId } = action.payload;
    const clipTag = toString(clips, JSON.stringify);
    const portalTag = toString(portals, JSON.stringify);

    if (callerId) return `ADD_TRACK:${callerId}`;
    return `ADD_MEDIA:${clipTag},${portalTag}`;
  },
  "clips/updateClips": (action: PayloadAction<_.UpdateClipsPayload>) => {
    const { clips, portals } = action.payload;
    const clipTag = toString(clips, getClipUpdateAsString);
    const portalTag = toString(portals, getPortalUpdateAsString);
    return `UPDATE_MEDIA:${clipTag},${portalTag}`;
  },
  "clips/removeClips": (action: PayloadAction<_.RemoveClipsPayload>) => {
    const { clipIds, portalIds, callerId, tag } = action.payload;
    const clipTag = toString(clipIds);
    const portalTag = toString(portalIds);

    if (callerId && tag === "CLEAR") return `CLEAR_TRACK:${callerId}`;
    if (callerId && tag === "REMOVE") return `REMOVE_TRACK:${callerId}`;

    return `REMOVE_MEDIA:${clipTag},${portalTag}`;
  },
  "clips/_sliceClip": (action: PayloadAction<_.SliceClipPayload>) => {
    const { oldClip, firstClip, secondClip } = action.payload;
    return `SLICE_MEDIA:${oldClip.id},${firstClip.id},${secondClip.id}`;
  },
  "clips/_mergeClips": (action: PayloadAction<_.MergeClipsPayload>) => {
    const { oldClips, newClip } = action.payload;
    const clipTag = toString(oldClips);
    return `MERGE_MEDIA:${clipTag},${newClip.id}`;
  },
};
