import { getHeldKey } from "hooks/useHeldkeys";
import {
  StreamQueryOptions,
  PartialQueryOptions,
} from "types/Arrangement/ArrangementSearchFunctions";
import { walkSelectedPatternClips } from "types/Arrangement/ArrangementThunks";
import { Thunk } from "types/Project/ProjectTypes";
import { allKeys, keymap, isNegative } from "./utils";
import { PoseVectorId } from "types/Pose/PoseTypes";

/** Gesture to lead the voice by closeness */
export const leadPatternsToNthClosestPose =
  (number: number): Thunk =>
  (dispatch) => {
    const keys = allKeys.filter((key) => getHeldKey(keymap[key]));
    if (!keys.length)
      keys.push(
        ...([
          "scale-track_1",
          "scale-track_2",
          "scale-track_3",
        ] as PoseVectorId[])
      );

    // If one key is pressed, push chordal as well
    if (keys[0] !== "chordal" && !keys[1]) keys.push("chordal");

    // Construct the options
    const select = number;
    const direction = isNegative() ? "down" : "up";
    const spread = Math.max(5, number);
    const options: StreamQueryOptions = { keys, select, direction, spread };

    // Walk the selected pattern clips
    return dispatch(walkSelectedPatternClips({ data: { options } }));
  };

/** Gesture to lead the voice by degree */
export const leadPatternsToClosestNthPose =
  (number: number): Thunk =>
  (dispatch) => {
    const keys = allKeys.filter((key) => getHeldKey(keymap[key]));
    if (!keys.length)
      keys.push(
        ...([
          "scale-track_1",
          "scale-track_2",
          "scale-track_3",
        ] as PoseVectorId[])
      );

    // If one key is pressed, push chordal as well
    if (keys[0] !== "chordal" && !keys[1]) keys.push("chordal");

    // Construct the options
    const step = isNegative() ? -number : number;
    const spread = Math.max(5, number);
    const direction = isNegative() ? "down" : "any";
    const options: PartialQueryOptions = { keys, step, spread, direction };

    // Walk the selected pattern clips
    return dispatch(walkSelectedPatternClips({ data: { options } }));
  };
