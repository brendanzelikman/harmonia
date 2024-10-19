import { createEntityAdapter, PayloadAction } from "@reduxjs/toolkit";
import { PoseId, Pose, PoseBlock, PoseTransformation } from "./PoseTypes";
import { createNormalSlice } from "lib/redux";
import { TransformationArgs } from "types/Pattern/PatternTransformers";
import { inRange } from "lodash";

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
    addPoseBlock: (
      state,
      action: PayloadAction<{
        id: PoseId;
        block: PoseBlock;
        index?: number;
        depths?: number[];
      }>
    ) => {
      const { id, block, index, depths } = action.payload;
      const pose = state.entities[id];
      if (!pose) return;
      const { stream } = pose;
      let target = stream;
      if (depths !== undefined) {
        for (const depth of depths) {
          if (!inRange(depth, 0, target.length)) return;
          const block = target[depth];
          if (!block || !("stream" in block)) return;
          target = block.stream;
        }
      }
      if (index === undefined) {
        target.push(block);
      } else {
        target.splice(index, 0, block);
      }
    },
    /** Add a pose block operation to a pose. */
    addPoseBlockTransformation: (
      state,
      action: PayloadAction<{
        id: PoseId;
        index: number;
        transformation: PoseTransformation;
        depths?: number[];
      }>
    ) => {
      const { id, transformation, index, depths } = action.payload;
      const pose = state.entities[id];
      if (!pose) return;
      let target = pose.stream;
      if (depths !== undefined) {
        depths.forEach((depth) => {
          if (!inRange(depth, 0, target.length)) return;
          const block = target[depth];
          if (!block || !("stream" in block)) return;
          target = block.stream;
        });
      }
      const block = target[index];
      if (!block) return;
      if ("operations" in block) {
        block.operations = [...(block.operations ?? []), transformation];
      } else {
        target[index] = { ...block, operations: [transformation] };
      }
    },
    /** Update a pose block at a specific index. */
    updatePoseBlock: (
      state,
      action: PayloadAction<{
        id: PoseId;
        block: PoseBlock;
        index: number;
        depths?: number[];
      }>
    ) => {
      const { id, block, index, depths } = action.payload;
      const pose = state.entities[id];
      if (!pose) return;
      let target = pose.stream;
      if (depths !== undefined) {
        for (const depth of depths) {
          if (!inRange(depth, 0, target.length)) return;
          const block = target[depth];
          if (!block || !("stream" in block)) return;
          target = block.stream;
        }
      }
      if (!inRange(index, 0, target.length)) return;
      target[index] = block;
    },
    /** Update a pose block transformation at a specific index. */
    updatePoseBlockTransformation: (
      state,
      action: PayloadAction<{
        id: PoseId;
        index: number;
        transformationIndex: number;
        transformation: TransformationArgs;
        depths?: number[];
      }>
    ) => {
      const { id, index, transformationIndex, transformation, depths } =
        action.payload;
      const pose = state.entities[id];
      if (!pose) return;
      let target = pose.stream;
      if (depths !== undefined) {
        depths.forEach((depth) => {
          if (!inRange(depth, 0, target.length)) return;
          const block = target[depth];
          if (!block || !("stream" in block)) return;
          target = block.stream;
        });
      }
      const block = target[index];
      if (!block || !("operations" in block) || !block.operations) return;
      const operations = block.operations;
      const operation = operations[transformationIndex];
      if (!operation) return;
      block.operations[transformationIndex] = {
        ...operation,
        ...transformation,
      };
    },
    /** Swap a pose block with another index. */
    swapPoseBlock: (
      state,
      action: PayloadAction<{
        id: PoseId;
        index: number;
        newIndex: number;
        depths?: number[];
      }>
    ) => {
      const { id, index, newIndex, depths } = action.payload;
      const pose = state.entities[id];
      if (!pose) return;
      const { stream } = pose;
      let target = stream;
      if (depths !== undefined) {
        depths.forEach((depth) => {
          if (!inRange(depth, 0, target.length)) return;
          const block = target[depth];
          if (!block || !("stream" in block)) return;
          target = block.stream;
        });
      }
      const block = target.splice(index, 1)[0];
      target.splice(newIndex, 0, block);
    },
    /** Swap a pose block transformation with another index. */
    swapPoseBlockTransformation: (
      state,
      action: PayloadAction<{
        id: PoseId;
        index: number;
        transformationIndex: number;
        newIndex: number;
        depths?: number[];
      }>
    ) => {
      const { id, index, transformationIndex, newIndex, depths } =
        action.payload;
      const pose = state.entities[id];
      if (!pose) return;
      let target = pose.stream;
      if (depths !== undefined) {
        depths.forEach((depth) => {
          if (!inRange(depth, 0, target.length)) return;
          const block = target[depth];
          if (!block || !("stream" in block)) return;
          target = block.stream;
        });
      }
      const block = target[index];
      if (!block) return;
      const operations = "operations" in block ? block.operations ?? [] : [];
      const operation = operations[transformationIndex];
      if (!operation) return;
      if (newIndex < 0 || newIndex >= operations.length) return;
      operations.splice(transformationIndex, 1);
      operations.splice(newIndex, 0, operation);
    },
    /** Remove a pose block at a specific index. */
    removePoseBlock: (
      state,
      action: PayloadAction<{
        id: PoseId;
        index: number;
        depths?: number[];
      }>
    ) => {
      const { id, index, depths } = action.payload;
      const pose = state.entities[id];
      if (!pose) return;
      let target = pose.stream;
      if (depths !== undefined) {
        depths.forEach((depth) => {
          if (!inRange(depth, 0, target.length)) return;
          const block = target[depth];
          if (!block || !("stream" in block)) return;
          target = block.stream;
        });
      }
      target.splice(index, 1);
    },
    /** Remove a pose block transformation at a specific index. */
    removePoseBlockTransformation: (
      state,
      action: PayloadAction<{
        id: PoseId;
        index: number;
        transformationIndex: number;
        depths?: number[];
      }>
    ) => {
      const { id, index, transformationIndex, depths } = action.payload;
      const pose = state.entities[id];
      if (!pose) return;
      let target = pose.stream;
      if (depths !== undefined) {
        depths.forEach((depth) => {
          if (!inRange(depth, 0, target.length)) return;
          const block = target[depth];
          if (!block || !("stream" in block)) return;
          target = block.stream;
        });
      }
      const block = target[index];
      if (!block || !("operations" in block)) return;
      block.operations = (block.operations ?? []).filter(
        (_, i) => i !== transformationIndex
      );
    },
    /** Move a pose block from one index to another. */
    movePoseBlock: (
      state,
      action: PayloadAction<{
        id: PoseId;
        oldIndex: number;
        newIndex: number;
      }>
    ) => {
      const { id, oldIndex, newIndex } = action.payload;
      const pose = state.entities[id];
      if (!pose) return;
      const { stream } = pose;
      const block = stream.splice(oldIndex, 1)[0];
      pose.stream.splice(newIndex, 0, block);
    },
    /** Clear all pose blocks from a pose. */
    clearPose: (state, action: PayloadAction<PoseId>) => {
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
  addPoseBlockTransformation,
  updatePoseBlock,
  updatePoseBlockTransformation,
  removePoseBlock,
  removePoseBlockTransformation,
  swapPoseBlock,
  swapPoseBlockTransformation,
  movePoseBlock,
  clearPose,
} = posesSlice.actions;

export default posesSlice.reducer;
