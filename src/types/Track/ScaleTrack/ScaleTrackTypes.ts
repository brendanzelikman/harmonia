import { ITrack, ITrackId } from "../TrackTypes";
import { createId, isString } from "types/utils";

export type ScaleTrack = ITrack<"scale">;
export type ScaleTrackId = ITrackId<"scale">;
export type ScaleTrackMap = Record<ScaleTrackId, ScaleTrack>;

/** The default scale track is used for initialization. */
export const defaultScaleTrack: ScaleTrack = {
  id: createId("scale-track"),
  scaleId: "scale_track_scale",
  trackIds: [],
};

/** Create a scale track with a unique ID. */
export const initializeScaleTrack = (
  scaleTrack: Partial<ScaleTrack> = defaultScaleTrack
): ScaleTrack => ({
  ...defaultScaleTrack,
  trackIds: [],
  ...scaleTrack,
  id: createId(`scale-track`),
});

/** Checks if a given object is of type `ScaleTrack`. */
export const isScaleTrackId = (obj: unknown): obj is ScaleTrackId => {
  const candidate = obj as ScaleTrackId;
  return isString(candidate) && candidate.startsWith("scale-track");
};
