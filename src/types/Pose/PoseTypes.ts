import { nanoid } from "@reduxjs/toolkit";
import { isNumber, isPlainObject, isString } from "lodash";
import { TrackId } from "types/Track";
import { ID, Stream } from "types/units";
import { areObjectValuesTyped, isOptionalType, isTypedArray } from "types/util";
import {
  NormalRecord,
  NormalState,
  createNormalState,
} from "utils/normalizedState";
import { createUndoableHistory } from "utils/undoableHistory";

// ------------------------------------------------------------
// Pose Generics
// ------------------------------------------------------------

export type PoseId = ID;
export type PoseNoId = Omit<Pose, "id">;
export type PosePartial = Partial<Pose>;
export type PoseUpdate = PosePartial & { id: PoseId };
export type TrackPoseMap = Record<TrackId, Pose[]>;
export type PoseMap = NormalRecord<PoseId, Pose>;
export type PoseState = NormalState<PoseMap>;

// ------------------------------------------------------------
// Pose Definitions
// ------------------------------------------------------------

/** A `PoseVector` contains a list of offsets applied to a note. */
export type PoseVector = Record<PoseVectorId, number>;
export type PoseVectorId = TrackId | "chromatic" | "chordal";

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
export type PoseStream = Stream<PoseBlock>;

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

// ------------------------------------------------------------
// Pose Initialization
// ------------------------------------------------------------

/** Create a pose with a unique ID. */
export const initializePose = (
  pose: Partial<PoseNoId> = defaultPose
): Pose => ({
  ...defaultPose,
  ...pose,
  id: nanoid(),
});

/** The default pose is used for initialization. */
export const defaultPose: Pose = {
  id: "default-pose",
  name: "New Pose",
  stream: [{ vector: {} }],
};

/** The mock pose is used for testing. */
export const mockPose: Pose = {
  id: "mock-pose",
  trackId: "mock-pattern-track",
  stream: [
    {
      vector: { chromatic: 1, chordal: 1, mock_track: 1 },
      duration: 24,
    },
  ],
};

/** The default pose state is used for Redux. */
export const defaultPoseState: PoseState = createNormalState<PoseMap>([
  defaultPose,
]);

/** The undoable pose history is used for Redux. */
export const defaultPoseHistory =
  createUndoableHistory<PoseState>(defaultPoseState);

// ------------------------------------------------------------
// Pose Type Guards
// ------------------------------------------------------------

/** Checks if a given object is of type `PoseVector` */
export const isPoseVector = (obj: unknown): obj is PoseVector => {
  const candidate = obj as PoseVector;
  return isPlainObject(candidate) && areObjectValuesTyped(candidate, isNumber);
};

/** Checks if a given object is of type `PoseModule` */
export const isPoseModule = (obj: unknown): obj is PoseModule => {
  const candidate = obj as PoseModule;
  return (
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
