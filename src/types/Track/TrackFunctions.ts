import { Track, TrackMap, TrackInterface, TrackId } from "./TrackTypes";
import { isScaleTrack, ScaleTrack } from "types/ScaleTrack";
import { Tick } from "types/units";
import { ScaleMap, chromaticScale, getTransposedScale } from "types/Scale";
import {
  Transposition,
  getCurrentTransposition,
  getTranspositionOffsetById,
} from "types/Transposition";
import { TrackArrangement } from "types/Arrangement";
import { getTrackTranspositionIds } from "types/TrackHierarchy";
import { getKeys } from "utils/objects";

// ------------------------------------------------------------
// String Conversion
// ------------------------------------------------------------

/** Get a `Track` as a string. */
export const getTrackAsString = (track: TrackInterface) => {
  return JSON.stringify(track);
};

// ------------------------------------------------------------
// Track Functions
// ------------------------------------------------------------

/** Get the IDs of the chained ancestors of the given track by ID. */
export const getScaleTrackIdChain = (
  id: TrackId,
  trackMap: TrackMap
): TrackId[] => {
  const track = trackMap[id];
  if (!track) return [];

  // Start with the parent scale track
  let trackIds: TrackId[] = [];
  let parentId = track.parentId;

  // Keep going up parents while there is a parent scale track
  while (parentId) {
    const parent = trackMap[parentId];
    if (!isScaleTrack(parent) || !parent) break;
    trackIds = [parent.id, ...trackIds];
    parentId = parent.parentId;
  }

  // If the track is a scale track, then add it to the chain
  if (isScaleTrack(track)) trackIds.push(id);

  // Return the id chain
  return trackIds;
};

/** Get the chained ancestors of a `Track`, including itself if it is a `ScaleTrack`. */
export const getScaleTrackChain = (
  id: TrackId,
  trackMap: TrackMap
): ScaleTrack[] => {
  const idChain = getScaleTrackIdChain(id, trackMap);
  const chain = idChain.map((id) => trackMap[id]);
  return chain as ScaleTrack[];
};

/** Get the parent IDs of a `Track`. */
export const getTrackParentIds = (
  id: TrackId,
  trackMap: TrackMap
): TrackId[] => {
  const track = trackMap[id];
  const idChain = getScaleTrackIdChain(id, trackMap);
  return isScaleTrack(track) ? idChain.slice(0, -1) : idChain;
};

/** Get the parent tracks of a `Track`. */
export const getTrackParents = (id: TrackId, trackMap: TrackMap): Track[] => {
  const track = trackMap[id];
  const idChain = getScaleTrackIdChain(id, trackMap);
  const slicedIdChain = isScaleTrack(track) ? idChain.slice(0, -1) : idChain;
  const trackChain = slicedIdChain.map((id) => trackMap[id]);
  return trackChain.filter(isScaleTrack);
};

/** A track scale chain is dependent on the arrangement. */
export interface TrackScaleChainDependencies extends Partial<TrackArrangement> {
  tick?: Tick;
  scales?: ScaleMap;
}

/** Get the scale chain of a track by ID, transposing if a tick is specified.  */
export const getTrackScaleChain = (
  id: TrackId,
  deps: TrackScaleChainDependencies
) => {
  const { scales, tick, ...arrangement } = deps;
  const defaultChain = [chromaticScale];
  if (!arrangement) return [chromaticScale];

  // Try to get the track from the arrangement
  const nodes = arrangement.tracks ?? {};
  const track = nodes[id];
  if (!track) return defaultChain;

  // Get the track map from the arrangement
  const scaleTracks = arrangement.scaleTracks ?? {};
  const patternTracks = arrangement.patternTracks ?? {};
  const tracks = { ...scaleTracks, ...patternTracks };

  // Get all tracks
  const trackChain = getScaleTrackChain(id, tracks);
  const chainLength = trackChain.length;
  if (!chainLength) return defaultChain;

  // Get the track's transpositions if the tick is specified
  const noTick = tick === undefined;
  const trackChainPoseIds = noTick
    ? []
    : trackChain.map((t) => getTrackTranspositionIds(t.id, nodes));

  // Iterate down child scale tracks and apply transpositions if they exist
  const newChain = [];
  for (let i = 0; i < chainLength; i++) {
    // Get the track and scale
    const track = trackChain[i];
    const scale = scales?.[track.scaleId] ?? chromaticScale;

    // If no tick is specified, just push the scale
    if (noTick) {
      newChain.push(scale);
      continue;
    }

    // Try to get the transposition at the current tick
    const poseIds = trackChainPoseIds[i];
    const poses = poseIds
      .map((id) => arrangement.transpositions?.[id])
      .filter(Boolean) as Transposition[];
    const pose = getCurrentTransposition(poses, tick, false);

    // If no transposition exists, just push the scale
    if (pose === undefined) {
      newChain.push(scale);
      continue;
    }

    // Otherwise, transpose the scale by every offset in the transposition
    const vectorKeys = getKeys(pose.vector);
    let newScale = scale;

    // Iterate through the offsets and transpose the scale
    for (const id of vectorKeys) {
      // Get the offset from the transposition vector
      const offset = getTranspositionOffsetById(pose.vector, id);

      // Get the parent scale from the new chain (to iteratively transpose)
      const parentScale = i > 0 ? newChain[i - 1] : undefined;

      // Get the transposed scale using the offset and parent scale
      newScale = getTransposedScale(newScale, offset, parentScale);
    }

    // Push the transposed scale to the chain
    newChain.push(newScale);
  }

  // Return the transposed scale chain
  return newChain;
};
