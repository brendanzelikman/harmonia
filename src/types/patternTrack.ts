import { nanoid } from "@reduxjs/toolkit";
import { InstrumentKey } from "./instrument";
import { MixerId } from "./mixer";
import { TrackInterface } from "./tracks";

export interface PatternTrack extends TrackInterface {
  mixerId: MixerId;
  instrument: InstrumentKey;
}

export const defaultPatternTrack: PatternTrack = {
  id: "default-pattern-track",
  parentId: "default-scale-track",
  type: "patternTrack",
  mixerId: "default-mixer",
  name: "",
  instrument: "grand_piano",
};

type PatternTrackNoId = Omit<PatternTrack, "id">;
export const initializePatternTrack = (
  track: PatternTrackNoId
): PatternTrack => {
  return { ...track, id: nanoid() };
};

export const isPatternTrack = (track: unknown): track is PatternTrack => {
  return (
    (track as PatternTrack)?.instrument !== undefined &&
    (track as PatternTrack)?.mixerId !== undefined
  );
};

export type PatternTrackMap = Record<string, PatternTrack>;
