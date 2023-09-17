import { nanoid } from "@reduxjs/toolkit";
import { defaultMixer, initializeMixer, Mixer, MixerId } from "./mixer";
import { ScaleId } from "./scale";
import { InstrumentKey } from "./instrument";

export type TrackId = string;
export type TrackType = "scaleTrack" | "patternTrack" | "defaultTrack";

// A scale track contains a scale id and a set of Transformations
// as well as a potentially nested trakc
export interface ScaleTrack {
  id: TrackId;
  name: string;
  scaleId: ScaleId;
  children: TrackId[];
}

export const defaultScaleTrack: ScaleTrack = {
  id: "default-scale-track",
  name: "",
  scaleId: "default-scale",
  children: [],
};

// A pattern track contains a pattern id, a set of clip ids, a set of Transformations,
// and an instrument name and mixer
export interface PatternTrack {
  id: TrackId;
  scaleTrackId: TrackId;
  mixerId: MixerId;

  name: string;
  instrument: InstrumentKey;
}

export const defaultPatternTrack: PatternTrack = {
  id: "default-pattern-track",
  scaleTrackId: "default-scale-track",
  mixerId: "default-mixer",
  name: "",
  instrument: "grand_piano",
};

export type Track = ScaleTrack | PatternTrack;
export const isScaleTrack = (track: Partial<Track>): track is ScaleTrack => {
  return (track as ScaleTrack).scaleId !== undefined;
};
export const isPatternTrack = (
  track: Partial<Track>
): track is PatternTrack => {
  return (track as PatternTrack).instrument !== undefined;
};

export type TrackNoId = Omit<Track, "id">;
export type ScaleTrackNoId = Omit<ScaleTrack, "id">;
export type PatternTrackNoId = Omit<PatternTrack, "id">;

export const initializeScaleTrack = (
  scaleTrack: ScaleTrackNoId
): ScaleTrack => {
  return {
    ...scaleTrack,
    id: nanoid(),
  };
};

export const initializePatternTrack = (
  patternTrack: PatternTrackNoId
): PatternTrack => {
  const id = nanoid();
  return {
    ...patternTrack,
    id,
  };
};
