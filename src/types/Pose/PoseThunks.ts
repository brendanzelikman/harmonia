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
  isPoseOperation,
  PoseVector,
  PoseStream,
  PoseVectorId,
} from "./PoseTypes";
import {
  selectNewMotifName,
  selectSelectedPoseClips,
} from "types/Timeline/TimelineSelectors";
import { setSelectedPose } from "types/Media/MediaThunks";
import { Payload, unpackUndoType } from "lib/redux";
import { createAction } from "@reduxjs/toolkit";
import { getVectorKeys } from "utils/vector";
import { ChromaticPitchClass } from "assets/keys";
import { promptUserForString } from "utils/html";
import { selectTrackLabelMap } from "types/Track/TrackSelectors";
import { TrackId } from "types/Track/TrackTypes";
import { PoseClipId } from "types/Clip/ClipTypes";
import { selectPoseClipById } from "types/Clip/ClipSelectors";

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
      if (isPoseOperation(v)) {
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

export const inputPoseVector =
  (id?: PoseClipId): Thunk =>
  (dispatch, getProject) =>
    promptUserForString(
      "Update the Selected Vector",
      `Please input a list of offsets separated by plus signs to update the selected poses, e.g. "T5 + t12".`,
      (input) => {
        const trackMap = selectTrackLabelMap(getProject());
        const labelEntries = Object.entries(trackMap) as [TrackId, string][];
        const vector: PoseVector = {};

        const chromaticRegex = /T([-+]?\d+)/g;
        const chordalRegex = /t([-+]?\d+)/g;
        const octaveRegex = /O([-+]?\d+)/g;
        const trackIdRegex = /S([1-9][a-z]*):\s*([-+]?\d*)/g;
        const pitchClassRegex = /([A-G]#?):\s*([-+]?\d+)/g;

        const addToVector = (key: PoseVectorId, value: number) => {
          if (vector[key] !== undefined) {
            vector[key]! += value;
          } else {
            vector[key] = value;
          }
        };

        let match: RegExpExecArray | null;

        // Chromatic
        while ((match = chromaticRegex.exec(input)) !== null) {
          addToVector("chromatic", parseInt(match[1], 10));
        }

        // Chordal
        while ((match = chordalRegex.exec(input)) !== null) {
          addToVector("chordal", parseInt(match[1], 10));
        }

        // Octave
        while ((match = octaveRegex.exec(input)) !== null) {
          addToVector("octave", parseInt(match[1], 10));
        }

        // TrackId
        while ((match = trackIdRegex.exec(input)) !== null) {
          const trackId = labelEntries.find(
            (entry) => entry[1] === match![1]
          )?.[0];
          if (!trackId) continue;
          const value = match[2] ? parseInt(match[2], 10) : 0;
          addToVector(trackId, value);
        }

        // Pitch Classes
        while ((match = pitchClassRegex.exec(input)) !== null) {
          addToVector(match[1] as ChromaticPitchClass, parseInt(match[2], 10));
        }

        if (!id) return dispatch(offsetSelectedPoses(vector));
        const poseId = selectPoseClipById(getProject(), id)?.poseId;
        const pose = selectPoseById(getProject(), poseId);
        if (!poseId || !pose) return;
        const stream = mergePoseStreamVectors(pose.stream, vector);
        dispatch(updatePose({ data: { id: poseId, stream } }));
      }
    )();

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
