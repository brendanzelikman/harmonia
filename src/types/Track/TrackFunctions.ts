import {
  Pattern,
  transposePatternStream,
  rotatePatternStream,
} from "types/Pattern";
import {
  Transposition,
  isTransposition,
  getChromaticOffset,
  getChordalOffset,
  getScalarOffset,
  getLastTransposition,
} from "types/Transposition";
import { SessionMap, isSessionMap } from "types/Session";
import { ERROR_TAG, Tick } from "types/units";
import {
  isTrack,
  Track,
  TrackMap,
  TrackScale,
  isTrackScale,
  isTrackMap,
  TrackInterface,
} from "./TrackTypes";
import {
  isScaleTrack,
  ScaleTrackMap,
  ScaleTrack,
  getChromaticallyTransposedTrackScale,
  getChordallyTransposedTrackScale,
  getScalarlyTransposedTrackScale,
  getScaleTrackScale,
} from "types/ScaleTrack";

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
 * @param sessionMap Optional. The SessionMap to get the children from.
 * @returns An array of child tracks. If any parameter is invalid, return an empty array.
 */
export const getTrackChildren = (
  track: Track,
  trackMap: TrackMap,
  sessionMap: SessionMap
): Track[] => {
  if (!isTrack(track)) return [];
  if (!isTrackMap(trackMap)) return [];
  if (!isSessionMap(sessionMap)) return [];

  const children: Track[] = [];
  const entity = sessionMap[track.id];
  if (!entity) return children;
  for (let i = 0; i < entity.trackIds.length; i++) {
    const id = entity.trackIds[i];
    const child = trackMap[id];
    if (!child) continue;
    children.push(child);
    children.push(...getTrackChildren(child, trackMap, sessionMap));
  }
  return children;
};

/**
 * Gets the transposed track scale with chromatic and chordal offsets applied.
 * @param trackScale The TrackScale to transpose.
 * @param transposition The Transposition to apply.
 * @returns A transposed TrackScale. If the TrackScale or Transposition is invalid, return the original TrackScale.
 */
export const getTransposedTrackScale = (
  trackScale: TrackScale,
  transposition?: Transposition
) => {
  // If any parameter is invalid, return the original track scale
  if (!isTrackScale(trackScale)) return trackScale;
  if (!isTransposition(transposition)) return trackScale;
  const { offsets } = transposition;

  // Transpose the track scale chromatically
  const N = getChromaticOffset(offsets);
  const s1 = getChromaticallyTransposedTrackScale(trackScale, N);

  // Transpose the track scale chordally
  const t = getChordalOffset(offsets);
  const s2 = getChordallyTransposedTrackScale(s1, t);

  // Return the transposed track scale
  const transposedTrackScale = s2;
  return transposedTrackScale;
};

/**
 * Gets the transposed scale track with all offsets applied to the track and its parents.
 * @param track The ScaleTrack to transpose.
 * @param parents The parent ScaleTracks of the ScaleTrack.
 * @param transposition The Transposition to apply.
 * @returns A transposed ScaleTrack. If any parameter is invalid, return the original ScaleTrack.
 */
export const getTransposedScaleTrack = (
  track: ScaleTrack,
  parents: ScaleTrack[],
  transposition?: Transposition
) => {
  // If any parameter is invalid, return the original scale track
  if (!isScaleTrack(track)) return track;
  if (parents.some((parent) => !isScaleTrack(parent))) return track;
  if (!isTransposition(transposition)) return track;

  // Initialize the loop variables
  let newlyTransposedParents = [...parents] || [];
  let parent, child;
  let newTrack = track;

  // Transpose the scales sequentially based on the parents/offsets
  for (let j = 1; j <= parents.length; j++) {
    parent = newlyTransposedParents[j - 1];
    child = newlyTransposedParents[j] || track;

    // Transpose the scale track scalarly
    const scalar = getScalarOffset(transposition.offsets, parent.id);
    const trackScale = getScalarlyTransposedTrackScale(
      child.trackScale,
      scalar,
      parent.trackScale
    );

    // Update the track and parents with the transposed scale track
    newTrack = { ...child, trackScale };
    newlyTransposedParents[j] = newTrack;
  }

  // Apply the final chromatic/chordal offsets to the track scale
  const trackScale = getTransposedTrackScale(
    newTrack.trackScale,
    transposition
  );

  // Return the transposed scale track
  return { ...newTrack, trackScale };
};

/**
 * Transpose the scale tracks at the given tick.
 * @param tracks The ScaleTracks to transpose.
 * @param transpositions A 2D array of Transpositions to apply to each ScaleTrack.
 * @param tick Optional. The tick to transpose the ScaleTracks at.
 * @returns An array of transposed ScaleTracks. If any parameter is invalid, return the original ScaleTracks.
 */
export const getTransposedScaleTracksAtTick = (
  tracks: ScaleTrack[],
  transpositions: Transposition[][],
  tick: Tick = 0
) => {
  // If any parameter is invalid, return the original tracks
  if (tracks.some((track) => !isScaleTrack(track))) return tracks;
  if (!transpositions.length) return tracks;

  // Get the godfather and apply base transpositions
  const godfatherScale = tracks[0].trackScale;
  const godfatherTranspositions = transpositions[0];
  const godfatherTrackScale = getTransposedTrackScale(
    godfatherScale,
    getLastTransposition(godfatherTranspositions, tick)
  );
  const godfather = { ...tracks[0], trackScale: godfatherTrackScale };

  // Initialize the transposed tracks with the godfather
  const transposedTracks = [godfather];

  // Iterate down child scale tracks and apply transpositions if they exist
  for (let i = 1; i < tracks.length; i++) {
    // Get the current track and transposition
    const track = tracks[i];
    const transposition = getLastTransposition(transpositions[i], tick, false);

    // If no transposition exists, then just push the track
    if (!transposition) {
      transposedTracks.push(track);
      continue;
    }

    // Otherwise, add the transposed scale track
    const transposedTrack = getTransposedScaleTrack(
      track,
      transposedTracks,
      transposition
    );
    transposedTracks.push(transposedTrack);
  }

  // Return the transposed tracks
  return transposedTracks;
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
  scaleTracks,
  quantizations,
}: {
  pattern: Pattern;
  transposition?: Transposition;
  tracks?: ScaleTrack[];
  scaleTracks?: ScaleTrackMap;
  quantizations?: boolean[];
}) => {
  if (!pattern) return [];
  if (!transposition) return pattern.stream;
  if (!scaleTracks) return pattern.stream;
  if (!tracks || tracks?.some((track) => !isScaleTrack(track))) return [];

  // Initialize the loop variables
  const { offsets } = transposition;

  // Compute the pattern stream through all transposed parents
  const patternStream = tracks.reduce((acc, track, i) => {
    // Get the scale track scale and offset
    const scale = getScaleTrackScale(track, scaleTracks);
    const offset = offsets[track.id];

    // Quantize the parent to the scale if a transposition exists
    const shouldQuantize = quantizations?.[i];
    if (shouldQuantize ? offset === undefined : offset === 0) return acc;

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
