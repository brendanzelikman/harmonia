import { useHotkeys } from "hooks/useHotkeys";
import { getHeldKey, useHeldKeys } from "hooks/useHeldkeys";
import { Thunk } from "types/Project/ProjectTypes";
import {
  selectSelectedPatternClips,
  selectSelectedPoseClips,
} from "types/Timeline/TimelineSelectors";
import {
  createResetPoseAtCursorGesture,
  updatePoseAtCursorGesture,
} from "./moveFromRoot";
import {
  leadPatternsToNthClosestPose,
  leadPatternsToClosestNthPose,
} from "./leadPatterns";
import {
  muteTrackGesture,
  resetSamplersGesture,
  soloTrackGesture,
} from "./mixSamplers";
import {
  offsetSelectedPatternPoses,
  zeroSelectedPatternPoses,
} from "./updatePatterns";
import { offsetSelectedPoses, zeroSelectedPoses } from "./updatePoses";
import { applyPatternFromSlot, savePatternToSlot } from "./storePatterns";
import { applyPoseFromSlot, savePoseToSlot } from "./storePoses";
import {
  clearPatternStorage,
  clearPoseStorage,
} from "types/Timeline/TimelineSlice";

const qwertyKeys = ["q", "w", "e", "r", "t", "y"] as const;
const trackKeys = ["m", "s"];
const miscKeys = ["c", "d", "z", "x", "v", "b", "-", "`", "="];
const hotkeys = [...qwertyKeys, ...trackKeys, ...miscKeys];

/** A custom hook to use keyboard gestures */
export const useGestures = () => {
  useHeldKeys(hotkeys);
  useHotkeys(
    {
      1: (dispatch) => dispatch(keydown(1)),
      2: (dispatch) => dispatch(keydown(2)),
      3: (dispatch) => dispatch(keydown(3)),
      4: (dispatch) => dispatch(keydown(4)),
      5: (dispatch) => dispatch(keydown(5)),
      6: (dispatch) => dispatch(keydown(6)),
      7: (dispatch) => dispatch(keydown(7)),
      8: (dispatch) => dispatch(keydown(8)),
      9: (dispatch) => dispatch(keydown(9)),
      0: (dispatch) => dispatch(zerodown()),
    },
    "keypress"
  );
};

/** The gesture handler for numerical keys */
export const keydown =
  (number: number): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();

    // Handle mute and solo by index
    const muting = getHeldKey("m");
    const soloing = getHeldKey("s");
    if (muting || soloing) {
      if (muting) {
        dispatch(muteTrackGesture(number));
      }
      if (soloing) {
        dispatch(soloTrackGesture(number));
      }
      return;
    }

    // Handle voice leading by closeness
    if (getHeldKey("c")) {
      dispatch(leadPatternsToNthClosestPose(number));
      return;
    }

    // Handle voice leading by degree
    if (getHeldKey("d")) {
      dispatch(leadPatternsToClosestNthPose(number));
      return;
    }

    // Handle pattern storage
    if (getHeldKey("z")) {
      dispatch(savePatternToSlot(number));
      return;
    }

    // Handle pose storage
    if (getHeldKey("v")) {
      dispatch(savePoseToSlot(number));
      return;
    }

    // Handle pattern applications
    if (getHeldKey("x")) {
      dispatch(applyPatternFromSlot(number));
      return;
    }

    // Handle pose applications
    if (getHeldKey("b")) {
      dispatch(applyPoseFromSlot(number));
      return;
    }

    // Handle pose updates for selected pose clips
    if (!!selectSelectedPatternClips(project).length) {
      dispatch(offsetSelectedPatternPoses(number));
      return;
    }

    // Create or update a pose for every pattern clip
    if (!!selectSelectedPoseClips(project).length) {
      dispatch(offsetSelectedPoses(number));
      return;
    }

    dispatch(updatePoseAtCursorGesture(number));
  };

/** The gesture handler for zero keys */
export const zerodown = (): Thunk => (dispatch, getProject) => {
  const project = getProject();

  // Handle mixing events
  if (getHeldKey("m") || getHeldKey("s")) {
    dispatch(resetSamplersGesture());
    return;
  }

  // Handle pattern storage events
  if (getHeldKey("z")) {
    dispatch(clearPatternStorage());
    return;
  }

  // Handle pose storage events
  if (getHeldKey("v")) {
    dispatch(clearPoseStorage());
    return;
  }

  // Handle pose updates for selected pose clips
  if (selectSelectedPoseClips(project).length) {
    dispatch(zeroSelectedPoses());
    return;
  }

  // Handle pose updates for selected pattern clips
  if (selectSelectedPatternClips(project).length) {
    dispatch(zeroSelectedPatternPoses());
    return;
  }

  // If no clips are selected, create a reset pose at the current tick
  dispatch(createResetPoseAtCursorGesture());
};
