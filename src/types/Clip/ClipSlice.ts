import { Thunk } from "types/Project/ProjectTypes";
import {
  Clip,
  ClipId,
  ClipUpdate,
  isPatternClip,
  isPoseClip,
  isScaleClip,
  PatternClip,
  PoseClip,
  ScaleClip,
} from "./ClipTypes";
import { createNormalSlice } from "lib/redux";
import {
  getClipIdsByType,
  getClipsByType,
  getClipUpdatesByType,
} from "./ClipUtils";
import { Payload } from "lib/redux";
import { createEntityAdapter } from "@reduxjs/toolkit";

// ------------------------------------------------------------
// Pattern Clip Slices
// ------------------------------------------------------------

export const patternClipAdapter = createEntityAdapter<PatternClip>();
export const defaultPatternClipState = patternClipAdapter.getInitialState();
export const patternClipSlice = createNormalSlice({
  name: "clips/pattern",
  adapter: patternClipAdapter,
});

// ------------------------------------------------------------
// Pose Clip Slices
// ------------------------------------------------------------

export const poseClipAdapter = createEntityAdapter<PoseClip>();
export const defaultPoseClipState = poseClipAdapter.getInitialState();
export const poseClipSlice = createNormalSlice({
  name: "clips/pose",
  adapter: poseClipAdapter,
});

// ------------------------------------------------------------
// Scale Clip Slices
// ------------------------------------------------------------

export const scaleClipAdapter = createEntityAdapter<ScaleClip>();
export const defaultScaleClipState = scaleClipAdapter.getInitialState();
export const scaleClipSlice = createNormalSlice({
  name: "clips/scale",
  adapter: scaleClipAdapter,
});

// ------------------------------------------------------------
// Clip Thunks
// ------------------------------------------------------------

const PatternClips = patternClipSlice.actions;
const PoseClips = poseClipSlice.actions;
const ScaleClips = scaleClipSlice.actions;

/** Add a clip to the store. */
export const addClip =
  (payload: Payload<Clip>): Thunk =>
  (dispatch) => {
    const clip = payload.data;
    if (isPatternClip(clip)) {
      dispatch(PatternClips.addOne({ ...payload, data: clip }));
    } else if (isPoseClip(clip)) {
      dispatch(PoseClips.addOne({ ...payload, data: clip }));
    } else if (isScaleClip(clip)) {
      dispatch(ScaleClips.addOne({ ...payload, data: clip }));
    }
  };

/** Add clips to the store. */
export const addClips =
  (payload: Payload<Clip[]>): Thunk =>
  (dispatch) => {
    const clips = payload.data;
    const { pattern, pose, scale } = getClipsByType(clips);
    dispatch(PatternClips.addMany({ ...payload, data: pattern }));
    dispatch(PoseClips.addMany({ ...payload, data: pose }));
    dispatch(ScaleClips.addMany({ ...payload, data: scale }));
  };

/** Update a clip in the store. */
export const updateClip =
  (payload: Payload<ClipUpdate>): Thunk =>
  (dispatch) => {
    const clip = payload.data;
    if (isPatternClip(clip)) {
      dispatch(PatternClips.updateOne({ ...payload, data: clip }));
    } else if (isPoseClip(clip)) {
      dispatch(PoseClips.updateOne({ ...payload, data: clip }));
    } else if (isScaleClip(clip)) {
      dispatch(ScaleClips.updateOne({ ...payload, data: clip }));
    }
  };

/** Update clips in the store. */
export const updateClips =
  (payload: Payload<ClipUpdate[]>): Thunk =>
  (dispatch) => {
    const clips = payload.data;
    const { pattern, pose, scale } = getClipUpdatesByType(clips);
    dispatch(PatternClips.updateMany({ ...payload, data: pattern }));
    dispatch(PoseClips.updateMany({ ...payload, data: pose }));
    dispatch(ScaleClips.updateMany({ ...payload, data: scale }));
  };

/** Remove a clip from the store. */
export const removeClip =
  (payload: Payload<ClipId>): Thunk =>
  (dispatch) => {
    const clipId = payload.data;
    const { pattern, pose, scale } = getClipIdsByType([clipId]);
    dispatch(PatternClips.removeOne({ ...payload, data: pattern[0] }));
    dispatch(PoseClips.removeOne({ ...payload, data: pose[0] }));
    dispatch(ScaleClips.removeOne({ ...payload, data: scale[0] }));
  };

/** Remove clips from the store. */
export const removeClips =
  (payload: Payload<ClipId[]>): Thunk =>
  (dispatch) => {
    const clipIds = payload.data;
    const { pattern, pose, scale } = getClipIdsByType(clipIds);
    dispatch(PatternClips.removeMany({ ...payload, data: pattern }));
    dispatch(PoseClips.removeMany({ ...payload, data: pose }));
    dispatch(ScaleClips.removeMany({ ...payload, data: scale }));
  };
