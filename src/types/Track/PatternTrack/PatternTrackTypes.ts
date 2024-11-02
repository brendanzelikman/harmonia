import { isTrackInterface, ITrack, ITrackId } from "../TrackTypes";
import { Dictionary, EntityState, nanoid } from "@reduxjs/toolkit";
import { isString } from "lodash";
import { createId } from "types/util";

// ------------------------------------------------------------
// Pattern Track Definitions
// ------------------------------------------------------------

export type PatternTrack = ITrack<"pattern">;
export type PatternTrackId = ITrackId<"pattern">;
export type PatternTrackNoId = Omit<PatternTrack, "id">;
export type PatternTrackMap = Dictionary<PatternTrack>;
export type PatternTrackState = EntityState<PatternTrack>;

/** Create a pattern track with a unique ID. */
export const initializePatternTrack = (
  track: Partial<PatternTrackNoId> = defaultPatternTrack
): PatternTrack => ({
  ...defaultPatternTrack,
  ...track,
  id: createId(`pattern-track`),
});

/** The default pattern track is used for initialization. */
export const defaultPatternTrack: PatternTrack = {
  type: "pattern",
  id: createId(`pattern-track`),
  instrumentId: "default-instrument",
  trackIds: [],
};

/** Checks if a given object is of type `PatternTrackId`. */
export const isPatternTrackId = (obj: unknown): obj is PatternTrackId => {
  const candidate = obj as PatternTrackId;
  return isString(candidate) && candidate[0] === `p`;
};

/** Checks if a given object is of type `PatternTrack`. */
export const isIPatternTrack = (obj: unknown): obj is PatternTrack => {
  const candidate = obj as PatternTrack;
  return (
    isTrackInterface(candidate) &&
    isPatternTrackId(candidate.id) &&
    isString(candidate.instrumentId)
  );
};
