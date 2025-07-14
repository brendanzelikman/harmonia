import { Thunk } from "types/Project/ProjectTypes";
import {
  selectSelectedPatternClips,
  selectSelectedPoseClips,
} from "types/Timeline/TimelineSelectors";
import { savePoseToSlot } from "./storePoses";
import { savePatternToSlot } from "./storePatterns";

/** Store the first pattern selected to the given slot. */
export const saveMediaToSlot =
  (slot: number): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const patternClips = selectSelectedPatternClips(project);
    const poseClips = selectSelectedPoseClips(project);
    if (poseClips.length > 0) {
      dispatch(savePoseToSlot(slot));
      return;
    }
    if (patternClips.length > 0) {
      dispatch(savePatternToSlot(slot));
      return;
    }
  };
