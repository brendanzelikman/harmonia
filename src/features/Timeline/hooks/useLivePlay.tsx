import { dispatchCustomEvent, isInputEvent } from "utils/html";
import { useDeep, useProjectDispatch } from "types/hooks";
import { useCallback, useEffect } from "react";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";
import {
  toggleInstrumentMute,
  toggleInstrumentSolo,
} from "types/Instrument/InstrumentSlice";
import { PoseVector, PoseVectorId } from "types/Pose/PoseTypes";
import {
  selectSelectedPoseClips,
  selectSelectedPatternClips,
  selectSelectedPoses,
  selectSelectedTrackId,
} from "types/Timeline/TimelineSelectors";
import {
  selectPatternTracks,
  selectScaleTrackIds,
  selectTrackAncestorIdsMap,
} from "types/Track/TrackSelectors";
import {
  unmuteTracks,
  unsoloTracks,
} from "types/Track/PatternTrack/PatternTrackThunks";
import { range } from "lodash";
import { createUndoType } from "lib/redux";
import { walkSelectedPatternClips } from "types/Arrangement/ArrangementThunks";
import { updatePose } from "types/Pose/PoseSlice";
import { selectPoseMap } from "types/Pose/PoseSelectors";
import { sumVectors } from "utils/vector";
import { selectPoseClips } from "types/Clip/ClipSelectors";
import { nanoid } from "@reduxjs/toolkit";
import { TrackId } from "types/Track/TrackTypes";
import {
  createCourtesyPoseClip,
  createPatternTrack,
} from "types/Track/PatternTrack/PatternTrackThunks";
import { useTransportTick } from "hooks/useTransportTick";

const numberKeys = range(1, 10).map((n) => n.toString());
const scaleKeys = ["q", "w", "e", "r", "t", "y"];
const zeroKeys = ["0"];
const extraKeys = [
  "m",
  "s",
  "p",
  "v",
  "c",
  "d",
  "minus",
  "`",
  "equal",
  "shift",
  "meta",
];
const ALL_KEYS = [...numberKeys, ...zeroKeys, ...scaleKeys, ...extraKeys];

export const useLivePlay = () => {
  const dispatch = useProjectDispatch();
  const scaleTrackIds = useDeep(selectScaleTrackIds);
  const patternTracks = useDeep(selectPatternTracks);
  const selectedTrackId = useDeep(selectSelectedTrackId);
  const trackAncestorMap = useDeep(selectTrackAncestorIdsMap);
  const patternClips = useDeep(selectSelectedPatternClips);
  const poseMap = useDeep(selectPoseMap);
  const poseClips = useDeep(selectPoseClips);
  const selectedPoses = useDeep(selectSelectedPoses);
  const clips = useDeep(selectSelectedPoseClips);
  const hasClips = clips.length > 0;
  const { tick } = useTransportTick();
  const holding = useHeldHotkeys(ALL_KEYS);
  useEffect(() => {
    if (!Object.keys(holding).some((key) => holding[key])) {
      dispatchCustomEvent("add-shortcut", {});
    }
  }, [holding]);

  // The callback for the numerical keydown event
  const keydown = useCallback(
    (e: KeyboardEvent) => {
      if (isInputEvent(e)) return;

      // Try to get the number of the key
      const number = parseInt(e.key);
      if (isNaN(number)) return;

      // Get the pattern track by number (for mute/solo)
      const patternTrack = patternTracks[number - 1];
      const instrumentId = patternTrack?.instrumentId;

      // Toggle mute/solo if holding the right keys
      if (holding.m) dispatch(toggleInstrumentMute(instrumentId));
      if (holding.s) dispatch(toggleInstrumentSolo(instrumentId));

      // Return early if mixing
      if (holding.m || holding.s) return;

      const isNegative = holding["-"] || holding["`"];

      const keymap: Record<string, string> = {
        ["scale-track_1"]: "q",
        ["scale-track_2"]: "w",
        ["scale-track_3"]: "e",
        chordal: "r",
        chromatic: "t",
        octave: "y",
      };
      const allKeys = Object.keys(keymap) as PoseVectorId[];
      const vectorKeys = allKeys.filter((key) => holding[keymap[key]]);

      // Walk the clips along the scale (held keys)
      if (holding.c) {
        if (!vectorKeys.length) return;
        return dispatch(
          walkSelectedPatternClips({
            data: {
              options: {
                select: number - 1,
                direction: isNegative ? "down" : "up",
                vectorKeys,
                spread: Math.max(3, number),
              },
            },
          })
        );
      }

      // Walk the clips along the scale (diatonically)
      if (holding.d) {
        if (!vectorKeys.length) return;
        return dispatch(
          walkSelectedPatternClips({
            data: {
              options: {
                step: isNegative ? -number + 1 : number - 1,
                vectorKeys,
                spread: Math.max(3, number),
                direction: isNegative ? "down" : undefined,
              },
            },
          })
        );
      }

      if (!vectorKeys.length) return;
      const isExact = holding["="];

      // Compute the pose offset record
      const dir = isNegative ? -1 : 1;
      const value = number * dir;

      const sumVector = (trackId?: TrackId, initialVector: PoseVector = {}) => {
        const vector = { ...initialVector };
        if (!trackId) return vector;
        const [q, w, e] = trackAncestorMap[trackId];
        if (q && holding.q) {
          if (isExact) vector[q] = value;
          else vector[q] = (vector[q] ?? 0) + value;
        }
        if (w && holding.w) {
          if (isExact) vector[w] = value;
          else vector[w] = (vector[w] ?? 0) + value;
        }
        if (e && holding.e) {
          if (isExact) vector[e] = value;
          else vector[e] = (vector[e] ?? 0) + value;
        }
        if (holding.r) {
          if (isExact) vector.chordal = value;
          else vector.chordal = (vector.chordal ?? 0) + value;
        }
        if (holding.t) {
          if (isExact) vector.chromatic = value;
          else vector.chromatic = (vector.chromatic ?? 0) + value;
        }
        if (holding.y) {
          if (isExact) vector.octave = value;
          else vector.octave = (vector.octave ?? 0) + value;
        }
        return vector;
      };

      const undoType = createUndoType(`livePlay-${e.key}/${nanoid()}`);
      for (const pose of selectedPoses) {
        const vector = sumVector(pose.trackId, pose.vector);
        dispatch(updatePose({ data: { ...pose, vector }, undoType }));
      }

      // Return early if no vector
      if (selectedPoses.length) return;

      for (const { tick, trackId } of patternClips) {
        const vector = sumVector(trackId);
        const match = poseClips.find(
          (clip) => clip.tick === tick && clip.trackId === trackId
        );
        if (match) {
          const pose = poseMap[match.poseId];
          if (!pose) continue;
          dispatch(
            updatePose({
              data: {
                id: pose.id,
                vector: sumVectors(pose.vector, vector),
              },
              undoType,
            })
          );
          continue;
        }
        // Create a new pose with the given vector
        dispatch(
          createCourtesyPoseClip({
            data: { pose: { vector, trackId }, clip: { tick, trackId } },
            undoType,
          })
        );
      }
      if (patternClips.length) return;

      const trackId =
        selectedTrackId ??
        patternTracks.at(0)?.id ??
        dispatch(
          createPatternTrack({
            data: { track: { parentId: scaleTrackIds.at(-1) } },
          })
        ).track.id;

      const vector = sumVector(trackId);
      const match = poseClips.find(
        (clip) => clip.tick === tick && clip.trackId === trackId
      );
      if (match) {
        const pose = poseMap[match.poseId];
        if (pose) {
          dispatch(
            updatePose({
              data: {
                id: pose.id,
                vector: sumVectors(pose.vector, vector),
              },
              undoType,
            })
          );
        }
      } else {
        dispatch(
          createCourtesyPoseClip({
            data: {
              clip: { tick, trackId },
              pose: { vector, trackId },
            },
            undoType,
          })
        );
      }
    },
    [
      holding,
      patternTracks,
      selectedPoses,
      selectedTrackId,
      trackAncestorMap,
      patternClips,
      poseClips,
      poseMap,
      tick,
      scaleTrackIds,
    ]
  );

  // The callback for the numerical zero keydown event
  const zeroKeydown = useCallback(
    (e: KeyboardEvent) => {
      const key = e.key;
      if (!zeroKeys.includes(key)) return;
      if (isInputEvent(e)) return;

      // Unmute all tracks if holding m
      if (holding.m) {
        dispatch(unmuteTracks());
      }

      // Unsolo all tracks if holding s
      if (holding.s) {
        dispatch(unsoloTracks());
      }

      const undoType = createUndoType(`livePlay-zero/${nanoid()}`);

      for (const pose of selectedPoses) {
        const trackId = pose.trackId;
        if (!trackId) continue;
        let vector = { ...(pose.vector ?? {}) };
        const [q, w, e] = trackAncestorMap[trackId];
        if (q && holding.q) delete vector[q];
        if (w && holding.w) delete vector[w];
        if (e && holding.e) delete vector[e];
        if (holding.r) delete vector.chordal;
        if (holding.t) delete vector.chromatic;
        if (holding.y) delete vector.octave;
        if (["q", "w", "e", "r", "t", "y"].every((key) => !holding[key])) {
          vector = {};
        }
        dispatch(updatePose({ data: { ...pose, vector }, undoType }));
      }
      if (selectedPoses.length) return;

      for (const { tick, trackId } of patternClips) {
        const match = poseClips.find(
          (clip) => clip.tick === tick && clip.trackId === trackId
        );
        if (match) {
          const pose = poseMap[match.poseId];
          if (!pose) continue;
          const vector = { ...(pose.vector ?? {}) };
          const trackId = pose.trackId;
          if (!trackId) continue;
          const [q, w, e] = trackAncestorMap[trackId];
          if (q && holding.q) delete vector[q];
          if (w && holding.w) delete vector[w];
          if (e && holding.e) delete vector[e];
          if (holding.r) delete vector.chordal;
          if (holding.t) delete vector.chromatic;
          if (holding.y) delete vector.octave;
          if (["q", "w", "e", "r", "t", "y"].every((key) => !holding[key])) {
            dispatch(updatePose({ data: { ...pose, vector: {} }, undoType }));
            return;
          }
          dispatch(updatePose({ data: { ...pose, vector }, undoType }));
        }
      }
    },
    [holding, hasClips]
  );

  /**
   * Add the corresponding event listener to the window if the user is live.
   * (This is a workaround for duplicated events with react-hotkeys)
   */
  useEffect(() => {
    window.addEventListener("keydown", keydown);
    window.addEventListener("keydown", zeroKeydown);
    return () => {
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keydown", zeroKeydown);
    };
  }, [keydown, zeroKeydown]);
};
