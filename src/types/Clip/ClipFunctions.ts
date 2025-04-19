import { Clip, isPatternClip, isPoseClip } from "./ClipTypes";

/** Get the underlying motif ID of a clip. */
export const getClipMotifId = (clip?: Partial<Clip>) => {
  if (clip === undefined) return undefined;
  if (isPatternClip(clip)) return clip.patternId;
  if (isPoseClip(clip)) return clip.poseId;
};
