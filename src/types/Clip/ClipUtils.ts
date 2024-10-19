import { Tick, Update } from "types/units";
import {
  PatternClip,
  PoseClip,
  ScaleClip,
  Clip,
  ClipId,
  isPatternClipId,
  isPoseClipId,
  isScaleClipId,
  PatternClipId,
  PoseClipId,
  ScaleClipId,
  IClip,
  PatternClipMap,
  PoseClipMap,
  ScaleClipMap,
  ClipMap,
  ClipUpdate,
  PatternClipUpdate,
  PoseClipUpdate,
  ScaleClipUpdate,
  isPatternClip,
  isPoseClip,
  isScaleClip,
  IClipId,
  IClipMap,
} from "./ClipTypes";
import { ClipType } from "./ClipTypes";

// ------------------------------------------------------------
// Clip Type Helpers
// ------------------------------------------------------------

export type ClipsByType = { [T in ClipType]: IClip<T>[] };

/** Convert an array of clips to a record of clips by type */
export const getClipsByType = (clips: Clip[]): ClipsByType => {
  const pattern: PatternClip[] = [];
  const pose: PoseClip[] = [];
  const scale: ScaleClip[] = [];

  for (const clip of clips) {
    if (isPatternClip(clip)) pattern.push(clip);
    else if (isPoseClip(clip)) pose.push(clip);
    else if (isScaleClip(clip)) scale.push(clip);
  }

  return { pattern, pose, scale };
};
// ------------------------------------------------------------
// Clip Update Type Helpers
// ------------------------------------------------------------

export type ClipUpdatesByType = { [T in ClipType]: Update<IClip<T>>[] };

/** Convert an array of clips to a record of clips by type */
export const getClipUpdatesByType = (
  clips: ClipUpdate[]
): ClipUpdatesByType => {
  const pattern: PatternClipUpdate[] = [];
  const pose: PoseClipUpdate[] = [];
  const scale: ScaleClipUpdate[] = [];

  for (const clip of clips) {
    if (clip.id.startsWith("pattern")) pattern.push(clip as PatternClipUpdate);
    else if (clip.id.startsWith("pose")) pose.push(clip as PoseClipUpdate);
    else if (clip.id.startsWith("scale")) scale.push(clip as ScaleClipUpdate);
  }

  return { pattern, pose, scale };
};

// ------------------------------------------------------------
// Clip Id Type Helpers
// ------------------------------------------------------------
export type ClipIdsByType = { [T in ClipType]: IClipId<T>[] };

export const getClipIdsByType = (clips: ClipId[]): ClipIdsByType => {
  const pattern: PatternClipId[] = [];
  const pose: PoseClipId[] = [];
  const scale: ScaleClipId[] = [];

  const clipCount = clips.length;
  for (let i = 0; i < clipCount; i++) {
    const id = clips[i];
    if (isPatternClipId(id)) pattern.push(id);
    else if (isPoseClipId(id)) pose.push(id);
    else if (isScaleClipId(id)) scale.push(id);
  }

  return { pattern, pose, scale };
};

// ------------------------------------------------------------
// Clip Map Type Helpers
// ------------------------------------------------------------

export type ClipMapsByType = { [T in ClipType]: IClipMap<T> };

/** Convert a ClipMap to a record of maps by type */
export const getClipMapsByType = (clips: ClipMap): ClipMapsByType => {
  const pattern: PatternClipMap = {};
  const pose: PoseClipMap = {};
  const scale: ScaleClipMap = {};

  const clipIds = Object.keys(clips) as ClipId[];
  const clipCount = clipIds.length;
  for (let i = 0; i < clipCount; i++) {
    const clip = clips[clipIds[i]];
    if (!clip) continue;
    if (clip.type === "pattern") pattern[clip.id] = clip;
    else if (clip.type === "pose") pose[clip.id] = clip;
    else if (clip.type === "scale") scale[clip.id] = clip;
  }

  return { pattern, pose, scale };
};

// ------------------------------------------------------------
// Clip Tick Helpers
// ------------------------------------------------------------

/** Find all clips in the tick range that satisfy the guard,
 * then create a record mapping each tick to the clips (or something else via map). */
export const createMapFromClipRange = <
  T extends ClipType,
  R extends any = IClip<T>
>(
  clips: IClip<T>[],
  tickRange: [Tick, Tick],
  guard: (clip: IClip<T>) => boolean = () => true,
  map: (clip: IClip<T>, tick: Tick) => R
) => {
  const [start, end] = tickRange;
  const range = end - start;
  if (range <= 0 || end >= Infinity) return {};

  // Fill a map with an undefined value for each tick
  const valueMap: Record<Tick, R> = new Array(range)
    .fill(0)
    .reduce((acc, _, i) => ({ ...acc, [i]: undefined }), {});

  // Iterate over each clip
  const clipCount = clips.length;
  for (let i = 0; i < clipCount; i++) {
    // Ignore clips starting after the end tick
    const clip = clips[i];
    const clipStart = clip.tick;
    if (clipStart > end) continue;

    // Ignore clips ending before the start tick
    const duration = clip.duration || Infinity;
    const clipEnd = clip.tick + (duration || Infinity);
    if (clipEnd < start) continue;

    // Ignore clips that do not meet the stipulation
    if (!guard(clip)) continue;

    // Iterate over the tick range
    const rangeStart = Math.max(clipStart, start);
    const rangeEnd = Math.min(clipEnd, end);
    for (let j = rangeStart; j < rangeEnd; j++) {
      const value = map ? map(clip, j) : (clip as R);
      valueMap[j] = value;
    }
  }

  // Return the list of values
  return valueMap;
};

/** Get the list of clips based on the tick and optional stipulation,
 * sorted by proximity to the given tick. */
export const sortClipsByProximity = <T extends Clip, R = T>(
  clips: T[],
  tick: number,
  guard: (clip: T) => boolean = () => true,
  map: (clip: T, tick: number) => R = (clip) => clip as unknown as R
) => {
  const clipCount = clips.length;
  if (!clipCount) return [];

  // Iterate over each clip
  const values: R[] = [];
  for (let i = 0; i < clipCount; i++) {
    // Ignore clips starting after the end tick
    const clip = clips[i];
    const clipStart = clip.tick;
    if (clipStart > tick) continue;

    // Ignore clips ending before the start tick
    const duration = clip.duration ?? Infinity;
    const clipEnd = clip.tick + (duration ?? Infinity);
    if (clipEnd < tick) continue;

    // Ignore clips that do not meet the stipulation
    if (!guard(clip)) continue;

    // Otherwise, map the clip and push the value to the front of the array
    const value = map(clip, tick);
    values.unshift(value);
  }

  // Return the list of values
  return values;
};
