import { EntityState } from "@reduxjs/toolkit";
import { ChromaticPitchClass } from "assets/keys";
import { TrackId } from "types/Track/TrackTypes";
import { Id } from "types/units";
import { createId, isObject, isString } from "types/utils";
import { isPitchClass } from "utils/pitch";
import { Vector } from "utils/vector";
import {
  TRANSFORMATIONS,
  Transformation,
} from "types/Pattern/PatternTransformers";
import { ScaleNote } from "types/Scale/ScaleTypes";

// ------------------------------------------------------------
// Pose Generics
// ------------------------------------------------------------

export type PoseId = Id<"pose">;
export type PoseNoId = Omit<Pose, "id">;
export type PosePartial = Partial<Pose>;
export type PoseUpdate = PosePartial & { id: PoseId };
export type TrackPoseMap = Record<TrackId, Pose[]>;
export type PoseMap = Record<PoseId, Pose>;
export type PoseState = EntityState<Pose, PoseId>;

// ------------------------------------------------------------
// Pose Definitions
// ------------------------------------------------------------

/** A `PoseVector` contains a list of offsets applied by track ID. */
export type PoseVector = Vector<PoseVectorId>;
export type PoseVectorId =
  | TrackId
  | ChromaticPitchClass
  | "chromatic"
  | "chordal"
  | "octave";

/** A `VoiceLeading` has at least one pitch class offset. */
export type VoiceLeading = PoseVector;

/** A `PoseModule` can be infinite or have a finite, repeatable duration */
export interface PoseModule {
  vector?: PoseVector;
  scale?: ScaleNote[];
  duration?: number;
  customDuration?: string;
  repeat?: number;
  chain?: PoseVector;
}

/** A `PoseOperation` has a vector and possible set of musical operations. */
export type PoseOperation = PoseModule &
  Partial<{
    operations: Array<PoseTransformation>;
    scripts: string[];
  }>;

/** A `PoseTransformation` is a musical operation with arguments. */
export type PoseTransformation<T extends Transformation = Transformation> = {
  id: T;
  args: (typeof TRANSFORMATIONS)[T]["args"];
};

/** A `PoseStreamModule` is a `PoseModule` containing a nested `PoseStream` */
export interface PoseNestedStream extends PoseModule {
  stream: PoseStream;
}

/** A `PoseBlock` is either a `PoseVectorModule` or a `PoseStreamModule` */
export type PoseBlock = PoseOperation | PoseNestedStream;

/** A `PoseStream` is a sequence of recursive modules. */
export type PoseStream = Array<PoseBlock>;

/**
 * A `Pose` (or Transposition) contains a vector or list of vectors that are applied to a `Track`
 * at a specified tick for a given duration or continuously (if duration = Infinity or undefined).
 */
export type Pose = {
  id: PoseId;
  vector?: PoseVector;
  scale?: ScaleNote[];
  reset?: boolean;
  operations?: Array<PoseTransformation>;
  stream?: PoseStream;
  name?: string;
};

/** A `PresetPose` has its id prefixed */
export type PresetPose = Pose & { id: `preset-${string}` };

// ------------------------------------------------------------
// Pose Initialization
// ------------------------------------------------------------

/** Create a pose with a unique ID. */
export const initializePose = (
  pose: Partial<PoseNoId> = defaultPose
): Pose => ({
  ...defaultPose,
  ...pose,
  id: createId("pose"),
});

/** The default pose is used for initialization. */
export const defaultPose: Pose = {
  id: createId("pose"),
  name: "Pose 1",
};

// ------------------------------------------------------------
// Pose Type Guards
// ------------------------------------------------------------

/** Checks if a given object is of type `PoseVector` */
export const isPoseVector = (obj: unknown): obj is PoseVector => {
  if (obj === undefined) return false;
  const candidate = obj as PoseVector;
  return isObject(candidate);
};

/** Returns true if the vector is a voice leading. */
export const isVoiceLeading = (
  obj: Record<any, any> = {}
): obj is VoiceLeading => {
  return Object.keys(obj).some((key) => isPitchClass(key));
};

/** Checks if a given object is of type `PoseModule` */
export const isPoseModule = (obj: unknown): obj is PoseModule => {
  if (obj === undefined) return false;
  const candidate = obj as PoseModule;
  return isObject(candidate);
};

/** Checks if a given object is of type `PoseVectorModule` */
export const isPoseOperation = (obj: unknown): obj is PoseOperation => {
  if (obj === undefined) return false;
  const candidate = obj as PoseOperation;
  return isPoseModule(candidate);
};

/** Checks if a given object is of type `PoseStreamModule` */
export const isPoseStreamModule = (obj: unknown): obj is PoseNestedStream => {
  if (obj === undefined) return false;
  const candidate = obj as PoseNestedStream;
  return isPoseModule(candidate) && "stream" in candidate;
};

/** Checks if a given object is of type `PoseBlock` */
export const isPoseBlock = (obj: unknown): obj is PoseBlock => {
  if (obj === undefined) return false;
  const candidate = obj as PoseBlock;
  return isPoseOperation(candidate) || isPoseStreamModule(candidate);
};

/** Checks if a given object is of type `PoseStream` */
export const isPoseStream = (obj: unknown): obj is PoseStream => {
  const candidate = obj as PoseStream;
  return Array.isArray(candidate);
};

/** Checks if a given object is of type `Pose`. */
export const isPose = (obj: unknown): obj is Pose => {
  const candidate = obj as Pose;
  return isObject(candidate) && isPoseId(candidate.id);
};

/** Checks if a given object is of type `PoseMap`. */
export const isPoseMap = (obj: unknown): obj is PoseMap => {
  const candidate = obj as PoseMap;
  return isObject(candidate) && Object.values(candidate).every(isPose);
};

/** Checks if a given object is of type `PoseId`. */
export const isPoseId = (obj: unknown): obj is PoseId => {
  return isString(obj) && obj.startsWith("pose");
};
