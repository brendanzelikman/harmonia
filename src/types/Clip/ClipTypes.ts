import { Id, Tick, Update } from "types/units";
import { PatternClipColor } from "./PatternClip/PatternClipThemes";
import { isPlainObject, isString } from "lodash";
import { isFiniteNumber } from "types/util";
import { PatternClip, PatternClipId } from "./PatternClip/PatternClipTypes";
import { PoseClip, PoseClipId } from "./PoseClip/PoseClipTypes";
import { initializePatternClip } from "./PatternClip/PatternClipTypes";
import { initializePoseClip } from "./PoseClip/PoseClipTypes";
import { Dictionary, EntityState } from "@reduxjs/toolkit";
import { PatternId } from "types/Pattern/PatternTypes";
import { PoseId } from "types/Pose/PoseTypes";
import { ScaleId } from "types/Scale/ScaleTypes";
import { TrackId } from "types/Track/TrackTypes";
import { IPortaled, Portaled } from "types/Portal/PortalTypes";

export * from "./PatternClip/PatternClipTypes";
export * from "./PoseClip/PoseClipTypes";

// ------------------------------------------------------------
// Motif Definitions
// ------------------------------------------------------------

export const CLIP_TYPES = ["pattern", "pose"] as const;
export type ClipType = (typeof CLIP_TYPES)[number];

export type Clip = PatternClip | PoseClip;
export type ClipId = PatternClipId | PoseClipId;

export type ClipUpdate = Update<Clip>;
export type ClipMap = Dictionary<Clip>;
export type ClipState = {
  pattern: EntityState<PatternClip>;
  pose: EntityState<PoseClip>;
};
export type PortaledClip = Portaled<Clip>;
export type PortaledClipId = PortaledClip["id"];

// ------------------------------------------------------------
// Generic Clip Definitions
// ------------------------------------------------------------

/** A `Clip` contains any element placed in a track at a specific tick. */
export type IClip<T extends ClipType = ClipType> = {
  id: IClipId<T>;
  trackId: TrackId;
  tick: Tick;
  type: T;
  offset?: Tick;
  duration?: Tick;
  isOpen?: boolean;
} & IClipProps<T>;

/** A `Clip` can have extra props based on its type. */
export type IClipProps<T extends ClipType> = T extends "pattern"
  ? { patternId: PatternId; color?: PatternClipColor }
  : T extends "pose"
  ? { poseId: PoseId }
  : T extends "scale"
  ? { scaleId: ScaleId }
  : never;

export type IClipId<T extends ClipType = ClipType> = Id<`${T}-clip`>;
export type IClipUpdate<T extends ClipType = ClipType> = Update<IClip<T>>;
export type IClipMap<T extends ClipType = ClipType> = Dictionary<IClip<T>>;
export type IClipState<T extends ClipType = ClipType> = EntityState<IClip<T>>;
export type IPortaledClip<T extends ClipType = ClipType> = IPortaled<T>;
export type IPortaledClipId<T extends ClipType = ClipType> =
  IPortaledClip<T>["id"];

// ------------------------------------------------------------
// Clip Initialization
// ------------------------------------------------------------

/** Create a clip with a unique ID. */
export function initializeClip<T extends ClipType>(
  clip: Partial<IClip<T>>
): Clip {
  if (clip.type === "pattern")
    return initializePatternClip(clip as Partial<PatternClip>);
  else if (clip.type === "pose")
    return initializePoseClip(clip as Partial<PoseClip>);
  else throw new Error(`Invalid clip type: ${clip.type}`);
}

// ------------------------------------------------------------
// Clip Type Guards
// ------------------------------------------------------------

/** Checks if a given object is a `ClipType` */
export const isClipType = <T extends ClipType = ClipType>(
  obj: unknown
): obj is T => {
  return CLIP_TYPES.includes(obj as T);
};

export const areClipTypesEqual = (a: ClipType, b: ClipType) => a === b;

/** Checks if a given object is a `ClipId` */
export const isClipId = <T extends ClipType = ClipType>(
  obj: unknown,
  type?: T
): obj is IClipId<T> => {
  if (!type) return isString(obj);
  return isString(obj) && obj.startsWith(`${type}-clip`);
};

/** Checks if a given object is of type `ClipInterface`. */
export const isClipInterface = <T extends ClipType>(
  obj: unknown,
  type?: T
): obj is IClip<T> => {
  const candidate = obj as IClip<T>;
  return (
    isPlainObject(candidate) &&
    isString(candidate.id) &&
    isString(candidate.trackId) &&
    isFiniteNumber(candidate.tick) &&
    isClipId(candidate.id, type) &&
    (type !== undefined
      ? isClipType(candidate.type) && candidate.type === type
      : true)
  );
};
