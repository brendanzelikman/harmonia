import { nanoid } from "@reduxjs/toolkit";
import { selectPoseClips } from "types/Clip/ClipSelectors";
import { selectPoseMap } from "types/Pose/PoseSelectors";
import { updatePose } from "types/Pose/PoseSlice";
import { Thunk } from "types/Project/ProjectTypes";
import { createUndoType } from "types/redux";
import {
  selectCurrentTimelineTick,
  selectSelectedTrackId,
} from "types/Timeline/TimelineSelectors";
import { createNewPoseClip } from "types/Track/PatternTrack/PatternTrackThunks";
import {
  selectScaleTrackIds,
  selectPatternTracks,
  selectTrackAncestorIdsMap,
} from "types/Track/TrackSelectors";
import { sumVectors } from "utils/vector";
import { getMatch, isNegative, sumVector } from "./utils";

/** Gesture to create or update poses at the current tick */
export const updatePoseAtCursorGesture =
  (number: number): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const undoType = createUndoType(nanoid());
    const scaleTrackIds = selectScaleTrackIds(project);
    const patternTracks = selectPatternTracks(project);
    const selectedTrackId = selectSelectedTrackId(project);
    const ancestorMap = selectTrackAncestorIdsMap(project);
    const poseClips = selectPoseClips(project);
    const poseMap = selectPoseMap(project);
    const value = number * (isNegative() ? -1 : 1);

    // If no clips are selected, try to find a track or return
    const trackId =
      selectedTrackId ?? scaleTrackIds.at(-1) ?? patternTracks[0]?.id;
    if (!trackId) return;

    // Get the vector based on the track
    const vector = sumVector({}, value, ancestorMap[trackId]);

    // If the cursor is on a pose, update its vector
    const tick = selectCurrentTimelineTick(project);
    const match = getMatch(poseClips, { tick, trackId });
    if (match) {
      const id = match.poseId;
      const pose = poseMap[id];
      const newVector = sumVectors(pose.vector, vector);
      dispatch(updatePose({ data: { id, vector: newVector }, undoType }));
    }

    // Otherwise, create a new pose with the given vector
    else {
      const pose = { vector };
      const clip = { tick, trackId };
      dispatch(createNewPoseClip({ data: { pose, clip }, undoType }));
    }
  };

/** Gesture to create a reset pose at the current tick */
export const createResetPoseAtCursorGesture =
  (): Thunk => (dispatch, getProject) => {
    const project = getProject();
    const undoType = createUndoType(nanoid());
    const patternTracks = selectPatternTracks(project);
    const selectedTrackId = selectSelectedTrackId(project);
    const tick = selectCurrentTimelineTick(project);
    const trackId = selectedTrackId ?? patternTracks[0]?.id ?? undefined;
    if (!trackId) return;

    const poseClips = selectPoseClips(project).filter(
      (clip) => clip.trackId === trackId
    );
    const tickMatch = poseClips.find((clip) => clip.tick === tick);
    if (tickMatch) {
      const poseId = tickMatch.poseId;
      dispatch(updatePose({ data: { id: poseId, vector: {} }, undoType }));
      return;
    }

    // Create or update a reset pose at the current tick
    const pose = { reset: true };
    const clip = { tick, trackId };
    const match = getMatch(poseClips, clip);
    if (match) {
      const id = match.poseId;
      dispatch(updatePose({ data: { id, ...pose }, undoType }));
      return;
    }
    dispatch(createNewPoseClip({ data: { pose, clip }, undoType }));
  };
