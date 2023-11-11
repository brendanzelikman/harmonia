import { nanoid } from "@reduxjs/toolkit";
import { isNumber, isPlainObject, isString, isUndefined } from "lodash";
import { TrackId } from "types/Track";
import { ID, Tick } from "types/units";
import {
  NormalRecord,
  NormalState,
  createNormalState,
} from "utils/normalizedState";

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

/** A pose vector is contextualized by a track. */
export type PoseVectorId = TrackId | "chromatic" | "chordal";

/** A pose vector contains all of a pose's offsets. */
export type PoseVector = Record<PoseVectorId, number>;

/**
 * A `Pose` (or Transposition) contains a vector of scalar offsets that are applied to a `Track`
 * at a specified tick for a given duration or continuously (if duration = Infinity or undefined).
 */
export type Pose = {
  id: PoseId;
  trackId: TrackId;
  tick: Tick;
  vector: PoseVector;
  duration?: Tick;
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
  trackId: "default-track",
  vector: {},
  tick: 0,
};

/** The mock pose is used for testing. */
export const mockPose: Pose = {
  id: "mock-pose",
  trackId: "mock-pattern-track",
  vector: {
    chromatic: 1,
    chordal: 1,
    mock_track: 1,
  },
  tick: 0,
};

/** The default pose state is used for Redux. */
export const defaultPoseState: PoseState = createNormalState<PoseMap>();

// ------------------------------------------------------------
// Pose Type Guards
// ------------------------------------------------------------

/** Checks if a given object is of type `PoseVector` */
export const isPoseVector = (obj: unknown): obj is PoseVector => {
  const candidate = obj as PoseVector;
  return isPlainObject(candidate) && Object.values(candidate).every(isNumber);
};

/** Checks if a given object is of type `Pose`. */
export const isPose = (obj: unknown): obj is Pose => {
  const candidate = obj as Pose;
  return (
    isPlainObject(candidate) &&
    isString(candidate.id) &&
    isString(candidate.trackId) &&
    isNumber(candidate.tick) &&
    isFinite(candidate.tick) &&
    (isUndefined(candidate.duration) || isNumber(candidate.duration)) &&
    isPoseVector(candidate.vector)
  );
};

/** Checks if a given object is of type `PoseMap`. */
export const isPoseMap = (obj: unknown): obj is PoseMap => {
  const candidate = obj as PoseMap;
  return isPlainObject(candidate) && Object.values(candidate).every(isPose);
};
