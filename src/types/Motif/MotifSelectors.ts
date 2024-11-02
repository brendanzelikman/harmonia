import {
  _selectPatternMap,
  selectPatternMap,
} from "types/Pattern/PatternSelectors";
import { _selectPoseMap, selectPoseMap } from "types/Pose/PoseSelectors";
import { _selectScaleMap, selectScaleMap } from "types/Scale/ScaleSelectors";
import { createDeepSelector } from "lib/redux";
import { MotifState } from "./MotifTypes";

/** Select the motif state from the project. */
export const selectMotifState = createDeepSelector(
  [selectScaleMap, selectPatternMap, selectPoseMap],
  (scales, patterns, poses): MotifState => {
    return {
      scale: { entities: scales, ids: Object.keys(scales) },
      pattern: { entities: patterns, ids: Object.keys(patterns) },
      pose: { entities: poses, ids: Object.keys(poses) },
    };
  }
);

/** Select the non-preset motif state from the project. */
export const selectCustomMotifState = createDeepSelector(
  [_selectScaleMap, _selectPatternMap, _selectPoseMap],
  (scales, patterns, poses): MotifState => {
    return {
      scale: { entities: scales, ids: Object.keys(scales) },
      pattern: { entities: patterns, ids: Object.keys(patterns) },
      pose: { entities: poses, ids: Object.keys(poses) },
    };
  }
);
