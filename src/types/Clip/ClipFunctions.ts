import {
  PatternClip,
  PoseClip,
  ClipUpdate,
  isClip,
  Clip,
  ClipStream,
  isPatternClip,
  isPoseClip,
  ClipId,
} from "./ClipTypes";
import {
  ClipTheme,
  DEFAULT_CLIP_THEME,
  DEFAULT_CLIP_COLOR,
  CLIP_THEMES,
} from "./ClipThemes";
import {
  Pose,
  PoseId,
  getPoseStreamDuration,
  getPoseVectorAtIndex,
  isPoseStream,
  sumPoseVectors,
} from "types/Pose";
import { getPatternStreamDuration, isPatternStream } from "types/Pattern";
import { TrackId } from "types/Track";
import { Tick } from "types/units";
import { isFiniteNumber } from "types/util";

// ------------------------------------------------------------
// Clip Serializers
// ------------------------------------------------------------

/** Get a `Clip` as a string. */
export const getClipAsString = (clip: Clip) => {
  const { id, trackId, tick, offset, duration, color } = clip;
  return `${id},${trackId},${tick},${offset},${duration},${color}`;
};

/** Get a `PatternClip` as a string. */
export const getPatternClipAsString = (clip: PatternClip) => {
  const { patternId } = clip;
  return `${getClipAsString(clip)},${patternId}`;
};

/** Get a `PoseClip` as a string. */
export const getPoseClipAsString = (clip: PoseClip) => {
  const { poseId } = clip;
  return `${getClipAsString(clip)},${poseId}`;
};

/** Get a `ClipUpdate` as a string. */
export const getClipUpdateAsString = (clip: ClipUpdate) => {
  return JSON.stringify(clip);
};

// ------------------------------------------------------------
// Clip Helpers
// ------------------------------------------------------------

/** Reduce an array of clips to a track clip map. */
export const getClipsByTrack = (clips: Clip[]) => {
  if (!clips?.length) return {};
  return clips.reduce((acc, clip) => {
    if (!acc[clip.trackId]) acc[clip.trackId] = [];
    acc[clip.trackId].push(clip.id);
    return acc;
  }, {} as Record<TrackId, ClipId[]>);
};

// ------------------------------------------------------------
// Clip Properties
// ------------------------------------------------------------

/** Get the theme of a `Clip`. */
export const getClipTheme = (clip?: Clip): ClipTheme => {
  if (!isClip(clip)) return DEFAULT_CLIP_THEME;
  const color = clip.color ?? DEFAULT_CLIP_COLOR;
  return CLIP_THEMES[color] ?? DEFAULT_CLIP_THEME;
};

/** Get the offset of a `Clip`. */
export const getClipOffset = (clip?: Clip): number => {
  return isClip(clip) ? clip.offset ?? 0 : 0;
};

/** Get the duration of a `ClipStream`. */
export const getClipStreamDuration = (stream: ClipStream): number => {
  if (isPatternStream(stream)) return getPatternStreamDuration(stream);
  if (isPoseStream(stream)) return getPoseStreamDuration(stream);
  return 1;
};

/** Get the total duration of a `Clip` using its field or the duration of the stream provided. */
export const getClipDuration = (clip?: Clip, stream?: ClipStream) => {
  if (!isClip(clip)) return 1;

  // If the clip has a duration, return it
  if (clip.duration !== undefined) return clip.duration ?? 1;

  // Otherwise, return the stream's duration
  if (!stream) return 1;
  const streamDuration = getClipStreamDuration(stream);
  const streamOffset = getClipOffset(clip);
  return Math.max(streamDuration - streamOffset, 1);
};

// -------------------------------------------- ----------------
// Pattern Clip Functions
// ------------------------------------------------------------

/** Get the `PatternClips` from a list of clips. */
export const getPatternClips = (clips: Clip[]): PatternClip[] => {
  return clips.filter(isPatternClip);
};

/** Get the `PatternClips` of a given track from a list of clips. */
export const getPatternClipsByTrackId = (
  clips: Clip[],
  trackId: TrackId
): PatternClip[] => {
  return getPatternClips(clips).filter((clip) => clip.trackId === trackId);
};

// -------------------------------------------- ----------------
// Pose Clip Functions
// ------------------------------------------------------------

/** Get the `PoseClips` from a list of `Clips` */
export const getPoseClips = (clips: Clip[]): PoseClip[] => {
  return clips.filter(isPoseClip);
};

/** Get the `PoseClips` of a given track from a list of clips. */
export const getPoseClipsByTrackId = (
  clips: Clip[],
  trackId: TrackId
): PoseClip[] => {
  return getPoseClips(clips).filter((clip) => clip.trackId === trackId);
};

/** Get the current pose vector occurring at the given tick. */
export const getPoseVectorAtTick = (
  clip?: PoseClip,
  pose?: Pose,
  tick?: number
) => {
  if (!clip || !pose || tick === undefined) return {};
  return getPoseVectorAtIndex(pose.stream, tick - clip.tick);
};

/** Get the current pose occurring at or before the given tick. */
export const getCurrentPoseClipVector = (
  poseClips: PoseClip[],
  poseMap?: Record<PoseId, Pose>,
  tick: Tick = 0,
  sort = true
) => {
  const clipCount = poseClips.length;
  if (!clipCount || !poseMap) return undefined;

  let offset = {};
  let champClip: PoseClip | undefined;
  let champPose: Pose | undefined;
  let champTick = -Infinity;

  for (let i = 0; i < clipCount; i++) {
    // Ignore clips after the tick
    const clip = poseClips[i];
    if (clip.tick > tick) continue;

    // Ignore clips with no pose
    const pose = poseMap[clip.poseId];
    if (!pose) continue;

    // If the clip is infinite, add it to the offset
    const isInfinite = !isFiniteNumber(clip.duration);
    if (isInfinite) {
      const poseVector = getPoseVectorAtTick(clip, pose, tick);
      offset = sumPoseVectors(offset, poseVector);
      continue;
    }

    // Otherwise, make sure the clip does not end before the tick
    const clipEnd = clip.tick + (clip.duration ?? 0);
    if (clipEnd < tick) continue;

    // Update the champ if the clip is the best match
    if (clip.tick > champTick) {
      champClip = clip;
      champPose = pose;
      champTick = clip.tick;
    }
  }

  // If no champ was found, return the offset
  if (!champClip || !champPose) return offset;

  // Otherwise, get the pose vector at the tick and sum it with the offset
  const champVector = getPoseVectorAtTick(champClip, champPose, tick);
  return sumPoseVectors(offset, champVector);
};
