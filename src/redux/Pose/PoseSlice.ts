import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RemoveTrackPayload, TrackId } from "types/Track";
import { defaultPoseState, Pose } from "types/Pose";
import { union, without } from "lodash";
import {
  RemoveMediaPayload,
  CreateMediaPayload,
  UpdateMediaPayload,
} from "types/Media";

// ------------------------------------------------------------
// Pose Payload Types
// ------------------------------------------------------------

/** A pose can only be added as media. */
export type AddPosesPayload = CreateMediaPayload;

/** A pose can only be updated as media. */
export type UpdatePosesPayload = UpdateMediaPayload;

/** A pose can only be removed as media. */
export type RemovePosesPayload = RemoveMediaPayload;

/** A pose can be sliced into two new poses. */
export type SlicePosePayload = {
  oldPose: Pose;
  firstPose: Pose;
  secondPose: Pose;
};

/** A pose can be removed by track ID. */
export type RemovePosesByTrackIdPayload = RemoveTrackPayload;

/** A pose can be cleared by track ID. */
export type ClearPosesByTrackIdPayload = TrackId;

// ------------------------------------------------------------
// Pose Slice Definition
// ------------------------------------------------------------

export const posesSlice = createSlice({
  name: "poses",
  initialState: defaultPoseState,
  reducers: {
    /** Add a list of poses to the slice. */
    addPoses: (state, action: PayloadAction<AddPosesPayload>) => {
      const { poses } = action.payload;
      if (!poses?.length) return;
      poses.forEach((pose) => {
        state.byId[pose.id] = pose;
        state.allIds.push(pose.id);
      });
    },
    /** (PRIVATE) Update a list of poses in the slice. */
    _updatePoses: (state, action: PayloadAction<UpdatePosesPayload>) => {
      const { poses } = action.payload;
      if (!poses?.length) return;
      poses.forEach((pose) => {
        const { id, ...rest } = pose;
        if (!id) return;
        if (!state.byId[id]) return;
        state.byId[id] = { ...state.byId[id], ...rest };
      });
    },
    /** Remove a list of poses from the slice. */
    removePoses: (state, action: PayloadAction<RemovePosesPayload>) => {
      const { poseIds } = action.payload;
      if (!poseIds?.length) return;
      poseIds.forEach((id) => {
        delete state.byId[id];
      });
      state.allIds = without(state.allIds, ...poseIds);
    },
    /** (PRIVATE) Slice a pose into two new poses. */
    _slicePose: (state, action: PayloadAction<SlicePosePayload>) => {
      const { oldPose, firstPose, secondPose } = action.payload;
      if (!oldPose || !firstPose || !secondPose) return;
      delete state.byId[oldPose.id];

      //  Remove the old pose
      const index = state.allIds.findIndex((id) => id === oldPose.id);
      if (index === -1) return;
      state.allIds.splice(index, 1);

      //  Add the new poses
      state.allIds = union(state.allIds, [firstPose.id, secondPose.id]);
      state.byId[firstPose.id] = firstPose;
      state.byId[secondPose.id] = secondPose;
    },
    /** Remove all poses with a given track ID. */
    removePosesByTrackId: (
      state,
      action: PayloadAction<RemovePosesByTrackIdPayload>
    ) => {
      const { id } = action.payload;
      if (!id) return;
      const poseIds = state.allIds.filter(
        (tId) => state.byId[tId].trackId === id
      );
      poseIds.forEach((id) => {
        delete state.byId[id];
      });
      state.allIds = without(state.allIds, ...poseIds);
    },
    /** Clear all poses with a given track ID. */
    clearPosesByTrackId: (
      state,
      action: PayloadAction<ClearPosesByTrackIdPayload>
    ) => {
      const trackId = action.payload;
      if (!trackId) return;
      const poseIds = state.allIds.filter(
        (id) => state.byId[id].trackId === trackId
      );
      poseIds.forEach((id) => {
        delete state.byId[id];
      });
      state.allIds = without(state.allIds, ...poseIds);
    },
  },
});

export const {
  addPoses,
  _updatePoses,
  removePoses,
  _slicePose,
  removePosesByTrackId,
  clearPosesByTrackId,
} = posesSlice.actions;

export default posesSlice.reducer;
