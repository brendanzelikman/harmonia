import { Tick } from "types/units";
import { sortClipsByProximity } from "../ClipUtils";
import { Clip, ScaleClipMap, isIScaleClip } from "../ClipTypes";
import { ScaleClip } from "./ScaleClipTypes";
import { getValueByKey, getDictValues } from "utils/objects";
import { getScaleNotes } from "types/Scale/ScaleFunctions";
import { ScaleObject, ScaleId, ScaleMap } from "types/Scale/ScaleTypes";
import { TrackId } from "types/Track/TrackTypes";

// ------------------------------------------------------------
// Scale Clip Helpers
// ------------------------------------------------------------

/** Get the `ScaleClips` from a list of `Clips` */
export const getScaleClips = (clips: Clip[]): ScaleClip[] => {
  return clips.filter(isIScaleClip);
};

/** Get the `ScaleClips` of a given track from a list of clips. */
export const getScaleClipsByTrackId = (
  clipMap?: ScaleClipMap,
  trackId?: TrackId
): ScaleClip[] => {
  if (!clipMap || !trackId) return [];
  const clips = getDictValues(clipMap);
  return clips.filter((c) => c.trackId === trackId);
};

/** Get the current ScaleClip based on tick. */
export const getMostRecentScaleFromClips = (
  initialScale: ScaleObject,
  scaleClips: ScaleClip[],
  scaleMap?: ScaleMap,
  tick: Tick = 0
) => {
  const clipCount = scaleClips.length;
  if (!clipCount || !scaleMap) return initialScale;

  const initialSize = getScaleNotes(initialScale).length;

  // Scales must be the same length as the initial scale
  const guard = (clip: ScaleClip) => {
    const scale = scaleMap[clip.scaleId];
    const scaleArray = getScaleNotes(scale);
    return scaleArray.length === initialSize;
  };

  // The clip is mapped to its scale
  const map = (clip: ScaleClip) =>
    getValueByKey(scaleMap, clip.scaleId) ?? initialScale;

  // Find the most recent scale
  const recentScales = sortClipsByProximity(scaleClips, tick, guard, map);
  return recentScales[0] ?? initialScale;
};
