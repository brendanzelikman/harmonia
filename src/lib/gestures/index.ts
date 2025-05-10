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
import { mixSamplerByIndex, resetSamplersGesture } from "./mixSamplers";
import {
  offsetSelectedPatternPoses,
  zeroSelectedPatternPoses,
} from "./updatePatterns";
import { offsetSelectedPoses, zeroSelectedPoses } from "./updatePoses";
import { useMemo } from "react";
import { HotkeyMap } from "lib/hotkeys";
import { some } from "lodash";

const qwertyKeys = ["q", "w", "e", "r", "t", "y"] as const;
const trackKeys = ["m", "s"];
const miscKeys = ["c", "d", "-", "`", "="];
const hotkeys = [...qwertyKeys, ...trackKeys, ...miscKeys];

/** A custom hook to use keyboard gestures */
export const useGestures = () => {
  const holding = useHeldKeys(hotkeys);
  const hotkeyMap: HotkeyMap = useMemo(() => {
    return {
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
    };
  }, [holding]);
  useHotkeys(hotkeyMap, "keypress");
  return holding;
};

/** The gesture handler for numerical keys */
export const keydown =
  (number: number): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();

    // Handle mixing events for samplers
    if (getHeldKey("m") || getHeldKey("s")) {
      dispatch(mixSamplerByIndex(number));
      return;
    }

    // // Create or update a pose at the current tick
    // if (!some(["q", "w", "e", "r", "t", "y"].map(getHeldKey))) return;

    // Handle voice leading by closeness (push chordal when one key)
    if (getHeldKey("c")) {
      dispatch(leadPatternsToNthClosestPose(number));
      return;
    }

    // Handle voice leading by degree (push chordal when one key)
    if (getHeldKey("d")) {
      dispatch(leadPatternsToClosestNthPose(number));
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
