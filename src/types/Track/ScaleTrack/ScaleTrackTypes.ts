import { isTrackInterface, ITrack, ITrackId } from "../TrackTypes";
import { Dictionary, EntityState } from "@reduxjs/toolkit";
import { isString } from "lodash";
import { createId } from "types/util";

export type ScaleTrack = ITrack<"scale">;
export type ScaleTrackId = ITrackId<"scale">;
export type ScaleTrackMap = Dictionary<ScaleTrack>;
export type ScaleTrackState = EntityState<ScaleTrack>;

/** The default scale track is used for initialization. */
export const defaultScaleTrack: ScaleTrack = {
  type: "scale",
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
  return isString(candidate) && candidate[0] === "s";
};

/** Checks if a given object is of type `ScaleTrack`. */
export const isIScaleTrack = (obj: unknown): obj is ScaleTrack => {
  const candidate = obj as ScaleTrack;
  return (
    isTrackInterface(candidate) &&
    isScaleTrackId(candidate.id) &&
    isString(candidate.scaleId)
  );
};
