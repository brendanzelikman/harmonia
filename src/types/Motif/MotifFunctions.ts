import { ClipType } from "types/Clip/ClipTypes";
import { Motif, MotifId } from "types/Motif/MotifTypes";
import { getPatternDuration } from "types/Pattern/PatternFunctions";
import { isPattern } from "types/Pattern/PatternTypes";
import { getPoseDuration } from "types/Pose/PoseFunctions";
import { isPose } from "types/Pose/PoseTypes";
import { isScale } from "types/Scale/ScaleTypes";
import { createId } from "types/util";

export const getMotifType = (motif: Motif): ClipType => {
  if (isPattern(motif)) return "pattern";
  if (isPose(motif)) return "pose";
  if (isScale(motif)) return "scale";
  throw new Error("Unknown motif type");
};

export const copyMotif = <T extends ClipType>(motif: Motif<T>): Motif<T> => {
  const name = `${motif.name} Copy`;
  const type = getMotifType(motif);
  return { ...motif, name, id: createId(type) };
};

export const getMotifDuration = (motif?: Motif) => {
  if (isPattern(motif)) {
    return getPatternDuration(motif);
  }
  if (isPose(motif)) {
    return getPoseDuration(motif);
  }
  return 0; // Scales have no duration
};
