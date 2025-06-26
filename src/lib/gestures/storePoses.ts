import { selectPoseById } from "types/Pose/PoseSelectors";
import { Thunk } from "types/Project/ProjectTypes";
import {
  selectCurrentTimelineTick,
  selectSelectedPoseClips,
  selectSelectedTrackId,
  selectStoredPoseByIndex,
} from "types/Timeline/TimelineSelectors";
import { addPoseToStorage } from "types/Timeline/TimelineSlice";
import { createNewPoseClip } from "types/Track/PatternTrack/PatternTrackThunks";

/** Store the first pose selected to the given slot. */
export const savePoseToSlot =
  (slot: number): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const poseClips = selectSelectedPoseClips(project);
    if (poseClips.length === 0) return;
    const poseId = poseClips[0].poseId;
    const pose = selectPoseById(project, poseId);
    if (!pose) return;
    dispatch(addPoseToStorage({ data: { index: slot - 1, pose } }));
  };

/** Create a new clip based on the pose in the given slot. */
export const applyPoseFromSlot =
  (slot: number): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const pose = selectStoredPoseByIndex(project, slot - 1);
    const trackId = selectSelectedTrackId(project);
    if (!pose || !trackId) return;
    const tick = selectCurrentTimelineTick(project);
    dispatch(createNewPoseClip({ data: { pose, clip: { tick, trackId } } }));
  };
