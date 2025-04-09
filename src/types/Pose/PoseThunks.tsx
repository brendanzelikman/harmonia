import { Thunk } from "types/Project/ProjectTypes";
import { selectPoseById, selectPoseMap } from "./PoseSelectors";
import { addPose, updatePose, updatePoses } from "./PoseSlice";
import {
  defaultPose,
  initializePose,
  Pose,
  PoseVector,
  PoseVectorId,
} from "./PoseTypes";
import {
  selectNewMotifName,
  selectSelectedPoseClips,
} from "types/Timeline/TimelineSelectors";
import { createUndoType, Payload, unpackUndoType } from "utils/redux";
import { ChromaticPitchClass } from "assets/keys";
import { promptUserForString } from "utils/html";
import {
  selectTrackLabelMap,
  selectTrackMap,
} from "types/Track/TrackSelectors";
import { isTrackId, TrackId } from "types/Track/TrackTypes";
import { selectPoseClipById } from "types/Clip/ClipSelectors";
import { updateTrack } from "types/Track/TrackThunks";
import { CHORDAL_KEY, CHROMATIC_KEY, sumVectors } from "utils/vector";
import { promptLineBreak } from "components/PromptModal";
import { getPoseVectorAsString } from "./PoseFunctions";

/** Create a pose. */
export const createPose =
  (payload: Payload<Partial<Pose>> = { data: defaultPose }): Thunk<Pose> =>
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

    // Return the id
    return newPose;
  };

/** Duplicate a pose. */
export const copyPose =
  (payload: Payload<Partial<Pose>, true>): Thunk<Pose> =>
  (dispatch) => {
    const pose = payload?.data;
    const undoType = unpackUndoType(payload, "copyPose");
    return dispatch(
      createPose({ data: { ...pose, name: `${pose?.name} Copy` }, undoType })
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
  (id?: TrackId): Thunk =>
  (dispatch, getProject) => {
    const isTrack = isTrackId(id);
    const objects = !id
      ? "Selected Poses"
      : isTrack
      ? "Selected Track"
      : "Selected Pose";
    const project = getProject();
    const trackMap = selectTrackMap(project);
    const vector = isTrack ? trackMap[id]?.vector ?? {} : {};
    const string = getPoseVectorAsString(vector, trackMap);
    promptUserForString({
      large: true,
      title: `Update the ${objects}`,
      description: [
        promptLineBreak,
        <span>
          Rule #1: <span className="text-sky-400">Scalar Transpositions</span>{" "}
          are inputted by label and number
        </span>,
        <span>Example: A4 + B-5 = 4 steps up Scale A and 5 down Scale B </span>,
        promptLineBreak,
        <span>
          Rule #2: <span className="text-emerald-400">Rotations</span> and{" "}
          <span className="text-emerald-400">Semitones</span> are inputted with
          "{CHORDAL_KEY}" and "{CHROMATIC_KEY}"
        </span>,
        <span>
          Example: {CHORDAL_KEY}2 + {CHROMATIC_KEY}-3 = 2 rotations up and 3
          semitones down
        </span>,
        promptLineBreak,
        <span>
          Rule #3: <span className="text-fuchsia-400">Voice Leadings</span> are
          inputted by asterisk, pitch class, and number
        </span>,
        <span>
          Example: *C-1 + *E-2 + *G0 = All C major chords move to G major chords
        </span>,
        promptLineBreak,
        `Rule #4: An empty input will reset the pose`,
        isTrack ? (
          <span>
            Currently, the pose is <span className="font-bold">{string}</span>
          </span>
        ) : undefined,
        promptLineBreak,
        <span className="underline">Please input your pose:</span>,
      ],
      callback: (input) => {
        if (isTrack && input === "") {
          dispatch(updateTrack({ data: { id, vector: undefined } }));
          return;
        }
        const trackMap = selectTrackLabelMap(getProject());
        const labelEntries = Object.entries(trackMap) as [TrackId, string][];
        const vector: PoseVector = {};

        const chromaticRegex = /t([-+]?\d+)/g;
        const chordalRegex = /r([-+]?\d+)/g;
        const octaveRegex = /y([-+]?\d+)/g;
        const trackIdRegex = /(?<!\*)([A-Z])\s*([-+]?\d*)/g;
        const pitchClassRegex = /\*([A-G][b#]?)\s*([-+]?\d+)/g;

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
