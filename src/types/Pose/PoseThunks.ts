import { Thunk } from "types/Project/ProjectTypes";
import { selectPoseById, selectPoseMap } from "./PoseSelectors";
import { addPose, updatePose, updatePoses } from "./PoseSlice";
import {
  defaultPose,
  PoseId,
  initializePose,
  Pose,
  PoseVector,
  PoseVectorId,
} from "./PoseTypes";
import {
  selectNewMotifName,
  selectSelectedPoseClips,
} from "types/Timeline/TimelineSelectors";
import { setSelectedPose } from "types/Media/MediaThunks";
import { createUndoType, Payload, unpackUndoType } from "lib/redux";
import { ChromaticPitchClass } from "assets/keys";
import { promptUserForString } from "utils/html";
import { selectTrackLabelMap } from "types/Track/TrackSelectors";
import { isTrackId, TrackId } from "types/Track/TrackTypes";
import { PoseClipId } from "types/Clip/ClipTypes";
import { selectPoseClipById } from "types/Clip/ClipSelectors";
import { updateTrack } from "types/Track/TrackThunks";
import { sumVectors } from "utils/vector";
import { trim } from "lodash";

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

/** Update the selected poses or track vector with the given vector. */
export const inputPoseVector =
  (id?: PoseClipId | TrackId): Thunk =>
  (dispatch, getProject) => {
    const isTrack = isTrackId(id);
    const objects = !id
      ? "Selected Poses"
      : isTrack
      ? "Selected Track"
      : "Selected Pose";
    promptUserForString({
      title: `Update the ${objects}`,
      description: [
        `Please input a list of offsets separated by plus signs to update the selected ${
          isTrack ? "track" : "pose"
        }, e.g. "T5 + t12".`,
        "An empty input will reset the pose.",
      ],
      callback: (input) => {
        if (isTrack && input === "") {
          dispatch(updateTrack({ data: { id, vector: {} } }));
          return;
        }
        const trackMap = selectTrackLabelMap(getProject());
        const labelEntries = Object.entries(trackMap) as [TrackId, string][];
        const vector: PoseVector = {};

        const chromaticRegex = /T([-+]?\d+)/g;
        const chordalRegex = /t([-+]?\d+)/g;
        const octaveRegex = /O([-+]?\d+)/g;
        const trackIdRegex = /\$([A-G]*)\s*([-+]?\d*)/g;
        const pitchClassRegex = /\*([A-G]#?):\s*([-+]?\d+)/g;

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

        // Update the track if it is a track
        if (isTrack) {
          dispatch(updateTrack({ data: { id, vector } }));
          return;
        }

        // Otherwise, update the pose
        const poseId = selectPoseClipById(getProject(), id)?.poseId;
        const pose = selectPoseById(getProject(), poseId);
        if (!poseId || !pose) return;
        dispatch(
          updatePose({
            data: { id: poseId, vector: { ...pose.vector, ...vector } },
          })
        );
      },
    })();
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
