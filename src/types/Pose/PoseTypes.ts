import { Dictionary, EntityState } from "@reduxjs/toolkit";
import { isNumber, isPlainObject, isString } from "lodash";
import { ChromaticPitchClass } from "assets/keys";
import { TrackId } from "types/Track/TrackTypes";
import { Id } from "types/units";
import { createId } from "types/util";
import {
  areObjectValuesTyped,
  isOptionalType,
  isTypedArray,
  NonEmpty,
} from "types/util";
import { isPitchClass } from "utils/pitchClass";
import { Vector } from "utils/vector";

// ------------------------------------------------------------
// Pose Generics
// ------------------------------------------------------------

export type PoseId = Id<"pose">;
export type PoseNoId = Omit<Pose, "id">;
export type PosePartial = Partial<Pose>;
export type PoseUpdate = PosePartial & { id: PoseId };
export type TrackPoseMap = Record<TrackId, Pose[]>;
export type PoseMap = Dictionary<Pose>;
export type PoseState = EntityState<Pose>;

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
export type VoiceLeading = NonEmpty<PoseVector, ChromaticPitchClass>;

/** A `PoseModule` can be infinite or have a finite, repeatable duration */
export interface PoseModule {
  duration?: number;
  repeat?: number;
  chain?: PoseVector;
}

/** A `PoseVectorModule` is a `PoseModule` with an extractable `PoseVector` */
export interface PoseVectorModule extends PoseModule {
  vector: PoseVector;
}

/** A `PoseStreamModule` is a `PoseModule` containing a nested `PoseStream` */
export interface PoseStreamModule extends PoseModule {
  stream: PoseStream;
}

/** A `PoseBlock` is either a `PoseVectorModule` or a `PoseStreamModule` */
export type PoseBlock = PoseVectorModule | PoseStreamModule;

/** A `PoseStream` is a sequence of recursive modules. */
export type PoseStream = Array<PoseBlock>;

/**
 * A `Pose` (or Transposition) contains a sequential list of vectors that are applied to a `Track`
 * at a specified tick for a given duration or continuously (if duration = Infinity or undefined).
 */
export type Pose = {
  id: PoseId;
  stream: PoseStream;
  name?: string;
  trackId?: TrackId;
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
  id: "pose_default",
  name: "New Pose",
  stream: [{ vector: {} }],
};

/** The mock pose is used for testing. */
export const mockPose: Pose = {
  id: "pose_mock",
  trackId: "pattern-track_1",
  stream: [
    {
      vector: { chromatic: 1, chordal: 1, "pattern-track_1": 1 },
      duration: 24,
    },
  ],
};

// ------------------------------------------------------------
// Pose Type Guards
// ------------------------------------------------------------

/** Checks if a given object is of type `PoseVector` */
export const isPoseVector = (obj: unknown): obj is PoseVector => {
  const candidate = obj as PoseVector;
  return isPlainObject(candidate) && areObjectValuesTyped(candidate, isNumber);
};

/** Returns true if the vector is a voice leading. */
export const isVoiceLeading = (obj?: unknown): obj is VoiceLeading => {
  if (!isPoseVector(obj)) return false;
  return Object.keys(obj).some((key) => isPitchClass(key) && key in obj);
};

/** Checks if a given object is of type `PoseModule` */
export const isPoseModule = (obj: unknown): obj is PoseModule => {
  const candidate = obj as PoseModule;
  return (
    isPlainObject(candidate) &&
    isOptionalType(candidate.duration, isNumber) &&
    isOptionalType(candidate.repeat, isNumber) &&
    isOptionalType(candidate.chain, isPoseVector)
  );
};

/** Checks if a given object is of type `PoseVectorModule` */
export const isPoseVectorModule = (obj: unknown): obj is PoseVectorModule => {
  const candidate = obj as PoseVectorModule;
  return isPoseModule(candidate) && isPoseVector(candidate.vector);
};

/** Checks if a given object is of type `PoseStreamModule` */
export const isPoseStreamModule = (obj: unknown): obj is PoseStreamModule => {
  const candidate = obj as PoseStreamModule;
  return isPoseModule(candidate) && isPoseStream(candidate.stream);
};

/** Checks if a given object is of type `PoseBlock` */
export const isPoseBlock = (obj: unknown): obj is PoseBlock => {
  const candidate = obj as PoseBlock;
  return isPoseVectorModule(candidate) || isPoseStreamModule(candidate);
};

/** Checks if a given object is of type `PoseStream` */
export const isPoseStream = (obj: unknown): obj is PoseStream => {
  const candidate = obj as PoseStream;
  return isTypedArray(candidate, isPoseBlock);
};

/** Checks if a given object is of type `Pose`. */
export const isPose = (obj: unknown): obj is Pose => {
  const candidate = obj as Pose;
  return (
    isPlainObject(candidate) &&
    isString(candidate.id) &&
    isPoseStream(candidate.stream) &&
    isOptionalType(candidate.name, isString)
  );
};

/** Checks if a given object is of type `PoseMap`. */
export const isPoseMap = (obj: unknown): obj is PoseMap => {
  const candidate = obj as PoseMap;
  return isPlainObject(candidate) && Object.values(candidate).every(isPose);
};
