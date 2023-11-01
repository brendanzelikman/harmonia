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
// Transposition Generics
// ------------------------------------------------------------

export type TranspositionId = ID;
export type TranspositionNoId = Omit<Transposition, "id">;
export type TranspositionPartial = Partial<Transposition>;
export type TranspositionUpdate = TranspositionPartial & { id: ID };
export type TrackTranspositionMap = Record<TrackId, Transposition[]>;
export type TranspositionMap = NormalRecord<TranspositionId, Transposition>;
export type TranspositionState = NormalState<TranspositionMap>;

// ------------------------------------------------------------
// Transposition Definitions
// ------------------------------------------------------------

/** A transposition vector is contextualized by a track. */
export type TranspositionVectorId = TrackId | "chromatic" | "chordal";

/** A transposition vector contains all of a transposition's offsets. */
export type TranspositionVector = Record<TranspositionVectorId, number>;

/**
 * A `Transposition` contains a vector of scalar offsets that are applied to a `Track`
 * at a specified tick for a given duration or continuously (if duration = 0 or undefined).
 */
export type Transposition = {
  id: TranspositionId;
  trackId: TrackId;
  tick: Tick;
  vector: TranspositionVector;
  duration?: Tick;
};
export type Pose = Transposition;

// ------------------------------------------------------------
// Transposition Initialization
// ------------------------------------------------------------

/** Create a transposition with a unique ID. */
export const initializeTransposition = (
  transposition: Partial<TranspositionNoId> = defaultTransposition
): Transposition => ({
  ...defaultTransposition,
  ...transposition,
  id: nanoid(),
});
export const initializePose = initializeTransposition;

/** The default transposition is used for initialization. */
export const defaultTransposition: Transposition = {
  id: "default-transposition",
  trackId: "default-track",
  vector: {},
  tick: 0,
};
export const defaultPose = defaultTransposition;

/** The mock transposition is used for testing. */
export const mockTransposition: Transposition = {
  id: "mock-transposition",
  trackId: "mock-pattern-track",
  vector: {
    chromatic: 1,
    chordal: 1,
    mock_track: 1,
  },
  tick: 0,
};
export const mockPose = mockTransposition;

/** The default transposition state is used for Redux. */
export const defaultTranspositionState: TranspositionState =
  createNormalState<TranspositionMap>();

// ------------------------------------------------------------
// Transposition Type Guards
// ------------------------------------------------------------

/** Checks if a given object is of type `TranspositionVector` */
export const isTranspositionVector = (
  obj: unknown
): obj is TranspositionVector => {
  const candidate = obj as TranspositionVector;
  return isPlainObject(candidate) && Object.values(candidate).every(isNumber);
};

/** Checks if a given object is of type `Transposition`. */
export const isTransposition = (obj: unknown): obj is Transposition => {
  const candidate = obj as Transposition;
  return (
    isPlainObject(candidate) &&
    isString(candidate.id) &&
    isString(candidate.trackId) &&
    isNumber(candidate.tick) &&
    isFinite(candidate.tick) &&
    (isUndefined(candidate.duration) || isNumber(candidate.duration)) &&
    isTranspositionVector(candidate.vector)
  );
};

/** Checks if a given object is of type `TranspositionMap`. */
export const isTranspositionMap = (obj: unknown): obj is TranspositionMap => {
  const candidate = obj as TranspositionMap;
  return (
    isPlainObject(candidate) && Object.values(candidate).every(isTransposition)
  );
};
