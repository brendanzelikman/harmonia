import { ScaleTrack, ScaleTrackUpdate } from "./ScaleTrackTypes";

/** Get a `ScaleTrack` as a string. */
export const getScaleTrackAsString = (track: ScaleTrack) => {
  return JSON.stringify(track);
};

/** Get a `ScaleTrackUpdate` as a string. */
export const getScaleTrackUpdateAsString = (update: ScaleTrackUpdate) => {
  return JSON.stringify(update);
};
