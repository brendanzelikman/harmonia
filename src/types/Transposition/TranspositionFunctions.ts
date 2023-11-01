import { Tick } from "types/units";
import {
  Transposition,
  TranspositionVector,
  TranspositionVectorId,
  TranspositionMap,
  TranspositionUpdate,
} from "./TranspositionTypes";
import { TrackId } from "types/Track";
import { ScaleTrackMap } from "types/ScaleTrack";
import { getKeys } from "utils/objects";
import { ScaleVector } from "types/Scale";

// ------------------------------------------------------------
// Transposition Serializers
// ------------------------------------------------------------

/** Get a `Transposition` as a string. */
export const getTranspositionAsString = (transposition: Transposition) => {
  return JSON.stringify(transposition);
};

/** Get a `TranspositionUpdate` as a string. */
export const getTranspositionUpdateAsString = (update: TranspositionUpdate) => {
  return JSON.stringify(update);
};

/** Get a `TranspositionVector` as a string. */
export const getTranspositionVectorAsString = (
  vector: TranspositionVector,
  orderedTrackIds?: TrackId[]
) => {
  if (!vector) return "";
  const vectorKeys = Object.keys(vector);
  const nonScalarKeys = vectorKeys.filter(
    (k) => k !== "chromatic" && k !== "chordal"
  );
  const scalars = nonScalarKeys.sort((a, b) => {
    const aIndex = orderedTrackIds?.indexOf(a) || 0;
    const bIndex = orderedTrackIds?.indexOf(b) || 0;
    return aIndex - bIndex;
  });
  const N = vector.chromatic || 0;
  const Ts = scalars.map((k) => vector[k] || 0);
  const t = vector.chordal || 0;
  if (!Ts.length) return `N${N} • t${t}`;
  return `N${N} • T(${Ts.join(", ")}) • t${t}`;
};

// ------------------------------------------------------------
// Property Getters
// ------------------------------------------------------------

/** Get the chromatic offset from the vector. */
export const getChromaticOffset = (vector?: TranspositionVector) => {
  if (!vector) return 0;
  return vector.chromatic || 0;
};

/** Get the chordal offset from the vector. */
export const getChordalOffset = (vector?: TranspositionVector) => {
  if (!vector) return 0;
  return vector.chordal || 0;
};

/** Get the transposition offset by ID from the vector. */
export const getTranspositionOffsetById = (
  vector?: TranspositionVector,
  id?: TranspositionVectorId
) => {
  if (!vector || !id) return 0;
  return vector[id] || 0;
};

/** Get the transposition offsets by ID from the vector. */
export const getTranspositionOffsetsById = (
  vector?: TranspositionVector,
  ids?: TranspositionVectorId[]
) => {
  if (!vector || !ids) return [];
  return ids.map((id) => vector[id] || 0);
};

/** Get the scale vector of a transposition. */
export const getTranspositionScaleVector = (
  transposition?: Transposition,
  scaleTracks?: ScaleTrackMap
) => {
  if (!transposition || !scaleTracks) return {};
  const keys = getKeys(transposition.vector);
  return keys.reduce((acc, cur) => {
    const track = scaleTracks[cur];
    if (track) acc[track.scaleId] = transposition.vector[cur];
    return acc;
  }, {} as ScaleVector);
};

// ------------------------------------------------------------
// Transposition Operations
// ------------------------------------------------------------

/** Get the offseted transposition by adding the given vectors to the given transposition. */
export const getOffsettedTransposition = (
  transposition: Transposition,
  ...vectors: TranspositionVector[]
): Transposition => {
  const allVectors = [transposition.vector, ...vectors];

  // Add the vectors together
  const newVector = allVectors.reduce((acc, cur) => {
    const keys = Object.keys(cur);
    for (const key of keys) {
      acc[key] = (acc[key] || 0) + cur[key];
    }
    return acc;
  }, {} as TranspositionVector);

  // Return the transposition with the new vector
  return { ...transposition, vector: newVector };
};

/** Get the current transposition occurring at or before the given tick. */
export const getCurrentTransposition = (
  transpositions: Transposition[],
  tick: Tick = 0,
  sort = true
) => {
  if (!transpositions.length) return undefined;

  // Get the matches
  const matches = transpositions.filter((t) => {
    const startsBefore = t.tick <= tick;
    const endsAfter = !!t.duration ? t.tick + t.duration > tick : true;
    return startsBefore && endsAfter;
  });

  // If no matching transpositions, return undefined
  if (!matches.length) return undefined;

  // If sort is false, return the first matching transposition
  if (!sort) return matches[0];

  // Otherwise, sort the matching transpositions by tick and return the first one
  return matches.sort((a, b) => b.tick - a.tick)[0];
};

/** Creates a TranspositionMap from an array of Transpositions. */
export const createTranspositionMap = (transpositions: Transposition[]) => {
  return transpositions.reduce((acc, transposition) => {
    acc[transposition.id] = transposition;
    return acc;
  }, {} as TranspositionMap);
};
