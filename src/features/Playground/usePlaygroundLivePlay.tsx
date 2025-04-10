import { isInputEvent } from "utils/html";
import { useSelect, useDispatch } from "hooks/useStore";
import { useCallback, useEffect } from "react";
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
  selectTimelineTick,
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
import { createUndoType } from "types/redux";
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
import { useTick } from "hooks/useTick";
import { PoseClip } from "types/Clip/ClipTypes";
import { useHeldKeys } from "hooks/useHeldKeys";
import { range } from "utils/array";

const numberKeys = range(1, 10).map((n) => n.toString());
const scaleKeys = ["q", "w", "e", "r", "t", "y"];
const zeroKeys = ["0"];
const extraKeys = ["m", "s", "p", "v", "c", "d", "-", "`", "="];
const hotkeys = [...numberKeys, ...zeroKeys, ...scaleKeys, ...extraKeys];

export const useLivePlay = () => {
  const dispatch = useDispatch();
  const scaleTrackIds = useSelect(selectScaleTrackIds);
  const patternTracks = useSelect(selectPatternTracks);
  const selectedTrackId = useSelect(selectSelectedTrackId);
  const trackAncestorMap = useSelect(selectTrackAncestorIdsMap);
  const patternClips = useSelect(selectSelectedPatternClips);
  const poseMap = useSelect(selectPoseMap);
  const poseClips = useSelect(selectPoseClips);
  const selectedPoses = useSelect(selectSelectedPoses);
  const clips = useSelect(selectSelectedPoseClips);
  const hasClips = clips.length > 0;
  const transport = useTick();
  const timelineTick = useSelect(selectTimelineTick);
  const tick = timelineTick === 0 ? transport.tick : timelineTick;
  const holding = useHeldKeys(hotkeys);

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
        if (vectorKeys[0] !== "chordal" && !vectorKeys[1]) {
          vectorKeys.push("chordal");
        }
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
        if (vectorKeys[0] !== "chordal" && !vectorKeys[1]) {
          vectorKeys.push("chordal");
        }
        return dispatch(
          walkSelectedPatternClips({
            data: {
              options: {
                step: isNegative ? -number + 1 : number - 1,
                vectorKeys,
                spread: Math.max(8, number),
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
      for (const clip of clips) {
        const pose = poseMap[clip.poseId];
        if (pose === undefined) continue;
        const vector = sumVector(clip.trackId, pose.vector);
        dispatch(updatePose({ data: { ...pose, vector }, undoType }));
      }

      // Return early if no vector
      if (clips.length) return;

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
              data: { id: pose.id, vector: sumVectors(pose.vector, vector) },
              undoType,
            })
          );
          continue;
        }
        // Create a new pose with the given vector
        dispatch(
          createCourtesyPoseClip({
            data: { pose: { vector }, clip: { tick, trackId } },
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
      let match: PoseClip | undefined = undefined;
      for (const clip of poseClips) {
        if (clip.trackId === trackId && clip.tick === tick) {
          match = clip;
          break;
        } else if (clip.tick > tick) {
          break;
        }
      }

      if (match) {
        const pose = poseMap[match.poseId];
        if (pose) {
          dispatch(
            updatePose({
              data: {
                id: match.poseId,
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
              clip: { trackId, tick },
              pose: { vector },
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
      clips,
      tick,
      scaleTrackIds,
      hasClips,
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

      for (const clip of clips) {
        const pose = poseMap[clip.poseId];
        if (pose === undefined) continue;
        const trackId = clip.trackId;
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
      if (clips.length) return;

      for (const { tick, trackId } of patternClips) {
        const match = poseClips.find(
          (clip) => clip.tick === tick && clip.trackId === trackId
        );
        if (match) {
          const pose = poseMap[match.poseId];
          if (!pose) continue;
          const vector = { ...(pose.vector ?? {}) };
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
    [
      holding,
      hasClips,
      clips,
      poseClips,
      patternClips,
      poseMap,
      trackAncestorMap,
    ]
  );

  useEffect(() => {
    document.addEventListener("keypress", keydown);
    document.addEventListener("keypress", zeroKeydown);
    return () => {
      document.removeEventListener("keypress", keydown);
      document.removeEventListener("keypress", zeroKeydown);
    };
  }, [keydown, zeroKeydown]);
};
