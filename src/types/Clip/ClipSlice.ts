import { Thunk } from "types/Project/ProjectTypes";
import {
  Clip,
  ClipId,
  ClipUpdate,
  initializePatternClip,
  initializePoseClip,
  isPatternClip,
  isPoseClip,
  PatternClip,
  PoseClip,
} from "./ClipTypes";
import { createNormalSlice, unpackData, unpackUndoType } from "lib/redux";
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

export const patternClipAdapter = createEntityAdapter<PatternClip>({
  sortComparer: (a, b) => a.tick - b.tick,
});
export const defaultPatternClipState = patternClipAdapter.getInitialState();
export const patternClipSlice = createNormalSlice({
  name: "clips/pattern",
  adapter: patternClipAdapter,
});

// ------------------------------------------------------------
// Pose Clip Slices
// ------------------------------------------------------------

export const poseClipAdapter = createEntityAdapter<PoseClip>({
  sortComparer: (a, b) => a.tick - b.tick,
});
export const defaultPoseClipState = poseClipAdapter.getInitialState();
export const poseClipSlice = createNormalSlice({
  name: "clips/pose",
  adapter: poseClipAdapter,
});

// ------------------------------------------------------------
// Clip Thunks
// ------------------------------------------------------------

const PatternClips = patternClipSlice.actions;
const PoseClips = poseClipSlice.actions;

export const createPatternClip =
  (payload: Payload<Partial<PatternClip>>): Thunk =>
  (dispatch) => {
    const data = unpackData(payload);
    const undoType = unpackUndoType(payload, "createPatternClip");
    const clip = initializePatternClip(data);
    dispatch(PatternClips.addOne({ data: clip, undoType }));
  };

export const createPoseClip =
  (payload: Payload<Partial<PoseClip>>): Thunk =>
  (dispatch) => {
    const data = unpackData(payload);
    const undoType = unpackUndoType(payload, "createPoseClip");
    const clip = initializePoseClip(data);
    dispatch(PoseClips.addOne({ data: clip, undoType }));
  };

/** Add a clip to the store. */
export const addClip =
  (payload: Payload<Clip>): Thunk<ClipId> =>
  (dispatch) => {
    const clip = payload.data;
    if (isPatternClip(clip)) {
      dispatch(PatternClips.addOne({ ...payload, data: clip }));
    } else if (isPoseClip(clip)) {
      dispatch(PoseClips.addOne({ ...payload, data: clip }));
    }
    return clip.id;
  };

/** Add clips to the store. */
export const addClips =
  (payload: Payload<Clip[]>): Thunk =>
  (dispatch) => {
    const clips = payload.data;
    const { pattern, pose } = getClipsByType(clips);
    dispatch(PatternClips.addMany({ ...payload, data: pattern }));
    dispatch(PoseClips.addMany({ ...payload, data: pose }));
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
    }
  };

/** Update clips in the store. */
export const updateClips =
  (payload: Payload<ClipUpdate[]>): Thunk =>
  (dispatch) => {
    const clips = payload.data;
    const { pattern, pose } = getClipUpdatesByType(clips);
    dispatch(PatternClips.updateMany({ ...payload, data: pattern }));
    dispatch(PoseClips.updateMany({ ...payload, data: pose }));
  };

/** Remove a clip from the store. */
export const removeClip =
  (payload: Payload<ClipId>): Thunk =>
  (dispatch) => {
    const clipId = payload.data;
    const { pattern, pose } = getClipIdsByType([clipId]);
    dispatch(PatternClips.removeOne({ ...payload, data: pattern[0] }));
    dispatch(PoseClips.removeOne({ ...payload, data: pose[0] }));
  };

/** Remove clips from the store. */
export const removeClips =
  (payload: Payload<ClipId[]>): Thunk =>
  (dispatch) => {
    const clipIds = payload.data;
    const { pattern, pose } = getClipIdsByType(clipIds);
    dispatch(PatternClips.removeMany({ ...payload, data: pattern }));
    dispatch(PoseClips.removeMany({ ...payload, data: pose }));
  };
