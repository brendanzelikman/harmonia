import { dispatchCustomEvent, isInputEvent } from "utils/html";
import { use, useDeep, useProjectDispatch } from "types/hooks";
import { useCallback, useEffect } from "react";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";
import { useAuth } from "providers/auth";
import {
  toggleInstrumentMute,
  toggleInstrumentSolo,
} from "types/Instrument/InstrumentSlice";
import { PoseVector } from "types/Pose/PoseTypes";
import { selectIsEditorOpen } from "types/Editor/EditorSelectors";
import {
  selectSelectedTrackParents,
  selectIsLive,
  selectSelectedPoseClips,
  selectSelectedTrack,
} from "types/Timeline/TimelineSelectors";
import { selectOrderedPatternTracks } from "types/Track/TrackSelectors";
import {
  offsetSelectedPoses,
  updateSelectedPoses,
  updateSelectedPoseStreams,
} from "types/Pose/PoseThunks";
import {
  unmuteTracks,
  unsoloTracks,
  updateTrack,
} from "types/Track/TrackThunks";
import { mapPoseStreamVectors } from "types/Pose/PoseFunctions";
import { pick, range, size, some } from "lodash";
import { sumVectors } from "utils/vector";

const numberKeys = range(1, 10).map((n) => n.toString());
const scaleKeys = ["q", "w", "e", "r", "t", "y"];
const zeroKeys = ["z", "0"];
const extraKeys = ["z", "m", "s", "minus", "`", "equal", "shift", "meta"];
const ALL_KEYS = [...numberKeys, ...zeroKeys, ...scaleKeys, ...extraKeys];

export const useLivePlay = () => {
  const dispatch = useProjectDispatch();
  const { isAtLeastRank } = useAuth();
  const isLive = use(selectIsLive);
  const selectedTrack = useDeep(selectSelectedTrack);
  const isEditorOpen = use(selectIsEditorOpen);
  const patternTracks = useDeep(selectOrderedPatternTracks);
  const scaleTracks = useDeep(selectSelectedTrackParents);
  const clips = useDeep(selectSelectedPoseClips);
  const hasClips = clips.length > 0;
  const firstTrackId = scaleTracks[0]?.id;
  const secondTrackId = scaleTracks[1]?.id;
  const thirdTrackId = scaleTracks[2]?.id;
  const holding = useHeldHotkeys(ALL_KEYS);
  useEffect(() => {
    if (!Object.keys(holding).some((key) => holding[key])) {
      dispatchCustomEvent("add-shortcut", {});
    }
  }, [holding]);

  // The callback for the numerical keydown event
  const keydown = useCallback(
    (e: KeyboardEvent) => {
      if (isInputEvent(e) || isEditorOpen) return;

      // Try to get the number of the key
      const number = parseInt(e.key);
      if (isNaN(number)) return;

      // Get the pattern track by number (for mute/solo)
      const patternTrack = patternTracks[number - 1];
      const instrumentId = patternTrack?.instrumentId;

      // Toggle mute if holding y
      if (holding.m) {
        dispatch(toggleInstrumentMute(instrumentId));
      }
      // Toggle solo if holding u
      if (holding.s) {
        dispatch(toggleInstrumentSolo(instrumentId));
      }

      const isNegative = holding["-"] || holding["`"];
      const isExact = holding["="];

      // Compute the pose offset record
      const vector = {} as PoseVector;
      const dir = isNegative ? -1 : 1;
      const value = number * dir;

      // Apply chordal offset if holding r
      if (holding.r) {
        if (isExact) vector.chordal = value;
        else vector.chordal = (vector.chordal ?? 0) + value;
      }

      // Apply chromatic offset if holding t
      if (holding.t) {
        if (isExact) vector.chromatic = value;
        else vector.chromatic = (vector.chromatic ?? 0) + value;
      }

      // Apply octave offset if holding y
      if (holding.y) {
        if (isExact) vector.octave = value;
        else vector.octave = (vector.octave ?? 0) + value;
      }

      // Apply scalar offsets if holding w, s, or x
      const scalarKeys = ["q", "w", "e"];
      scalarKeys.forEach((key, i) => {
        const heldKey = holding[key];
        const id =
          i === 0 ? firstTrackId : i === 1 ? secondTrackId : thirdTrackId;
        if (heldKey && id) {
          if (isExact) vector[id] = value;
          else vector[id] = (vector[id] ?? 0) + value;
        }
      });

      if (!some(vector)) return;
      dispatchCustomEvent("add-shortcut", vector);

      // Update the track if there are no clips
      if (!hasClips && selectedTrack) {
        const newVector = isExact
          ? { ...selectedTrack.vector, ...vector }
          : sumVectors(selectedTrack.vector, vector);
        dispatch(
          updateTrack({ data: { id: selectedTrack.id, vector: newVector } })
        );
        return;
      }

      // Otherwise, update the selected poses
      if (isExact) {
        dispatch(updateSelectedPoses(vector));
      } else {
        dispatch(offsetSelectedPoses(vector));
      }
    },
    [
      holding,
      isEditorOpen,
      patternTracks,
      firstTrackId,
      secondTrackId,
      thirdTrackId,
      selectedTrack,
      hasClips,
    ]
  );

  // The callback for the numerical zero keydown event
  const zeroKeydown = useCallback(
    (e: KeyboardEvent) => {
      const key = e.key;
      if (!zeroKeys.includes(key)) return;
      if (isInputEvent(e) || isEditorOpen) return;

      // Unmute all tracks if holding m
      if (holding.m) {
        dispatch(unmuteTracks());
      }

      // Unsolo all tracks if holding s
      if (holding.s) {
        dispatch(unsoloTracks());
      }

      const scaleKeys = ["q", "w", "e"];
      const isZ = key === "z";

      let broadcast = false;

      const getNewVector = (vector: PoseVector) => {
        let newVector = { ...vector };
        const broadcastedKeys = [];

        if (holding[scaleKeys[0]] && firstTrackId) {
          broadcastedKeys.push(firstTrackId);
          if (isZ) {
            delete newVector[firstTrackId];
          } else {
            newVector[firstTrackId] = 0;
          }
        }
        if (holding[scaleKeys[1]] && secondTrackId) {
          broadcastedKeys.push(secondTrackId);
          if (isZ) {
            delete newVector[secondTrackId];
          } else {
            newVector[secondTrackId] = 0;
          }
        }
        if (holding[scaleKeys[2]] && thirdTrackId) {
          broadcastedKeys.push(thirdTrackId);
          if (isZ) {
            delete newVector[thirdTrackId];
          } else {
            newVector[thirdTrackId] = 0;
          }
        }
        if (holding.r) {
          broadcastedKeys.push("chordal");
          if (isZ) {
            delete newVector.chordal;
          } else {
            newVector.chordal = 0;
          }
        }
        if (holding.t) {
          broadcastedKeys.push("chromatic");
          if (isZ) {
            delete newVector.chromatic;
          } else {
            newVector.chromatic = 0;
          }
        }
        if (holding.y) {
          broadcastedKeys.push("octave");
          if (isZ) {
            delete newVector.octave;
          } else {
            newVector.octave = 0;
          }
        }
        if (isZ && size(newVector) === size(vector)) {
          if (!broadcast) dispatchCustomEvent("add-shortcut", {});
          broadcast = true;
          return {};
        }
        if (!broadcast)
          dispatchCustomEvent("add-shortcut", pick(newVector, broadcastedKeys));
        broadcast = true;
        return newVector;
      };

      // Update the track's vector if there are no clips
      if (!hasClips && selectedTrack) {
        const newVector = getNewVector(selectedTrack.vector ?? {});
        dispatch(
          updateTrack({ data: { id: selectedTrack.id, vector: newVector } })
        );
        return;
      }

      // Otherwise, update the selected poses
      dispatch(
        updateSelectedPoseStreams((stream) =>
          mapPoseStreamVectors(stream, getNewVector)
        )
      );
    },
    [
      holding,
      isEditorOpen,
      firstTrackId,
      secondTrackId,
      thirdTrackId,
      hasClips,
      selectedTrack,
    ]
  );

  /**
   * Add the corresponding event listener to the window if the user is live.
   * (This is a workaround for duplicated events with react-hotkeys)
   */
  useEffect(() => {
    if (!isLive || !isAtLeastRank("maestro")) return;
    window.addEventListener("keydown", keydown);
    window.addEventListener("keydown", zeroKeydown);
    return () => {
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keydown", zeroKeydown);
    };
  }, [isAtLeastRank, isLive, keydown, zeroKeydown]);
};
