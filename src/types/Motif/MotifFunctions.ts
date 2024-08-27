import { Motif } from "types/Motif/MotifTypes";
import { getPatternDuration } from "types/Pattern/PatternFunctions";
import { isPattern } from "types/Pattern/PatternTypes";
import { getPoseDuration } from "types/Pose/PoseFunctions";
import { isPose } from "types/Pose/PoseTypes";

export const getObjectDuration = (object?: Motif) => {
  if (isPattern(object)) {
    return getPatternDuration(object);
  }
  if (isPose(object)) {
    return getPoseDuration(object);
  }
  return 0;
};
