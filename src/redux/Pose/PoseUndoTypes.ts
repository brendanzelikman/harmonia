import { PayloadAction } from "@reduxjs/toolkit";
import { ActionGroup } from "redux/util";
import { getClipAsString, getClipUpdateAsString } from "types/Clip";
import { getPoseAsString, getPoseUpdateAsString } from "types/Pose";
import { toString } from "utils/objects";
import * as PoseSlice from "./PoseSlice";
import { getPortalAsString, getPortalUpdateAsString } from "types/Portal";

export const POSE_UNDO_TYPES: ActionGroup = {
  "poses/addPoses": (action: PayloadAction<PoseSlice.AddPosesPayload>) => {
    const { clips, poses, portals } = action.payload;
    const clipTag = toString(clips, getClipAsString);
    const poseTag = toString(poses, getPoseAsString);
    const portalTag = toString(portals, getPortalAsString);
    return `ADD_MEDIA:${clipTag},${poseTag},${portalTag}`;
  },
  "poses/_updatePoses": (
    action: PayloadAction<PoseSlice.UpdatePosesPayload>
  ) => {
    const { clips, poses, portals } = action.payload;
    const clipTag = toString(clips, getClipUpdateAsString);
    const poseTag = toString(poses, getPoseUpdateAsString);
    const portalTag = toString(portals, getPortalUpdateAsString);
    return `UPDATE_MEDIA:${clipTag},${poseTag},${portalTag}`;
  },
  "poses/removePoses": (
    action: PayloadAction<PoseSlice.RemovePosesPayload>
  ) => {
    const { clipIds, poseIds, portalIds } = action.payload;
    const clipTag = toString(clipIds);
    const poseTag = toString(poseIds);
    const portalTag = toString(portalIds);
    return `REMOVE_MEDIA:${clipTag},${poseTag},${portalTag}`;
  },
  "poses/_slicePose": (action: PayloadAction<PoseSlice.SlicePosePayload>) => {
    const { oldPose, firstPose, secondPose } = action.payload;
    return `SLICE_MEDIA:${oldPose.id},${firstPose.id},${secondPose.id}`;
  },
  "poses/clearPosesByTrackId": (
    action: PayloadAction<PoseSlice.ClearPosesByTrackIdPayload>
  ) => {
    return `CLEAR_TRACK:${action.payload}`;
  },
  "poses/removePosesByTrackId": (
    action: PayloadAction<PoseSlice.RemovePosesByTrackIdPayload>
  ) => {
    return `REMOVE_TRACK:${action.payload.originalId}`;
  },
};
