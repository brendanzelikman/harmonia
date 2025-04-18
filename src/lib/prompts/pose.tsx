import { ChromaticPitchClass } from "lib/presets/keys";
import { promptLineBreak } from "components/PromptModal";
import { selectPoseClipById } from "types/Clip/ClipSelectors";
import { Thunk } from "types/Project/ProjectTypes";
import {
  selectTrackMap,
  selectTrackLabelMap,
} from "types/Track/TrackSelectors";
import { updateTrack } from "types/Track/TrackThunks";
import { TrackId, isTrackId } from "types/Track/TrackTypes";
import { promptUserForString } from "lib/prompts/html";
import { CHORDAL_KEY, CHROMATIC_KEY } from "utils/constants";
import { getPoseVectorAsString } from "types/Pose/PoseFunctions";
import { selectPoseById } from "types/Pose/PoseSelectors";
import { updatePose } from "types/Pose/PoseSlice";
import { offsetSelectedPoses } from "types/Pose/PoseThunks";
import { PoseVector, PoseVectorId } from "types/Pose/PoseTypes";

/** Update the selected poses or track vector with the given vector. */
export const promptUserForPose =
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
