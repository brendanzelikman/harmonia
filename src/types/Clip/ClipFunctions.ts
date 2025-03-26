import { Motif } from "types/Arrangement/ArrangementTypes";
import { Clip } from "./ClipTypes";
import { getPatternDuration } from "types/Pattern/PatternFunctions";
import { isPattern } from "types/Pattern/PatternTypes";
import { getPoseDuration } from "types/Pose/PoseFunctions";
import { isPose } from "types/Pose/PoseTypes";

/** Get the total duration of a `Clip` using its field or the duration of the stream provided. */
export const getClipDuration = (clip?: Clip, object?: Motif) => {
  if (clip === undefined || object === undefined) return 0;

  // If the clip has a duration, return it
  if (clip.duration !== undefined) return clip.duration ?? Infinity;

  // Otherwise, return the stream duration - clip offset
  const streamOffset = clip.offset ?? 0;
  const streamDuration = isPattern(object)
    ? getPatternDuration(object)
    : isPose(object)
    ? getPoseDuration(object)
    : 0;
  return Math.max(streamDuration - streamOffset, 0);
};

/** Get the underlying motif ID of a clip. */
export const getClipMotifId = (clip?: Partial<Clip>) => {
  if (clip === undefined) return undefined;
  if (clip.type === "pattern") return clip.patternId;
  if (clip.type === "pose") return clip.poseId;
};
