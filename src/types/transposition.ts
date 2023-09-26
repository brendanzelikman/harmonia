import { nanoid } from "@reduxjs/toolkit";
import {
  ScaleTrack,
  ScaleTrackMap,
  TrackId,
  getScalarlyTransposedScaleTrack,
  getChromaticallyTransposedScaleTrack,
  getChordallyTransposedScaleTrack,
  getScaleTrackScale,
} from "./tracks";
import { Offset, Tick } from "./units";
import {
  Pattern,
  rotatePatternStream,
  transposePatternStream,
} from "./pattern";

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
export type TranspositionMap = Record<TranspositionId, Transposition>;

export type TranspositionNoId = Omit<Transposition, "id">;
export const initializeTransposition = (
  transposition: TranspositionNoId = defaultTransposition
) => ({
  ...transposition,
  id: nanoid(),
});

export const createTranspositionTag = (transposition: Transposition) => {
  const offsets = JSON.stringify(transposition.offsets);
  return `${transposition.id}@${transposition.tick}@${transposition.trackId}@${offsets}`;
};

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

// Get the last transposition at the given tick
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

// Transpose the scale track chromatically/chordally
export const applyTranspositionToScaleTrack = (
  track: ScaleTrack,
  transposition?: Transposition
) => {
  if (!transposition) return track;
  const N = getChromaticTranspose(transposition);
  const transposedTrack = getChromaticallyTransposedScaleTrack(track, N);

  const t = getChordalTranspose(transposition);
  const rotatedTrack = getChordallyTransposedScaleTrack(transposedTrack, t);

  return rotatedTrack;
};

// Transpose the scale track along its transposed parents
export const applyTranspositionsToScaleTrack = (
  track: ScaleTrack,
  parents: ScaleTrack[],
  transposition?: Transposition
) => {
  if (!transposition) return track;
  let newlyTransposedParents = [...parents] || [];
  let parent, child;
  let newTrack = track;

  // Transpose the scales sequentially based on the parents/offsets
  for (let j = 1; j <= parents.length; j++) {
    parent = newlyTransposedParents[j - 1];
    child = newlyTransposedParents[j] || track;
    const scalar = getScalarTranspose(transposition, parent.id);
    newTrack = getScalarlyTransposedScaleTrack(child, scalar, parent);
    newlyTransposedParents[j] = newTrack;
  }

  // Transpose the scale track chromatically/chordally
  return applyTranspositionToScaleTrack(newTrack, transposition);
};

// Transpose the scale tracks at the given tick
export const transposeTracksAtTick = (
  tracks: ScaleTrack[],
  transpositions: Transposition[][],
  tick: Tick = 0
) => {
  // Get the first parent and apply base transpositions
  const godfather = applyTranspositionToScaleTrack(
    tracks[0],
    getLastTransposition(transpositions[0], tick, false)
  );
  const transposedTracks = [godfather];

  // Iterate down child scale tracks and apply transpositions if they exist
  for (let i = 1; i < tracks.length; i++) {
    const track = tracks[i];
    const transposition = getLastTransposition(transpositions[i], tick, false);
    // If none exists, then just push the scale track
    if (!transposition) {
      transposedTracks.push(track);
      continue;
    }
    // Otherwise, add the transposed scale track
    const transposedTrack = applyTranspositionsToScaleTrack(
      track,
      transposedTracks,
      transposition
    );
    transposedTracks.push(transposedTrack);
  }
  return transposedTracks;
};

export const getTransposedPatternStream = ({
  pattern,
  transposition,
  tracks,
  scaleTracks,
  quantizations,
}: {
  pattern: Pattern;
  transposition?: Transposition;
  tracks?: ScaleTrack[];
  scaleTracks?: ScaleTrackMap;
  quantizations: boolean[];
}) => {
  if (!transposition) return pattern.stream;
  if (!tracks || !scaleTracks) return pattern.stream;

  // Compute the pattern stream through all transposed parents
  const patternStream = tracks.reduce((acc, track, i) => {
    const scale = getScaleTrackScale(track, scaleTracks);
    const offset = transposition?.offsets?.[track.id];
    // Quantize the parent to the scale if a transposition exists
    const shouldQuantize = quantizations[i];
    if (shouldQuantize ? offset === undefined : offset === 0) return acc;
    return transposePatternStream(acc, offset, scale);
  }, pattern.stream);

  // Apply the final chromatic/chordal offsets
  const N = getChromaticTranspose(transposition);
  const t = getChordalTranspose(transposition);
  const transposedStream = transposePatternStream(patternStream, N);
  const rotatedStream = rotatePatternStream(transposedStream, t);

  return rotatedStream;
};
