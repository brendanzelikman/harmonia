import { Update } from "types/units";
import {
  PatternClip,
  PoseClip,
  Clip,
  ClipId,
  isPatternClipId,
  isPoseClipId,
  PatternClipId,
  PoseClipId,
  IClip,
  PatternClipMap,
  PoseClipMap,
  ClipMap,
  ClipUpdate,
  PatternClipUpdate,
  PoseClipUpdate,
  isPatternClip,
  isPoseClip,
  IClipId,
  IClipMap,
} from "./ClipTypes";
import { ClipType } from "./ClipTypes";
import { TrackId } from "types/Track/TrackTypes";

// ------------------------------------------------------------
// Clip Type Helpers
// ------------------------------------------------------------

export type ClipsByType = { [T in ClipType]: IClip<T>[] };
export type ClipsByTrack = Record<TrackId, ClipsByType>;

/** Convert an array of clips to a record of clips by type */
export const getClipsByType = (clips: Clip[]): ClipsByType => {
  const pattern: PatternClip[] = [];
  const pose: PoseClip[] = [];

  for (const clip of clips) {
    if (isPatternClip(clip)) pattern.push(clip);
    else if (isPoseClip(clip)) pose.push(clip);
  }

  return { pattern, pose };
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

  for (const clip of clips) {
    if (clip.id.startsWith("pattern")) pattern.push(clip as PatternClipUpdate);
    else if (clip.id.startsWith("pose")) pose.push(clip as PoseClipUpdate);
  }

  return { pattern, pose };
};

// ------------------------------------------------------------
// Clip Id Type Helpers
// ------------------------------------------------------------
export type ClipIdsByType = { [T in ClipType]: IClipId<T>[] };

export const getClipIdsByType = (clips: ClipId[]): ClipIdsByType => {
  const pattern: PatternClipId[] = [];
  const pose: PoseClipId[] = [];

  const clipCount = clips.length;
  for (let i = 0; i < clipCount; i++) {
    const id = clips[i];
    if (isPatternClipId(id)) pattern.push(id);
    else if (isPoseClipId(id)) pose.push(id);
  }

  return { pattern, pose };
};

// ------------------------------------------------------------
// Clip Map Type Helpers
// ------------------------------------------------------------

export type ClipMapsByType = { [T in ClipType]: IClipMap<T> };

/** Convert a ClipMap to a record of maps by type */
export const getClipMapsByType = (clips: ClipMap): ClipMapsByType => {
  const pattern: PatternClipMap = {};
  const pose: PoseClipMap = {};

  const clipIds = Object.keys(clips) as ClipId[];
  const clipCount = clipIds.length;
  for (let i = 0; i < clipCount; i++) {
    const clip = clips[clipIds[i]];
    if (!clip) continue;
    if (clip.type === "pattern") pattern[clip.id] = clip;
    else if (clip.type === "pose") pose[clip.id] = clip;
  }

  return { pattern, pose };
};
