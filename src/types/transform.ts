// Both scales and patterns can be transformed by a series of

import { nanoid } from "@reduxjs/toolkit";
import { TrackId } from "./tracks";
import { Tick } from "./units";

// transpositions applied to the track at a specified time.

export type TransformId = string;

export type Transform = {
  id: TransformId;
  trackId: TrackId;
  chromaticTranspose: number;
  scalarTranspose: number;
  chordalTranspose: number;
  tick: Tick;
};

export const defaultTransform: Transform = {
  id: "",
  trackId: "",
  chromaticTranspose: 0,
  scalarTranspose: 0,
  chordalTranspose: 0,
  tick: 0,
};
export const testTransform = (N = 0, T = 0, t = 0, tick = 0): Transform => ({
  ...defaultTransform,
  chromaticTranspose: N,
  scalarTranspose: T,
  chordalTranspose: t,
  tick,
});

export type TransformNoId = Omit<Transform, "id">;
export const initializeTransform = (
  Transformation: TransformNoId = defaultTransform
) => ({
  ...Transformation,
  id: nanoid(),
});

export const createTransformTag = (transform: Transform) => {
  return `${transform.id}@${transform.tick}@${transform.trackId}@${transform.chromaticTranspose}@${transform.scalarTranspose}@${transform.chordalTranspose}`;
};

export const createTransformKey = (transform?: Transform) => {
  const N = transform?.chromaticTranspose ?? 0;
  const T = transform?.scalarTranspose ?? 0;
  const t = transform?.chordalTranspose ?? 0;
  return `${N},${T},${t}`;
};

export const lastTransformAtTick = (
  transforms: Transform[],
  tick: Tick,
  sort = true
) => {
  const filteredTransforms = transforms.filter((t) => t.tick <= tick);
  if (!filteredTransforms.length) return;
  if (!sort) return filteredTransforms[0];
  return filteredTransforms.sort((a, b) => b.tick - a.tick)[0];
};

export type TransformCoordinate = {
  N: number;
  T: number;
  t: number;
};
