import { nanoid } from "@reduxjs/toolkit";
import { InstrumentId } from "../Instrument";
import { TrackId, TrackInterface } from "types/Track/TrackTypes";
import { isPlainObject, isString } from "lodash";
import {
  NormalRecord,
  NormalState,
  createNormalState,
} from "utils/normalizedState";

// ------------------------------------------------------------
// Pattern Track Generics
// ------------------------------------------------------------

export type PatternTrackType = "patternTrack";
export type PatternTrackNoId = Omit<PatternTrack, "id">;
export type PatternTrackPartial = Partial<PatternTrack>;
export type PatternTrackUpdate = Partial<PatternTrack> & { id: TrackId };
export type PatternTrackMap = NormalRecord<TrackId, PatternTrack>;
export type PatternTrackState = NormalState<PatternTrackMap>;

// ------------------------------------------------------------
// Pattern Track Definitions
// ------------------------------------------------------------

/** A `PatternTrack` is a `Track` with its own instrument. */
export interface PatternTrack extends TrackInterface {
  type: "patternTrack";
  instrumentId: InstrumentId;
}

// ------------------------------------------------------------
// Pattern Track Initialization
// ------------------------------------------------------------

/** Create a pattern track with a unique ID. */
export const initializePatternTrack = (
  track: Partial<PatternTrackNoId> = defaultPatternTrack
): PatternTrack => ({
  ...defaultPatternTrack,
  ...track,
  type: "patternTrack",
  id: nanoid(),
});

/** The default pattern track is used for initialization. */
export const defaultPatternTrack: PatternTrack = {
  id: "default-pattern-track",
  parentId: "default-scale-track",
  type: "patternTrack",
  name: "",
  instrumentId: "default-instrument",
};

/** The mock pattern track is used for testing. */
export const mockPatternTrack: PatternTrack = {
  id: "mock-pattern-track",
  parentId: "mock-scale-track",
  type: "patternTrack",
  name: "Mock Pattern Track",
  instrumentId: "mock-instrument",
};

/** The default pattern track state is used for Redux. */
export const defaultPatternTrackState: PatternTrackState =
  createNormalState<PatternTrackMap>([defaultPatternTrack]);

// ------------------------------------------------------------
// Pattern Track Type Guards
// ------------------------------------------------------------

/** Checks if a given object is of type `PatternTrack`. */
export const isPatternTrack = (obj: unknown): obj is PatternTrack => {
  const candidate = obj as PatternTrack;
  return (
    isPlainObject(candidate) &&
    isString(candidate.id) &&
    candidate.type === "patternTrack" &&
    isString(candidate.instrumentId)
  );
};

/** Checks if a given object is of type `PatternTrackMap`. */
export const isPatternTrackMap = (obj: unknown): obj is PatternTrackMap => {
  const candidate = obj as PatternTrackMap;
  return (
    isPlainObject(candidate) && Object.values(candidate).every(isPatternTrack)
  );
};
