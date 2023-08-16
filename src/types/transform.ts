// Both scales and patterns can be transformed by a series of

import { nanoid } from "@reduxjs/toolkit";
import { TrackId } from "./tracks";
import { Time } from "./units";

// transpositions applied to the track at a specified time.

export type TransformId = string;

export type Transform = {
  id: TransformId;
  trackId: TrackId;
  chromaticTranspose: number;
  scalarTranspose: number;
  chordalTranspose: number;
  time: Time;
};

export const defaultTransform: Transform = {
  id: "",
  trackId: "",
  chromaticTranspose: 0,
  scalarTranspose: 0,
  chordalTranspose: 0,
  time: 0,
};

export type TransformNoId = Omit<Transform, "id">;
export const initializeTransform = (
  Transformation: TransformNoId = defaultTransform
) => ({
  ...Transformation,
  id: nanoid(),
});

export const lastTransformAtTime = (transforms: Transform[], time: Time) => {
  return transforms
    .filter((t) => t.time <= time)
    .sort((a, b) => b.time - a.time)[0];
};
