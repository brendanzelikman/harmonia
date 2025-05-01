import { Thunk } from "types/Project/ProjectTypes";
import {
  Clip,
  ClipUpdate,
  isPatternClip,
  isPoseClip,
  PatternClip,
  PoseClip,
} from "./ClipTypes";
import { createNormalSlice, unpackUndoType } from "types/redux";
import { Payload } from "types/redux";
import { createEntityAdapter } from "@reduxjs/toolkit";

export const createClipAdapter = <T extends Clip>(type: string) => {
  const adapter = createEntityAdapter<T>({
    sortComparer: (a, b) => a.tick - b.tick,
  });
  const defaultState = adapter.getInitialState();
  const slice = createNormalSlice({
    name: `clips/${type}`,
    adapter,
  });
  const actions = slice.actions;
  return { adapter, defaultState, slice, actions };
};

// ------------------------------------------------------------
// Clip Slices
// ------------------------------------------------------------

export const {
  adapter: patternClipAdapter,
  defaultState: defaultPatternClipState,
  slice: patternClipSlice,
  actions: patternClipActions,
} = createClipAdapter<PatternClip>("pattern");

export const addPatternClip = patternClipActions.addOne;
export const updatePatternClip = patternClipActions.updateOne;
export const removePatternClip = patternClipActions.removeOne;

export const {
  adapter: poseClipAdapter,
  defaultState: defaultPoseClipState,
  slice: poseClipSlice,
  actions: poseClipActions,
} = createClipAdapter<PoseClip>("pose");

export const addPoseClip = poseClipActions.addOne;
export const updatePoseClip = poseClipActions.updateOne;
export const removePoseClip = poseClipActions.removeOne;

// ------------------------------------------------------------
// Clip Thunks
// ------------------------------------------------------------

/** Update clips in the store. */
export const updateClips =
  (payload: Payload<ClipUpdate[]>): Thunk =>
  (dispatch) => {
    const clips = payload.data;
    const undoType = unpackUndoType(payload, "updateClips");
    for (const clip of clips) {
      if (isPatternClip(clip)) {
        dispatch(updatePatternClip({ data: clip, undoType }));
      } else if (isPoseClip(clip)) {
        dispatch(updatePoseClip({ data: clip, undoType }));
      }
    }
  };
