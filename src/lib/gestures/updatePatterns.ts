import { nanoid } from "@reduxjs/toolkit";
import { uniqBy } from "lodash";
import { selectPoseClips } from "types/Clip/ClipSelectors";
import { selectPoseMap } from "types/Pose/PoseSelectors";
import { updatePose, updatePoses } from "types/Pose/PoseSlice";
import { PoseVector } from "types/Pose/PoseTypes";
import { Thunk } from "types/Project/ProjectTypes";
import { createUndoType } from "types/redux";
import {
  selectSelectedPatternClips,
  selectSelectedClipTrackIds,
} from "types/Timeline/TimelineSelectors";
import { createNewPoseClip } from "types/Track/PatternTrack/PatternTrackThunks";
import { selectTrackAncestorIdsMap } from "types/Track/TrackSelectors";
import { TrackId } from "types/Track/TrackTypes";
import { sumVectors } from "utils/vector";
import { isNegative, sumVector, getMatch, deleteVector } from "./utils";
import { getHeldKey } from "hooks/useHeldkeys";

/** Gesture to update the poses of the selected patterns */
export const offsetSelectedPatternPoses =
  (number: number): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const undoType = createUndoType(nanoid());
    const patternClips = selectSelectedPatternClips(project);
    const poseClips = selectPoseClips(project);
    const poseMap = selectPoseMap(project);
    const ancestorMap = selectTrackAncestorIdsMap(project);
    const trackIds = selectSelectedClipTrackIds(project);
    const value = number * (isNegative() ? -1 : 1);
    const holdingQwerty = ["q", "w", "e", "r", "t", "y"].some(getHeldKey);

    // Pre-compute vectors for every selected track
    const initial = holdingQwerty ? {} : { chordal: value };
    const trackIdVectors = trackIds.reduce(
      (acc, trackId) => ({
        ...acc,
        [trackId]: sumVector(initial, value, ancestorMap[trackId]),
      }),
      {} as Record<TrackId, PoseVector>
    );

    // Iterate over every selected pattern clip
    for (const { tick, trackId } of patternClips) {
      const vector = trackIdVectors[trackId];

      // If a pose clip is on the pattern clip, update its vector
      const match = getMatch(poseClips, { tick, trackId });
      if (match) {
        const id = match.poseId;
        const pose = poseMap[id];
        const newVector = sumVectors(pose.vector, vector);
        dispatch(updatePose({ data: { id, vector: newVector }, undoType }));
      }

      // Otherwise, create a new pose clip
      else {
        const pose = { vector };
        const clip = { tick, trackId };
        dispatch(createNewPoseClip({ data: { pose, clip }, undoType }));
      }
    }
  };

/** Gesture to zero the poses of the selected patterns */
export const zeroSelectedPatternPoses = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const undoType = createUndoType(nanoid());
  const patternClips = selectSelectedPatternClips(project);
  const poseClips = selectPoseClips(project);
  const poseMap = selectPoseMap(project);
  const ancestorMap = selectTrackAncestorIdsMap(project);

  // Create a new vector for each selected pattern clip
  const updates = patternClips
    .map((clip) => {
      const match = getMatch(poseClips, clip);
      if (!match) return;
      const id = match.poseId;
      const pose = poseMap[id];
      const ancestors = ancestorMap[clip.trackId];
      const vector = deleteVector(pose.vector, ancestors);
      return { id, vector };
    })
    .filter((update) => update !== undefined);

  // Update the poses
  dispatch(updatePoses({ data: uniqBy(updates, "id"), undoType }));
};
