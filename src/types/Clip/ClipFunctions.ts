import { getObjectDuration } from "types/Motif/MotifFunctions";
import { isClipInterface, Clip } from "./ClipTypes";
import { Motif } from "types/Motif/MotifTypes";

/** Get the total duration of a `Clip` using its field or the duration of the stream provided. */
export const getClipDuration = (clip?: Clip, object?: Motif) => {
  if (!isClipInterface(clip)) return 0;

  // If the clip has a duration, return it
  if (clip.duration !== undefined) return clip.duration ?? Infinity;

  // Otherwise, return the stream duration - clip offset
  if (!object) return 0;
  const streamDuration = getObjectDuration(object);
  const streamOffset = clip.offset ?? 0;
  return Math.max(streamDuration - streamOffset, 0);
};
