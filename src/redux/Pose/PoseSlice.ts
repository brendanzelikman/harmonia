import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { union } from "lodash";
import {
  defaultPoseState,
  Pose,
  PoseBlock,
  PoseId,
  PoseUpdate,
} from "types/Pose";

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

export const posesSlice = createSlice({
  name: "poses",
  initialState: defaultPoseState,
  reducers: {
    /** Set the list of pose IDs. */
    setPoseIds: (state, action: PayloadAction<SetPoseIdsPayload>) => {
      state.allIds = action.payload;
    },
    /** Add a new pose. */
    addPose: (state, action: PayloadAction<AddPosePayload>) => {
      const { id } = action.payload;
      state.allIds = union(state.allIds, [id]);
      state.byId[id] = action.payload;
    },
    /** Update an existing pose. */
    updatePose: (state, action: PayloadAction<UpdatePosePayload>) => {
      const { id } = action.payload;
      if (!state.byId[id]) return;
      state.byId[id] = { ...state.byId[id], ...action.payload };
    },
    /** Update a list of existing poses. */
    updatePoses: (state, action: PayloadAction<UpdatePosesPayload>) => {
      const updates = action.payload;
      updates.forEach((update) => {
        const { id } = update;
        if (!state.byId[id]) return;
        state.byId[id] = { ...state.byId[id], ...update };
      });
    },
    /** Remove an existing pose. */
    removePose: (state, action: PayloadAction<RemovePosePayload>) => {
      const id = action.payload;
      state.allIds = state.allIds.filter((poseId) => poseId !== id);
      delete state.byId[id];
    },
    /** Add a pose block to a pose. */
    addPoseBlock: (state, action: PayloadAction<AddPoseBlockPayload>) => {
      const { id, block, index } = action.payload;
      const pose = state.byId[id];
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
      const pose = state.byId[id];
      if (!pose) return;
      state.byId[id].stream[index] = block;
    },
    /** Remove a pose block at a specific index. */
    removePoseBlock: (state, action: PayloadAction<RemovePoseBlockPayload>) => {
      const { id, index } = action.payload;
      const pose = state.byId[id];
      if (!pose) return;
      if (index < 0 || index > pose.stream.length) return;
      state.byId[id].stream.splice(index, 1);
    },
    /** Move a pose block from one index to another. */
    movePoseBlock: (state, action: PayloadAction<MovePoseBlockPayload>) => {
      const { id, oldIndex, newIndex } = action.payload;
      const pose = state.byId[id];
      if (!pose) return;
      const { stream } = pose;
      const block = stream.splice(oldIndex, 1)[0];
      state.byId[id].stream.splice(newIndex, 0, block);
    },
    /** Clear all pose blocks from a pose. */
    clearPose: (state, action: PayloadAction<ClearPosePayload>) => {
      const id = action.payload;
      const pose = state.byId[id];
      if (!pose) return;
      pose.stream = [];
    },
  },
});

export const {
  setPoseIds,
  addPose,
  updatePose,
  updatePoses,
  removePose,
  addPoseBlock,
  updatePoseBlock,
  removePoseBlock,
  movePoseBlock,
  clearPose,
} = posesSlice.actions;

export default posesSlice.reducer;
