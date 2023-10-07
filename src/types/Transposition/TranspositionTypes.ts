import { nanoid } from "@reduxjs/toolkit";
import { TrackId } from "types/Track";
import { ID, Tick, Offset } from "types/units";

// Types
export type TranspositionId = ID;
export type TranspositionNoId = Omit<Transposition, "id">;
export type TranspositionMap = Record<TranspositionId, Transposition>;
export type TrackTranspositionRecord = Record<TrackId, Transposition[]>;

/**
 * A `Transposition` is a set of scalar offsets that are applied to a `Track`.
 * @property `id` - The ID of the transposition.
 * @property `trackId` - The ID of the track that the transposition is applied to.
 * @property `offsets` - The offsets of the transposition.
 * @property `tick` - The tick that the transposition starts at.
 * @property `duration` - Optional. The duration of the transposition. If undefined, the transposition is applied indefinitely.
 */
export type Transposition = {
  id: TranspositionId;
  trackId: TrackId;
  offsets: TranspositionOffsetRecord;
  tick: Tick;
  duration?: Tick;
};

// A transposition offset is contextualized by a track's scale or it is applied chromatically/chordally
export type OffsetId = TrackId | "_chromatic" | "_self";
export type TranspositionOffsetRecord = Record<OffsetId, Offset>;

/**
 * Initializes a `Transposition` with a unique ID.
 * @param pattern - Optional. `Partial<Transposition>` to override default values.
 * @returns An initialized `Transposition` with a unique ID.
 */
export const initializeTransposition = (
  transposition: Partial<TranspositionNoId> = defaultTransposition
) => ({
  ...defaultTransposition,
  ...transposition,
  id: nanoid(),
});

export const defaultTransposition: Transposition = {
  id: "default-transposition",
  trackId: "default-track",
  offsets: {},
  tick: 0,
};

export const mockTransposition: Transposition = {
  id: "mock-transposition",
  trackId: "mock-pattern-track",
  offsets: {
    _chromatic: 1,
    _self: 1,
    mock_track: 1,
  },
  tick: 0,
};

/**
 * Checks if a given object is of type `Transposition`.
 * @param obj The object to check.
 * @returns True if the object is a `Transposition`, otherwise false.
 */
export const isTransposition = (obj: unknown): obj is Transposition => {
  const candidate = obj as Transposition;
  return (
    candidate?.id !== undefined &&
    candidate?.trackId !== undefined &&
    candidate?.offsets !== undefined
  );
};

/**
 * Checks if a given object is of type `TranspositionMap`.
 * @param obj The object to check.
 * @returns True if the object is a `TranspositionMap`, otherwise false.
 */
export const isTranspositionMap = (obj: unknown): obj is TranspositionMap => {
  const candidate = obj as TranspositionMap;
  return (
    candidate !== undefined && Object.values(candidate).every(isTransposition)
  );
};
