import { nanoid } from "@reduxjs/toolkit";
import { selectPoseMap } from "types/Pose/PoseSelectors";
import { updatePoses } from "types/Pose/PoseSlice";
import { Thunk } from "types/Project/ProjectTypes";
import { createUndoType } from "types/redux";
import { selectSelectedPoseClips } from "types/Timeline/TimelineSelectors";
import { selectTrackAncestorIdsMap } from "types/Track/TrackSelectors";
import { isNegative, sumVector, deleteVector } from "./utils";

/** Gesture to update the selected poses */
export const offsetSelectedPoses =
  (number: number): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const undoType = createUndoType(nanoid());
    const poseClips = selectSelectedPoseClips(project);
    const poseMap = selectPoseMap(project);
    const ancestorMap = selectTrackAncestorIdsMap(project);
    const value = number * (isNegative() ? -1 : 1);

    // Create a new vector for each selected pose clip
    const newVectors = poseClips.map((clip) => {
      const poseVector = poseMap[clip.poseId].vector;
      const ancestors = ancestorMap[clip.trackId];
      const vector = sumVector(poseVector, value, ancestors);
      return { id: clip.poseId, vector };
    });

    // Update the poses
    dispatch(updatePoses({ data: newVectors, undoType }));
  };

/** Gesture to zero the selected poses */
export const zeroSelectedPoses = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const undoType = createUndoType(nanoid());
  const poseClips = selectSelectedPoseClips(project);
  const poseMap = selectPoseMap(project);
  const ancestorMap = selectTrackAncestorIdsMap(project);

  // Create a new vector for each selected pose clip
  const newVectors = poseClips.map((clip) => {
    const poseVector = poseMap[clip.poseId].vector;
    const ancestors = ancestorMap[clip.trackId];
    const vector = deleteVector(poseVector, ancestors);
    return { id: clip.poseId, vector };
  });

  // Update the poses
  dispatch(updatePoses({ data: newVectors, undoType }));
};
