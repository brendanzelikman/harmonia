import { nanoid } from "@reduxjs/toolkit";
import { PatternBlock, PatternId, PatternStream } from "types/Pattern";
import { PoseBlock, PoseId, PoseStream } from "types/Pose";
import { TrackId } from "types/Track";
import { ID, Tick } from "types/units";
import { ClipColor } from "./ClipThemes";
import { isNumber, isPlainObject, isString } from "lodash";
import {
  NormalRecord,
  NormalState,
  createNormalState,
} from "utils/normalizedState";
import { isFiniteNumber, isOptionalType } from "types/util";

// ------------------------------------------------------------
// Clip Generics
// ------------------------------------------------------------

export type ClipNoId = Omit<Clip, "id">;
export type ClipPartial = Partial<Clip>;
export type ClipUpdate = Partial<Clip> & { id: ClipId };
export type ClipMap = NormalRecord<ClipId, Clip>;
export type ClipState = NormalState<ClipMap>;

// ------------------------------------------------------------
// Clip Definitions
// ------------------------------------------------------------

/** A `ClipInterface` contains any element placed in a track at a specific tick. */
export type ClipInterface = {
  id: ClipId;
  trackId: TrackId;
  tick: Tick;
  offset?: Tick;
  duration?: Tick;
  color?: ClipColor;
};

/** A `Clip` is either a `PatternClip` or a `PoseClip` */
export type Clip = PatternClip | PoseClip;
export type ClipId = PatternClipId | PoseClipId;
export type ClipBlock = PatternClipBlock | PoseClipBlock;
export type ClipStream = PatternClipStream | PoseClipStream;

// ------------------------------------------------------------
// Pattern Clip Definitions
// ------------------------------------------------------------

/** A `PatternClip` is a clip that references a pattern. */
export type PatternClip = ClipInterface & {
  id: PatternClipId;
  patternId: PatternId;
};
export type PatternClipId = `patternClip-${ID}`;
export type PatternClipStream = PatternStream;
export type PatternClipBlock = PatternBlock;

// ------------------------------------------------------------
// Pose Clip Definitions
// ------------------------------------------------------------

/** A `PoseClip` is a clip that references a pose. */
export type PoseClip = ClipInterface & { id: PoseClipId; poseId: PoseId };
export type PoseClipId = `poseClip-${ID}`;
export type PoseClipStream = PoseStream;
export type PoseClipBlock = PoseBlock;

// ------------------------------------------------------------
// Clip Initialization
// ------------------------------------------------------------

/** Create a pattern clip with a unique ID. */
export const initializePatternClip = (
  clip: Partial<PatternClip> = defaultPatternClip
): PatternClip => ({
  ...defaultPatternClip,
  ...clip,
  id: `patternClip-${nanoid()}`,
});

/** Create a pose clip with a unique ID. */
export const initializePoseClip = (
  clip: Partial<PoseClip> = defaultPoseClip
): PoseClip => ({
  ...defaultPoseClip,
  ...clip,
  id: `poseClip-${nanoid()}`,
});

/** Create a clip with a unique ID. */
export const initializeClip = (clip: ClipNoId = defaultClip): Clip =>
  "patternId" in clip
    ? initializePatternClip(clip as PatternClip)
    : initializePoseClip(clip as PoseClip);

/** The default clip is used for initialization. */
export const defaultClip: ClipNoId = {
  trackId: "default-track",
  tick: 0,
  offset: 0,
};

/** The default pattern clip is used for initialization. */
export const defaultPatternClip: PatternClip = {
  ...defaultClip,
  id: "patternClip-1",
  patternId: "new-pattern",
};

/** The default pose clip is used for initialization. */
export const defaultPoseClip: PoseClip = {
  ...defaultClip,
  id: "poseClip-1",
  poseId: "default-pose",
};

/** The default clip state is used for Redux. */
export const defaultClipState: ClipState = createNormalState<ClipMap>();

// ------------------------------------------------------------
// Clip Type Guards
// ------------------------------------------------------------

/** Checks if a given object is of type `Clip`. */
export const isClipInterface = (obj: unknown): obj is ClipInterface => {
  const candidate = obj as Clip;
  return (
    isPlainObject(candidate) &&
    isString(candidate.id) &&
    isString(candidate.trackId) &&
    isFiniteNumber(candidate.tick) &&
    isOptionalType(candidate.offset, isFiniteNumber) &&
    isOptionalType(candidate.duration, isNumber)
  );
};

/** Checks if a given object is of type `PatternClipId`. */
export const isPatternClipId = (obj: unknown): obj is PatternClipId => {
  const candidate = obj as PatternClipId;
  return isString(candidate) && candidate.startsWith("patternClip-");
};

/** Checks if a given object is of type `PatternClip`. */
export const isPatternClip = (obj: unknown): obj is PatternClip => {
  const candidate = obj as PatternClip;
  return isClipInterface(candidate) && isString(candidate.patternId);
};

/** Checks if a given object is of type `PoseClipId`. */
export const isPoseClipId = (obj: unknown): obj is PoseClipId => {
  const candidate = obj as PoseClipId;
  return isString(candidate) && candidate.startsWith("poseClip-");
};

/** Checks if a given object is of type `PoseClip`. */
export const isPoseClip = (obj: unknown): obj is PoseClip => {
  const candidate = obj as PoseClip;
  return isClipInterface(candidate) && isString(candidate.poseId);
};

/** Checks if a given object is of type `Clip`. */
export const isClip = (obj: unknown): obj is Clip => {
  return isPatternClip(obj) || isPoseClip(obj);
};
