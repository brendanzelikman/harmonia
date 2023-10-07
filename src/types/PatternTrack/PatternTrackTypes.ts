import { nanoid } from "@reduxjs/toolkit";
import { InstrumentId } from "../Instrument";
import {
  TrackId,
  TrackInterface,
  isTrackInterface,
} from "types/Track/TrackTypes";

// Types
export type PatternTrackType = "patternTrack";
export type PatternTrackNoId = Omit<PatternTrack, "id">;
export type PatternTrackMap = Record<TrackId, PatternTrack>;

/**
 * A `PatternTrack` is a kind of `Track` with its own instrument.
 * @property `id` - The unique ID of the track.
 * @property `parentId` - Optional. The ID of the parent track.
 * @property `name` - The name of the track.
 * @property `type` - The type of the track.
 * @property `collapsed` - Optional. Whether the track is collapsed.
 * @property `instrumentId` - The ID of the track's instrument.
 */
export interface PatternTrack extends TrackInterface {
  instrumentId: InstrumentId;
}

/**
 * Initializes a `PatternTrack` with a unique ID.
 * @param clip - Optional. `Partial<PatternTrack>` to override default values.
 * @returns An initialized `PatternTrack` with a unique ID.
 */
export const initializePatternTrack = (
  track: Partial<PatternTrackNoId> = defaultPatternTrack
): PatternTrack => ({ ...defaultPatternTrack, ...track, id: nanoid() });

export const defaultPatternTrack: PatternTrack = {
  id: "default-pattern-track",
  parentId: "default-scale-track",
  type: "patternTrack",
  name: "",
  instrumentId: "default-instrument",
};

export const mockPatternTrack: PatternTrack = {
  id: "mock-pattern-track",
  parentId: "mock-scale-track",
  type: "patternTrack",
  name: "Mock Pattern Track",
  instrumentId: "mock-instrument",
};

/**
 * Checks if a given object is of type `PatternTrack`.
 * @param obj The object to check.
 * @returns True if the object is a `PatternTrack`, otherwise false.
 */
export const isPatternTrack = (obj: unknown): obj is PatternTrack => {
  const candidate = obj as PatternTrack;
  return (
    isTrackInterface(candidate) &&
    candidate.type === "patternTrack" &&
    candidate.instrumentId !== undefined
  );
};

/**
 * Checks if a given object is of type `PatternTrackMap`.
 * @param obj The object to check.
 * @returns True if the object is a `PatternTrackMap`, otherwise false.
 */
export const isPatternTrackMap = (obj: unknown): obj is PatternTrackMap => {
  const candidate = obj as PatternTrackMap;
  return (
    candidate !== undefined && Object.values(candidate).every(isPatternTrack)
  );
};
