import {
  Pose,
  PoseId,
  PoseNoId,
  defaultPose,
  initializePose,
  offsetPoseStreamVectors,
  resetPoseStreamVectors,
  updatePoseStreamVectors,
} from "types/Pose";
import { Thunk } from "types/Project";
import { PoseVector } from "types/Pose";
import {
  selectPoseById,
  selectPoseMap,
  selectSelectedPoseClips,
} from "redux/selectors";
import { addPose, clearPose, updatePose, updatePoses } from "./PoseSlice";
import { setSelectedPose } from "redux/thunks";

/** Create a pose. */
export const createPose =
  (poseNoId: Partial<PoseNoId> = defaultPose): Thunk<PoseId> =>
  (dispatch) => {
    const pose = initializePose(poseNoId);
    dispatch(addPose(pose));
    dispatch(setSelectedPose(pose.id));
    return pose.id;
  };

/** Duplicate a pose. */
export const copyPose =
  (pose: Pose = defaultPose): Thunk =>
  (dispatch) => {
    return dispatch(createPose({ ...pose, name: `${pose.name} Copy` }));
  };

/** Repeat the stream of a pose. */
export const repeatPoseStream =
  (id: PoseId, value: number): Thunk =>
  (dispatch, getProject) => {
    if (value < 0) return;
    if (value === 0) {
      dispatch(clearPose(id));
      return;
    }
    const project = getProject();
    const pose = selectPoseById(project, id);
    if (!pose) return;
    const stream = new Array(pose.stream.length * value)
      .fill(pose.stream)
      .flat();
    dispatch(updatePose({ id, stream }));
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
    const poses = poseIds.map((id) => poseMap[id]);

    // Update the streams of the corresponding poses
    const newPoses = poses.map((pose) => ({
      ...pose,
      stream: updatePoseStreamVectors(pose.stream, vector),
    }));
    dispatch(updatePoses(newPoses));
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
    const poses = poseIds.map((id) => poseMap[id]);

    // Update the streams of the corresponding poses
    const newPoses = poses.map((pose) => ({
      ...pose,
      stream: offsetPoseStreamVectors(pose.stream, vector),
    }));
    dispatch(updatePoses(newPoses));
  };

/** Reset the vector of the selected poses. */
export const resetSelectedPoses = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const poseMap = selectPoseMap(project);

  // Get the unique poses that are currently selected
  const poseClips = selectSelectedPoseClips(project);
  const poseIds = [...new Set(poseClips.map((t) => t.poseId))];
  const poses = poseIds.map((id) => poseMap[id]);

  // Update the streams of the corresponding poses
  const newPoses = poses.map((pose) => ({
    ...pose,
    stream: resetPoseStreamVectors(pose.stream),
  }));
  dispatch(updatePoses(newPoses));
};
