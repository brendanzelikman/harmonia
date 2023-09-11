// Both scales and patterns can be transformed by a series of

import { nanoid } from "@reduxjs/toolkit";
import { TrackId } from "./tracks";
import { Tick } from "./units";
import {
  Pattern,
  PatternStream,
  defaultPattern,
  rotatePatternStream,
  transposePatternStream,
} from "./pattern";
import { Scale, chromaticScale } from "./scale";

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

export const transformPattern = (
  pattern: Pattern = defaultPattern,
  transform: TransformCoordinate,
  scale: Scale = chromaticScale
): Pattern => {
  if (!pattern) return pattern;
  const { stream } = pattern;

  // Get the offsets
  const N = transform?.N ?? 0;
  const T = transform?.T ?? 0;
  const t = transform?.t ?? 0;

  // Transpose stream
  let transposedStream: PatternStream;
  const s1 = transposePatternStream(stream, T, scale);
  const s2 = rotatePatternStream(s1, t);
  const s3 = transposePatternStream(s2, N, chromaticScale);
  transposedStream = s3;

  return {
    ...pattern,
    stream: transposedStream,
  };
};

export type TransformCoordinate = {
  N: number;
  T: number;
  t: number;
};
