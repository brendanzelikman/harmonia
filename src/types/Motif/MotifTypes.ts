import { ClipType } from "types/Clip/ClipTypes";
import { defaultPatternState } from "types/Pattern/PatternSlice";
import { Pattern, PatternId, PatternState } from "types/Pattern/PatternTypes";
import { defaultPoseState } from "types/Pose/PoseSlice";
import { Pose, PoseId, PoseState } from "types/Pose/PoseTypes";
import { defaultScaleState } from "types/Scale/ScaleSlice";
import { ScaleId, ScaleObject, ScaleState } from "types/Scale/ScaleTypes";

export type Motif<T = ClipType> = T extends "pattern"
  ? Pattern
  : T extends "pose"
  ? Pose
  : T extends "scale"
  ? ScaleObject
  : never;

export type MotifId<T = ClipType> = T extends "pattern"
  ? PatternId
  : T extends "pose"
  ? PoseId
  : T extends "scale"
  ? ScaleId
  : never;

export interface MotifState {
  pattern: PatternState;
  pose: PoseState;
  scale: ScaleState;
}

export const defaultMotifState: MotifState = {
  pattern: defaultPatternState,
  pose: defaultPoseState,
  scale: defaultScaleState,
};
