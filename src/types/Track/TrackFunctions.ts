import {
  Pattern,
  transposePatternStream,
  rotatePatternStream,
} from "types/Pattern";
import {
  Transposition,
  getChromaticOffset,
  getChordalOffset,
  getScalarOffset,
  getLastTransposition,
} from "types/Transposition";
import { TrackNodeMap, isTrackNodeMap } from "types/TrackHierarchy";
import { ERROR_TAG, Tick } from "types/units";
import {
  isTrack,
  Track,
  TrackMap,
  isTrackMap,
  TrackInterface,
} from "./TrackTypes";
import {
  isScaleTrack,
  ScaleTrackMap,
  ScaleTrack,
  getScaleTrackScale,
} from "types/ScaleTrack";
import {
  NestedScale,
  NestedScaleMap,
  applyTranspositionToNestedScale,
  getNestedScaleNotes,
  getScaleNotes,
  getTransposedNestedScale,
  isNestedScaleArray,
  nestedChromaticScale,
} from "types/Scale";
import { getProperty } from "types/util";

/**
 * Get the unique tag of a given Track.
 * @param clip Optional. The Track object.
 * @returns Unique tag string. If the Track is not a ScaleTrack or a PatternTrack, return the error tag.
 */
export const getTrackTag = (track: TrackInterface) => {
  if (!isTrack(track)) return ERROR_TAG;
  return `${track.id}@${track.name}@${track.type}@${track.parentId}`;
};

/**
 * Gets the parent scale tracks of a track, including itself if it is a scale track.
 * @param track Optional. The Track to get the parents of.
 * @param scaleTracks Optional. The ScaleTrackMap to get the parents from.
 * @returns An array of parent scale tracks. If any parameter is invalid, return an empty array.
 */
export const getTrackParents = (
  track: Track,
  trackMap: TrackMap
): ScaleTrack[] => {
  // If the track or scale track map is invalid, return an empty array
  if (!isTrack(track) || !isTrackMap(trackMap)) return [];

  // Start with the parent scale track
  let parents: ScaleTrack[] = [];
  let parentId = track.parentId;

  // Keep going up parents while there is a parent scale track
  while (parentId) {
    const parent = trackMap[parentId];
    if (!isScaleTrack(parent) || !parent) break;
    parents = [parent, ...parents];
    parentId = parent.parentId;
  }

  // If the track is a scale track, then add it to the parents
  if (isScaleTrack(track)) parents.push(track);

  // Return the parents
  return parents;
};

/**
 * Gets the child tracks of a track.
 * @param track Optional. The Track to get the children of.
 * @param trackMap Optional. The TrackMap to get the children from.
 * @param trackNodeMap Optional. The TrackNodeMap to get the children from.
 * @returns An array of child tracks. If any parameter is invalid, return an empty array.
 */
export const getTrackChildren = (
  track: Track,
  trackMap: TrackMap,
  trackNodeMap: TrackNodeMap
): Track[] => {
  if (!isTrack(track)) return [];
  if (!isTrackMap(trackMap)) return [];
  if (!isTrackNodeMap(trackNodeMap)) return [];

  const children: Track[] = [];
  const trackNode = trackNodeMap[track.id];
  if (!trackNode) return children;
  for (let i = 0; i < trackNode.trackIds.length; i++) {
    const id = trackNode.trackIds[i];
    const child = trackMap[id];
    if (!child) continue;
    children.push(child);
    children.push(...getTrackChildren(child, trackMap, trackNodeMap));
  }
  return children;
};

/**
 * Gets the transposed scale track with all offsets applied to the track and its parents.
 * @param track The ScaleTrack to transpose.
 * @param parents The parent ScaleTracks of the ScaleTrack.
 * @param transposition The Transposition to apply.
 * @returns A `NestedScale`.
 */
export const getTransposedScaleTrackScale = (
  track: ScaleTrack,
  parents: ScaleTrack[],
  scaleMap: NestedScaleMap,
  transposition?: Transposition
): NestedScale => {
  // If no scale exists, then return the nested chromatic scale
  const scale = scaleMap[track.scaleId];
  if (!scale || !transposition) return nestedChromaticScale;

  // Initialize the loop variables
  const parentCount = parents.length;
  let transposedScales = parents
    .map((_) => getProperty(scaleMap, _.scaleId))
    .filter(Boolean) as NestedScale[];
  if (parentCount !== transposedScales.length) return nestedChromaticScale;

  // Transpose the scales sequentially based on the parents/offsets
  let notes = getNestedScaleNotes(scale);
  for (let j = 1; j <= parentCount; j++) {
    const parent = parents[j - 1];
    const parentScale = transposedScales[j - 1];
    const childScale = transposedScales[j] || scale;

    // Transpose the scale
    const scalar = getScalarOffset(transposition.offsets, parent.id);
    const transposedScale = getTransposedNestedScale(
      childScale,
      scalar,
      parentScale
    );
    // Update the track and parents
    notes = getNestedScaleNotes(transposedScale);
    transposedScales[j] = transposedScale;
  }

  // Apply the final chromatic/chordal offsets to the track scale
  const finalScale = applyTranspositionToNestedScale(notes, transposition);
  if (!isNestedScaleArray(finalScale)) return finalScale;
  return { ...scale, notes: finalScale };
};

/**
 * Transpose the scale tracks at the given tick.
 * @param tracks The ScaleTracks to transpose.
 * @param transpositions A 2D array of Transpositions to apply to each ScaleTrack.
 * @param tick Optional. The tick to transpose the ScaleTracks at.
 * @returns An array of transposed NestedScales.
 */
export const getTransposedScaleTrackScalesAtTick = (
  tracks: ScaleTrack[],
  transpositions: Transposition[][],
  scaleMap: NestedScaleMap,
  tick: Tick = 0
): NestedScale[] => {
  if (!transpositions.length || tracks.some((track) => !isScaleTrack(track))) {
    return tracks.map((t) => scaleMap[t.scaleId]);
  }

  // Get the base track scale and apply transpositions
  const base = tracks[0];
  const baseScale = getProperty(scaleMap, base.scaleId);
  const baseTranspositions = transpositions[0];
  const baseTransposition = getLastTransposition(baseTranspositions, tick);
  const transposedBaseScale = applyTranspositionToNestedScale(
    baseScale,
    baseTransposition
  );

  // Initialize the transposed tracks with the godfather
  const transposedScales = [transposedBaseScale];

  // Iterate down child scale tracks and apply transpositions if they exist
  for (let i = 1; i < tracks.length; i++) {
    // Get the current track scale and transposition
    const track = tracks[i];

    // If no scale exists, break early
    const scale = getProperty(scaleMap, track.scaleId);
    if (!scale) break;

    // If no transposition exists, use the current scale
    const transposition = getLastTransposition(transpositions[i], tick, false);
    if (!transposition) transposedScales.push(scale);

    // Otherwise, transpose the scale
    const parents = tracks.slice(0, i);
    const transposedScale = getTransposedScaleTrackScale(
      track,
      parents,
      scaleMap,
      transposition
    );

    // Push the transposed scale
    transposedScales.push(transposedScale);
  }

  // Return the transposed tracks
  return transposedScales;
};

/**
 * Get the transposed pattern stream with all offsets applied to the relevant tracks.
 * @param pattern The Pattern to transpose.
 * @param transposition Optional. The Transposition to apply.
 * @param tracks Optional. The ScaleTracks to transpose.
 * @param scaleTracks Optional. The ScaleTrackMap to get the ScaleTracks from.
 * @param quantizations Optional. The quantizations of the ScaleTracks. If true, then the ScaleTrack will be quantized to its scale.
 * @returns A transposed PatternStream. If the Pattern is invalid, return an empty array. If any other parameter is invalid, return the original PatternStream.
 */
export const getTransposedPatternStream = ({
  pattern,
  transposition,
  tracks,
  scaleMap,
  scaleTrackMap,
  quantizations,
}: {
  pattern: Pattern;
  transposition?: Transposition;
  tracks?: ScaleTrack[];
  scaleMap?: NestedScaleMap;
  scaleTrackMap?: ScaleTrackMap;
  quantizations?: boolean[];
}) => {
  if (!scaleMap || !transposition || !scaleTrackMap) return pattern.stream;
  if (!tracks || tracks?.some((track) => !isScaleTrack(track)))
    return pattern.stream;

  // Initialize the loop variables
  const { offsets } = transposition;

  // Compute the pattern stream through all transposed parents
  const patternStream = tracks.reduce((acc, track, i) => {
    // Get the scale track scale and offset
    const scale = getScaleTrackScale(track, scaleTrackMap, scaleMap);
    const offset = offsets[track.id];

    // Quantize the parent to the scale if a transposition exists
    const shouldQuantize = quantizations?.[i];
    if (shouldQuantize ? offset === undefined : !offset) return acc;
    // Otherwise, transpose the pattern stream
    return transposePatternStream(acc, offset, scale);
  }, pattern.stream);

  // Transpose the pattern stream chromatically
  const N = getChromaticOffset(offsets);
  const s1 = transposePatternStream(patternStream, N);

  // Transpose the pattern stream chordally
  const t = getChordalOffset(offsets);
  const s2 = rotatePatternStream(s1, t);

  // Return the transposed pattern stream
  const transposedPatternStream = s2;
  return transposedPatternStream;
};
