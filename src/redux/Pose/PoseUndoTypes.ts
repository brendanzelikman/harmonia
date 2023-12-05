import * as _ from "./PoseSlice";
import { PayloadAction } from "@reduxjs/toolkit";
import { ActionGroup } from "redux/util";
import {
  getPoseAsString,
  getPoseBlockAsString,
  getPoseUpdateAsString,
} from "types/Pose";
import { toString } from "utils/objects";

export const POSE_UNDO_TYPES: ActionGroup = {
  "poses/addPose": (action: PayloadAction<_.AddPosePayload>) => {
    const poseTag = getPoseAsString(action.payload);
    return `ADD_POSE:${poseTag}`;
  },
  "poses/updatePose": (action: PayloadAction<_.UpdatePosePayload>) => {
    const poseTag = getPoseUpdateAsString(action.payload);
    return `UPDATE_POSE:${poseTag}`;
  },
  "poses/updatePoses": (action: PayloadAction<_.UpdatePosesPayload>) => {
    const poseTag = toString(action.payload, getPoseUpdateAsString);
    return `UPDATE_POSES:${poseTag}`;
  },
  "poses/removePose": (action: PayloadAction<_.RemovePosePayload>) => {
    return `REMOVE_POSE:${action.payload}`;
  },
  "poses/addPoseBlock": (action: PayloadAction<_.AddPoseBlockPayload>) => {
    const { id, block, index } = action.payload;
    const blockTag = getPoseBlockAsString(block);
    return `ADD_POSE_BLOCK:${id},${index},${blockTag}`;
  },
  "poses/updatePoseBlock": (
    action: PayloadAction<_.UpdatePoseBlockPayload>
  ) => {
    const { id, index, block } = action.payload;
    const blockTag = getPoseBlockAsString(block);
    return `UPDATE_POSE_BLOCK:${id},${index},${blockTag}`;
  },
  "poses/removePoseBlock": (
    action: PayloadAction<_.RemovePoseBlockPayload>
  ) => {
    const { id, index } = action.payload;
    return `REMOVE_POSE_BLOCK:${id},${index}`;
  },
  "poses/movePoseBlock": (action: PayloadAction<_.MovePoseBlockPayload>) => {
    const { id, oldIndex, newIndex } = action.payload;
    return `MOVE_POSE_BLOCK:${id},${oldIndex},${newIndex}`;
  },
  "poses/clearPose": (action: PayloadAction<_.ClearPosePayload>) => {
    return `CLEAR_POSE:${action.payload}`;
  },
};
