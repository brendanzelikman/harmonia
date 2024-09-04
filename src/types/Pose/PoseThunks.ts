import { random } from "lodash";
import { Thunk } from "types/Project/ProjectTypes";
import {
  mergePoseStreamVectors,
  offsetPoseStreamVectors,
  resetPoseStreamVectors,
} from "./PoseFunctions";
import { selectPoseById, selectPoseMap } from "./PoseSelectors";
import { addPose, clearPose, updatePose, updatePoses } from "./PoseSlice";
import {
  defaultPose,
  PoseId,
  initializePose,
  Pose,
  isPoseVectorModule,
  PoseVector,
  PoseStream,
} from "./PoseTypes";
import {
  selectNewMotifName,
  selectSelectedPoseClips,
} from "types/Timeline/TimelineSelectors";
import { setSelectedPose } from "types/Media/MediaThunks";
import { Payload, unpackUndoType } from "lib/redux";
import { createAction } from "@reduxjs/toolkit";
import { getVectorKeys } from "utils/vector";

/** Create a pose. */
export const createPose =
  (payload: Payload<Partial<Pose>> = { data: defaultPose }): Thunk<PoseId> =>
  (dispatch, getProject) => {
    const pose = payload.data;
    const undoType = unpackUndoType(payload, "createPose");
    const project = getProject();

    // Get the name of the new pose
    const newName = selectNewMotifName(project, "pose");
    const givenName = pose.name;
    const noName = !givenName || givenName === defaultPose.name;

    // Initialize a new pattern
    const newPose = initializePose({
      ...pose,
      name: noName ? newName : givenName,
    });
    dispatch(addPose({ data: newPose, undoType }));
    dispatch(setSelectedPose({ data: newPose.id, undoType }));

    // Return the id
    return newPose.id;
  };

/** Duplicate a pose. */
export const copyPose =
  (pose: Pose = defaultPose): Thunk =>
  (dispatch) => {
    return dispatch(
      createPose({ data: { ...pose, name: `${pose.name} Copy` } })
    );
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
    dispatch(updatePose({ data: { id, stream } }));
  };

/** Randomize the stream of a pose. */
export const randomizePoseStream =
  (id: PoseId): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const pose = selectPoseById(project, id);
    if (!pose) return;
    const stream = pose.stream.map((v) => {
      if (isPoseVectorModule(v)) {
        const keys = getVectorKeys(v.vector);
        const vector = keys.reduce(
          (acc, key) => ({ ...acc, [key]: random(-3, 3) }),
          {}
        );
        return { ...v, vector };
      } else {
        return v;
      }
    });
    dispatch(updatePose({ data: { id, stream } }));
  };

/** Update the selected poses with the given vector. */
export const updateSelectedPoseStreams =
  (callback: (oldStream: PoseStream) => PoseStream): Thunk =>
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
      stream: callback(pose.stream),
    }));
    dispatch(updatePoses({ data: newPoses }));
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
    const newPoses: Pose[] = poses.map((pose) => ({
      ...pose,
      stream: mergePoseStreamVectors(pose.stream, vector),
    }));
    dispatch(updatePoses({ data: newPoses }));
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
      stream: offsetPoseStreamVectors(pose.stream, vector),
    }));
    dispatch(updatePoses({ data: newPoses }));
  };

/** Reset the vector of the selected poses. */
export const resetSelectedPoses = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const poseMap = selectPoseMap(project);

  // Get the unique poses that are currently selected
  const poseClips = selectSelectedPoseClips(project);
  const poseIds = [...new Set(poseClips.map((t) => t.poseId))];
  const poses = poseIds.map((id) => poseMap[id]).filter(Boolean) as Pose[];

  // Update the streams of the corresponding poses
  const newPoses = poses.map((pose) => ({
    ...pose,
    stream: resetPoseStreamVectors(pose.stream),
  }));
  dispatch(updatePoses({ data: newPoses }));
};

const examplePoseAction = createAction("poses/action", (payload: Pose) => ({
  payload,
  meta: "poses/action",
}));

const walk =
  (pose: Pose): Thunk =>
  (dispatch, getProject) => {
    dispatch(examplePoseAction(pose));
  };
