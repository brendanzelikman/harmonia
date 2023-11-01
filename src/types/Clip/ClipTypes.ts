import { nanoid } from "@reduxjs/toolkit";
import { PatternId } from "types/Pattern";
import { TrackId } from "types/Track";
import { ID, Tick } from "types/units";
import { ClipColor } from "./ClipThemes";
import { isPlainObject, isString } from "lodash";
import {
  NormalRecord,
  NormalState,
  createNormalState,
} from "utils/normalizedState";
import { isFiniteNumber, isOptionalType } from "types/util";

// ------------------------------------------------------------
// Clip Generics
// ------------------------------------------------------------

export type ClipId = ID;
export type ClipNoId = Omit<Clip, "id">;
export type ClipPartial = Partial<Clip>;
export type ClipUpdate = Partial<Clip> & { id: ClipId };
export type ClipMap = NormalRecord<ClipId, Clip>;
export type ClipState = NormalState<ClipMap>;

// ------------------------------------------------------------
// Clip Definitions
// ------------------------------------------------------------

/**
 * A `Clip` is an instance of a `Pattern` that is played within a `Track`
 * at a specified tick for a given duration or until the end of the `Pattern`.
 */
export interface Clip {
  id: ClipId;
  patternId: PatternId;
  trackId: TrackId;

  tick: Tick;
  offset: Tick;
  duration?: Tick;

  color?: ClipColor;
}

// ------------------------------------------------------------
// Clip Initialization
// ------------------------------------------------------------

/** Create a clip with a unique ID. */
export const initializeClip = (
  clip: Partial<ClipNoId> = defaultClip
): Clip => ({ ...defaultClip, ...clip, id: nanoid() });

/** The default clip is used for initialization. */
export const defaultClip: Clip = {
  id: "default-clip",
  patternId: "default-pattern",
  trackId: "default-track",
  tick: 0,
  offset: 0,
};

/** The mock clip is used for testing. */
export const mockClip: Clip = {
  id: "mock-clip",
  patternId: "mock-pattern",
  trackId: "mock-pattern-track",
  tick: 12,
  offset: 3,
  duration: 2,
};

/** The default clip state is used for Redux. */
export const defaultClipState: ClipState = createNormalState<ClipMap>();

// ------------------------------------------------------------
// Clip Type Guards
// ------------------------------------------------------------

/** Checks if a given object is of type `Clip`. */
export const isClip = (obj: unknown): obj is Clip => {
  const candidate = obj as Clip;
  return (
    isPlainObject(candidate) &&
    isString(candidate.id) &&
    isString(candidate.patternId) &&
    isString(candidate.trackId) &&
    isFiniteNumber(candidate.tick) &&
    isFiniteNumber(candidate.offset) &&
    isOptionalType(candidate.duration, isFiniteNumber)
  );
};
