import { Thunk } from "types/Project/ProjectTypes";
import { selectPoseMap } from "./PoseSelectors";
import { addPose, updatePoses } from "./PoseSlice";
import { defaultPose, initializePose, Pose, PoseVector } from "./PoseTypes";
import { selectSelectedPoseClips } from "types/Timeline/TimelineSelectors";
import { createUndoType, Payload, unpackUndoType } from "types/redux";
import { sumVectors } from "utils/vector";

/** Create a pose. */
export const createPose =
  (payload: Payload<Partial<Pose>> = { data: defaultPose }): Thunk<Pose> =>
  (dispatch) => {
    const pose = payload.data;
    const undoType = unpackUndoType(payload, "createPose");

    // Initialize a new pattern
    const newPose = initializePose({ ...pose });
    dispatch(addPose({ data: newPose, undoType }));

    // Return the id
    return newPose;
  };

/** Update the selected poses with the given vector. */
export const updateSelectedPoseVectors =
  (callback: (oldVector: PoseVector) => PoseVector): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const poseMap = selectPoseMap(project);

    // Get the unique poses that are currently selected
    const poseClips = selectSelectedPoseClips(project);
    const poseIds = [...new Set(poseClips.map((t) => t.poseId))];
    const poses = poseIds.map((id) => poseMap[id]).filter(Boolean) as Pose[];

    // Update the streams of the corresponding poses
    const newPoses: Pose[] = poses.map((pose) => ({
      ...pose,
      vector: callback(pose.vector || {}),
    }));
    const undoType = createUndoType("updatePoseVectors", newPoses);
    dispatch(updatePoses({ data: newPoses, undoType }));
  };

/** Update the selected poses with the given vector. */
export const updateSelectedPoses =
  (vector: PoseVector): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const poseMap = selectPoseMap(project);

    // Get the unique poses that are currently selected
    const poseClips = selectSelectedPoseClips(project);
    const poseIds = [...new Set(poseClips.map((t) => t.poseId))];
    const poses = poseIds.map((id) => poseMap[id]).filter(Boolean) as Pose[];

    // Update the streams of the corresponding poses
    const newPoses = poses.map((p) => ({
      ...p,
      vector: { ...p.vector, ...vector },
    }));
    const undoType = createUndoType("updateSelectedPoses", newPoses);
    dispatch(updatePoses({ data: newPoses, undoType }));
  };

/** Offset the selected poses by the given vector. */
export const offsetSelectedPoses =
  (vector: PoseVector): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const poseMap = selectPoseMap(project);

    // Get the unique poses that are currently selected
    const poseClips = selectSelectedPoseClips(project);
    const poseIds = [...new Set(poseClips.map((t) => t.poseId))];
    const poses = poseIds.map((id) => poseMap[id]).filter(Boolean) as Pose[];

    // Update the streams of the corresponding poses
    const newPoses = poses.map((pose) => ({
      ...pose,
      vector: sumVectors(pose.vector, vector),
    }));
    const undoType = createUndoType(
      "offsetSelectedPoses",
      newPoses.map((p) => p.vector)
    );
    dispatch(updatePoses({ data: newPoses, undoType }));
  };
