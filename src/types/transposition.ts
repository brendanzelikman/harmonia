import { nanoid } from "@reduxjs/toolkit";
import {
  ScaleTrack,
  ScaleTrackNoteMap,
  TrackId,
  getScaleTrackNotes,
  getTransposedScaleTrack,
} from "./tracks";
import { Offset, Tick } from "./units";
import {
  Pattern,
  defaultPattern,
  rotatePatternStream,
  transposePatternStream,
} from "./pattern";
import {
  GenericScale,
  Scale,
  defaultScale,
  rotateScale,
  transposeScale,
} from "./scale";
import { SessionMapState } from "redux/slices/sessionMap";

export type TranspositionId = string;
export type TranspositionReferenceId = TrackId | "_chromatic" | "_self";

export type Transposition = {
  id: TranspositionId;
  trackId: TrackId;

  // Offsets are stored as a map of scale ids to values
  offsets: TranspositionOffsetRecord;

  tick: Tick;
  duration?: Tick; // no duration = continuous
};

export const isTransposition = (obj: any): obj is Transposition => {
  const { offsets } = obj;
  return offsets !== undefined;
};

export const defaultTransposition: Transposition = {
  id: "",
  trackId: "",
  offsets: {},
  tick: 0,
};

export type TranspositionOffsetRecord = Record<
  TranspositionReferenceId,
  Offset
>;
export type TrackTranspositionRecord = Record<TrackId, Transposition[]>;

export const testTransposition = ({
  N,
  T,
  t,
  tick,
  scale,
}: {
  N: number;
  T: number;
  t: number;
  tick: number;
  scale?: Scale;
}): Transposition => {
  const transposition = {
    ...defaultTransposition,
    tick,
    offsets: {
      _chromatic: N,
      _self: t,
    },
  };
  return scale !== undefined
    ? { ...transposition, offsets: { ...transposition.offsets, [scale.id]: T } }
    : transposition;
};

export type TranspositionNoId = Omit<Transposition, "id">;
export const initializeTransposition = (
  transposition: TranspositionNoId = defaultTransposition
) => ({
  ...transposition,
  id: nanoid(),
});

// Get the chromatic value of the transposition (N)
export const getChromaticTranspose = (
  transposition?: Partial<Transposition> | TranspositionOffsetRecord
) => {
  if (!transposition) return 0;
  if (isTransposition(transposition))
    return transposition.offsets?._chromatic || 0;
  return (transposition as TranspositionOffsetRecord)._chromatic || 0;
};

// Get the scalar value of the transposition (T)
export const getScalarTranspose = (
  transposition?: Partial<Transposition> | TranspositionOffsetRecord,
  id?: TranspositionReferenceId
) => {
  if (!transposition || !id) return 0;
  if (isTransposition(transposition)) return transposition.offsets?.[id] || 0;
  return (transposition as TranspositionOffsetRecord)[id] || 0;
};

// Get the chordal value of the transposition (t)
export const getChordalTranspose = (
  transposition?: Partial<Transposition> | TranspositionOffsetRecord
) => {
  if (!transposition) return 0;
  if (isTransposition(transposition)) return transposition.offsets?._self || 0;
  return (transposition as TranspositionOffsetRecord)._self || 0;
};

export const createTranspositionTag = (transposition: Transposition) => {
  const offsets = JSON.stringify(transposition.offsets);
  return `${transposition.id}@${transposition.tick}@${transposition.trackId}@${offsets}`;
};

export const getLastTransposition = (
  transpositions: Transposition[],
  tick: Tick = 0,
  sort = true
) => {
  if (!transpositions) return;
  const previousTranspositions = transpositions.filter(
    (t) =>
      t.tick <= tick &&
      (t.duration !== undefined ? t.tick + t.duration > tick : true)
  );
  if (!previousTranspositions.length) return;
  if (!sort) return previousTranspositions[0];
  if (previousTranspositions.length === 1) return previousTranspositions[0];
  return previousTranspositions.sort((a, b) => b.tick - a.tick)[0];
};

export const sortTranspositionOffsets = (
  transpositions: TranspositionOffsetRecord
): TranspositionReferenceId[] => {
  return Object.keys({ ...transpositions }).sort((a, b) => {
    if (a === "_chromatic") return 1;
    if (b === "_chromatic") return -1;
    if (a === "_self") return 1;
    if (b === "_self") return -1;
    return 0;
  });
};

export const applyTranspositionsToScale = (
  scale: GenericScale = defaultScale,
  dependencies: {
    transpositions?: TranspositionOffsetRecord;
    scaleTracks: Record<TrackId, ScaleTrack>;
    sessionMap: SessionMapState;
  }
) => {
  if (!scale || !dependencies) return scale;
  const { transpositions, scaleTracks } = dependencies;
  if (!transpositions) return scale;
  return sortTranspositionOffsets({ ...transpositions }).reduce((acc, id) => {
    const offset = transpositions[id];
    if (!offset) return acc;
    if (id === "_chromatic") return transposeScale(acc, offset);
    if (id === "_self") return rotateScale(acc, offset);
    const scaleTrack = scaleTracks[id];
    if (!scaleTrack) return acc;
    const transposedTrack = getTransposedScaleTrack(
      scaleTrack,
      offset,
      dependencies
    );
    const notes = getScaleTrackNotes(transposedTrack, { scaleTracks });
    return { ...acc, notes };
  }, scale);
};

export const applyTranspositionsToPattern = (
  pattern: Pattern = defaultPattern,
  dependencies: {
    transpositions?: TranspositionOffsetRecord;
    scaleMap: ScaleTrackNoteMap;
  }
) => {
  if (!pattern) return pattern;
  const { transpositions, scaleMap } = dependencies;
  if (!transpositions) return pattern;
  const stream = sortTranspositionOffsets(transpositions).reduce((acc, id) => {
    const offset = transpositions[id];
    if (!offset) return acc;
    if (id === "_chromatic") return transposePatternStream(acc, offset);
    if (id === "_self") return rotatePatternStream(acc, offset);
    // Get the scale from the corresponding scale track
    const scale = scaleMap[id];
    return transposePatternStream(acc, offset, scale);
  }, pattern.stream);

  return {
    ...pattern,
    stream,
  };
};
