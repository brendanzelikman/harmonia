import { Clip } from "./ClipTypes";

/** Get the underlying motif ID of a clip. */
export const getClipMotifId = (clip?: Partial<Clip>) => {
  if (clip === undefined) return undefined;
  if (clip.type === "pattern") return clip.patternId;
  if (clip.type === "pose") return clip.poseId;
};
