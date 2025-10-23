import { getHeldKey } from "hooks/useHeldkeys";
import {
  StreamQueryOptions,
  PartialQueryOptions,
} from "types/Arrangement/ArrangementSearchFunctions";
import { walkSelectedPatternClips } from "types/Arrangement/ArrangementThunks";
import { Thunk } from "types/Project/ProjectTypes";
import { allKeys, keymap, isNegative } from "./utils";
import { PoseVectorId } from "types/Pose/PoseTypes";
import { selectScaleTrackChainIds } from "types/Track/TrackSelectors";
import { selectSelectedPatternClips } from "types/Timeline/TimelineSelectors";
import { selectPatternClips } from "types/Clip/ClipSelectors";
import { PatternClip } from "types/Clip/ClipTypes";

const chainIds: PoseVectorId[] = [
  "scale-track_1",
  "scale-track_2",
  "scale-track_3",
];

/** Gesture to lead the voice by closeness */
export const leadPatternsToNthClosestPose =
  (number: number): Thunk =>
  (dispatch, getProject) => {
    const keys = allKeys.filter((key) => getHeldKey(keymap[key]));
    let clip: PatternClip = selectSelectedPatternClips(getProject())[0];
    if (!clip) clip = selectPatternClips(getProject())[0];

    if (!keys.length) {
      if (!clip) return;
      const count = selectScaleTrackChainIds(getProject(), clip.trackId).length;
      keys.push(...chainIds.slice(0, count));
    }

    // If one key is pressed, push chordal as well
    else if (keys[0] !== "chordal" && !keys[1]) keys.push("chordal");

    // Construct the options
    const select = number - 1;
    const direction = isNegative() ? "down" : "up";
    const spread = Math.max(5, number);
    const options: StreamQueryOptions = { keys, select, direction, spread };

    // Walk the selected pattern clips
    return dispatch(
      walkSelectedPatternClips({ data: { clipIds: [clip?.id], options } })
    );
  };

/** Gesture to lead the voice by degree */
export const leadPatternsToClosestNthPose =
  (number: number): Thunk =>
  (dispatch, getProject) => {
    const keys = allKeys.filter((key) => getHeldKey(keymap[key]));
    let clip: PatternClip = selectSelectedPatternClips(getProject())[0];
    if (!clip) clip = selectPatternClips(getProject())[0];

    if (!keys.length) {
      if (!clip) return;
      const count = selectScaleTrackChainIds(getProject(), clip.trackId).length;
      keys.push(...chainIds.slice(0, count));
    }

    // Construct the options
    let base = number - 1;
    const step = isNegative() ? -base : base;
    const spread = Math.max(5, base);
    const direction = isNegative() ? "down" : "any";
    const options: PartialQueryOptions = { keys, step, spread, direction };

    // Walk the selected pattern clips
    return dispatch(
      walkSelectedPatternClips({ data: { clipIds: [clip?.id], options } })
    );
  };
