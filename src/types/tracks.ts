import { nanoid } from "@reduxjs/toolkit";
import { defaultMixer, Mixer } from "./mixer";
import { ScaleId } from "./scales";

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
  id: "scale-track-1",
  name: "",
  scaleId: "scale-1",
  children: [],
};

// A pattern track contains a pattern id, a set of clip ids, a set of Transformations,
// and an instrument name and mixer
export interface PatternTrack {
  id: TrackId;
  scaleTrackId: TrackId;
  name: string;
  instrument: string;
  mixer: Mixer;
}

export const defaultPatternTrack: PatternTrack = {
  id: "pattern-track-1",
  scaleTrackId: "scale-track-1",
  name: "",
  instrument: "grand_piano",
  mixer: defaultMixer,
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

export function initializeTrack<T extends Omit<Track, "id">>(track: T): T {
  return {
    ...track,
    id: nanoid(),
  };
}
