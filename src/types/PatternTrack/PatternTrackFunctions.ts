import { PatternTrack, PatternTrackUpdate } from "./PatternTrackTypes";

/** Get a `PatternTrack` as a string. */
export const getPatternTrackAsString = (track: PatternTrack) => {
  return JSON.stringify(track);
};

/** Get a `PatternTrackUpdate` as a string. */
export const getPatternTrackUpdateAsString = (update: PatternTrackUpdate) => {
  return JSON.stringify(update);
};
