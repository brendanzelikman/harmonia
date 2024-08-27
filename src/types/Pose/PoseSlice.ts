import { createEntityAdapter, PayloadAction } from "@reduxjs/toolkit";
import { union } from "lodash";
import { PoseId, Pose, PoseUpdate, PoseBlock } from "./PoseTypes";
import { Action, createNormalSlice } from "lib/redux";

// ------------------------------------------------------------
// Pose Payload Types
// ------------------------------------------------------------

/** The list of pose IDs can be directly set (used for dragging). */
export type SetPoseIdsPayload = PoseId[];

/** A pose can be added to the slice. */
export type AddPosePayload = Pose;

/** A pose can be updated with any property. */
export type UpdatePosePayload = PoseUpdate;

/** A list of poses can be updated. */
export type UpdatePosesPayload = PoseUpdate[];

/** A pose can be removed by ID. */
export type RemovePosePayload = PoseId;

/** A pose block can be added at a specific index. */
export type AddPoseBlockPayload = {
  id: PoseId;
  block: PoseBlock;
  index?: number;
};

/** A pose block can be updated at a specific index. */
export type UpdatePoseBlockPayload = {
  id: PoseId;
  block: PoseBlock;
  index: number;
};

/** A pose block can be removed by index. */
export type RemovePoseBlockPayload = {
  id: PoseId;
  index: number;
};

/** A pose block can be moved from one index to another. */
export type MovePoseBlockPayload = {
  id: PoseId;
  oldIndex: number;
  newIndex: number;
};

/** A pose can be cleared of all blocks */
export type ClearPosePayload = PoseId;

// ------------------------------------------------------------
// Pose Slice Definition
// ------------------------------------------------------------

export const poseAdapter = createEntityAdapter<Pose>();
export const defaultPoseState = poseAdapter.getInitialState();

export const posesSlice = createNormalSlice({
  name: "poses",
  adapter: poseAdapter,
  reducers: {
    /** Add a pose block to a pose. */
    addPoseBlock: (state, action: PayloadAction<AddPoseBlockPayload>) => {
      const { id, block, index } = action.payload;
      const pose = state.entities[id];
      if (!pose) return;
      const { stream } = pose;
      if (index === undefined) {
        stream.push(block);
      } else {
        stream.splice(index, 0, block);
      }
    },
    /** Update a pose block at a specific index. */
    updatePoseBlock: (state, action: PayloadAction<UpdatePoseBlockPayload>) => {
      const { id, block, index } = action.payload;
      const pose = state.entities[id];
      if (!pose) return;
      pose.stream[index] = block;
    },
    /** Remove a pose block at a specific index. */
    removePoseBlock: (state, action: PayloadAction<RemovePoseBlockPayload>) => {
      const { id, index } = action.payload;
      const pose = state.entities[id];
      if (!pose) return;
      if (index < 0 || index > pose.stream.length) return;
      pose.stream.splice(index, 1);
    },
    /** Move a pose block from one index to another. */
    movePoseBlock: (state, action: PayloadAction<MovePoseBlockPayload>) => {
      const { id, oldIndex, newIndex } = action.payload;
      const pose = state.entities[id];
      if (!pose) return;
      const { stream } = pose;
      const block = stream.splice(oldIndex, 1)[0];
      pose.stream.splice(newIndex, 0, block);
    },
    /** Clear all pose blocks from a pose. */
    clearPose: (state, action: PayloadAction<ClearPosePayload>) => {
      const id = action.payload;
      const pose = state.entities[id];
      if (!pose) return;
      pose.stream = [];
    },
  },
});

export const {
  setIds: setPoseIds,
  addOne: addPose,
  addMany: addPoses,
  updateOne: updatePose,
  updateMany: updatePoses,
  removeOne: removePose,
  removeMany: removePoses,
  addPoseBlock,
  updatePoseBlock,
  removePoseBlock,
  movePoseBlock,
  clearPose,
} = posesSlice.actions;

export default posesSlice.reducer;
