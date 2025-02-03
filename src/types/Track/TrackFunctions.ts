import { getValueByKey } from "utils/objects";

import { numberToUpper } from "utils/math";
import { isScaleTrack, ITrack, Track, TrackId, TrackMap } from "./TrackTypes";
import {
  isScaleTrackId,
  ScaleTrack,
  ScaleTrackId,
} from "./ScaleTrack/ScaleTrackTypes";

// ------------------------------------------------------------
// Track Map Properties
// ------------------------------------------------------------

/** Get the list of top level tracks. */
export const getTopLevelTracks = (trackMap: TrackMap) => {
  const tracks = Object.values(trackMap);
  const orphans = tracks.filter((t) => !!t && !t.parentId) as Track[];
  return orphans.toSorted(
    (a, b) =>
      (a.order ?? (isScaleTrackId(a.id) ? 1 : 0)) -
      (b.order ?? (isScaleTrackId(b.id) ? 1 : 0))
  );
};

/** Get the list of ordered track IDs. */
export const getOrderedTrackIds = (trackMap: TrackMap) => {
  const topLevelTracks = getTopLevelTracks(trackMap);
  const orderedTrackIds: TrackId[] = [];

  const pushTrackAndDescendants = (track?: ITrack) => {
    if (!track) return;
    orderedTrackIds.push(track.id);
    for (const i in track.trackIds) {
      const childId = track.trackIds[i];
      const childTrack = trackMap[childId];
      if (childTrack !== undefined && childTrack.parentId === track.id) {
        pushTrackAndDescendants(childTrack);
      }
    }
  };

  for (const track of topLevelTracks) {
    pushTrackAndDescendants(track);
  }

  return orderedTrackIds;
};

/** Get the list of ordered tracks. */
export const getOrderedTracks = (trackMap: TrackMap) => {
  const trackIds = getOrderedTrackIds(trackMap);
  return trackIds.map((id) => trackMap[id]) as Track[];
};

// ------------------------------------------------------------
// Track Properties
// ------------------------------------------------------------

/** Get the depth of a track relative to the top level. */
export const getTrackDepth = (id: TrackId, trackMap: TrackMap) => {
  let track = trackMap[id];
  let depth = 1;
  while (track?.parentId) {
    depth++;
    track = trackMap[track.parentId];
    if (track?.id === id) break;
  }
  return depth;
};

/** Get the track index in its parent. */
export const getTrackIndex = (id: TrackId, trackMap: TrackMap) => {
  const track = trackMap[id];
  if (!track) return -1;

  // Try to find the track in the top level
  const topLevelTracks = getTopLevelTracks(trackMap);
  const topLevelIndex = topLevelTracks.findIndex((track) => track.id === id);
  if (topLevelIndex > -1) return topLevelIndex;

  // Otherwise, return the index of the track in its parent
  const parent = getValueByKey(trackMap, track.parentId);
  const parentIndex = (parent?.trackIds ?? []).indexOf(id);
  if (parentIndex > -1) return parentIndex;

  return track.order ?? -1;
};

/** Get the label of a track. */
export const getTrackLabel = (id: TrackId, trackMap: TrackMap) => {
  const track = trackMap[id];
  if (!track) return "";

  // Otherwise, use all track parents to get the label
  // const topLevelTracks = getTopLevelTracks(trackMap);
  const ancestorIds = getTrackAncestorIds(id, trackMap);
  const trackIds = [...ancestorIds, id];

  return trackIds
    .map((track) => {
      const index = getTrackIndex(track, trackMap);
      return numberToUpper(index);
    })
    .join("");
};

/** Get the Scale Track or parent Scale Track of a Pattern Track. */
export const getScaleTrack = (id: TrackId, trackMap: TrackMap) => {
  const track = trackMap[id];
  if (!track) return undefined;
  if (isScaleTrack(track)) return track;
  const parent = getValueByKey(trackMap, track.parentId);
  if (isScaleTrack(parent)) return parent;
  return undefined;
};

// ------------------------------------------------------------
// Scale Track Chain
// ------------------------------------------------------------

/** Get the scale track ID chain of a track. */
export const getScaleTrackChainIds = (
  id: TrackId,
  trackMap: TrackMap
): ScaleTrackId[] => {
  const track = trackMap[id];
  if (!track) return [];

  // Start with the parent scale track
  let trackIds: ScaleTrackId[] = [];
  let parentId = track.parentId;

  // Keep going up parents while there is a parent scale track
  while (parentId) {
    const parent = trackMap[parentId] as ScaleTrack | undefined;
    if (!parent?.scaleId) break;
    trackIds = [parent.id, ...trackIds];
    parentId = parent.parentId;
  }

  // If the track is a scale track, then add it to the chain
  if (isScaleTrackId(id)) trackIds.push(id);

  // Return the id chain
  return trackIds;
};

/** Get the scale track chain of a track. */
export const getScaleTrackChain = (id: TrackId, trackMap: TrackMap) => {
  const trackIds = getScaleTrackChainIds(id, trackMap);
  return trackIds.map((id) => trackMap[id]).filter(isScaleTrack);
};

// ------------------------------------------------------------
// Ancestors and Descendants
// ------------------------------------------------------------

/** Get the ancestor IDs of a track. */
export const getTrackAncestorIds = (
  id: TrackId,
  trackMap: TrackMap
): TrackId[] => {
  const track = trackMap[id];
  const idChain = getScaleTrackChainIds(id, trackMap);
  return isScaleTrack(track) ? idChain.slice(0, -1) : idChain;
};

/** Get the immediate child IDs of a track by ID. */
export const getTrackChildIds = (id: TrackId, trackMap: TrackMap) => {
  const trackIds = getOrderedTrackIds(trackMap);
  const childIds: TrackId[] = [];
  for (const i in trackIds) {
    const trackId = trackIds[i];
    const track = trackMap[trackId];
    if (track !== undefined && track.parentId === id) {
      childIds.push(track.id);
    }
  }
  return childIds;
};

/** Get all descendant IDs of a track by ID. */
export const getTrackDescendantIds = (id: TrackId, trackMap: TrackMap) => {
  const tracks = getOrderedTracks(trackMap);
  const descendantIds: TrackId[] = [];
  const children = tracks.filter((t) => t.parentId === id);
  for (const child of children) {
    descendantIds.push(child.id);
    descendantIds.push(...getTrackDescendantIds(child.id, trackMap));
  }
  return descendantIds;
};
