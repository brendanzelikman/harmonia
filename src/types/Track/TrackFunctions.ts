import { numberToUpper } from "utils/math";
import { isScaleTrack, ITrack, Track, TrackId, TrackMap } from "./TrackTypes";
import { isScaleTrackId, ScaleTrackId } from "./ScaleTrack/ScaleTrackTypes";

// ------------------------------------------------------------
// Track Map Properties
// ------------------------------------------------------------

export const getTrackSortOrder = (a?: Track) =>
  a?.order ?? (a?.type === "scale" ? 1 : 0);

export const getTopLevelTracks = (trackMap: TrackMap) => {
  const tracks = Object.values(trackMap);
  const orphans = tracks.filter((t) => !!t && !t.parentId) as Track[];
  return orphans.toSorted(
    (a, b) => getTrackSortOrder(a) - getTrackSortOrder(b)
  );
};

export const sortTrackIds = (trackIds: TrackId[], trackMap: TrackMap) => {
  return trackIds.toSorted((a, b) => {
    return getTrackSortOrder(trackMap[a]) - getTrackSortOrder(trackMap[b]);
  });
};

/** Get the list of ordered track IDs. */
export const getOrderedTrackIds = (trackMap: TrackMap) => {
  const topLevelTracks = getTopLevelTracks(trackMap);
  const orderedTrackIds: TrackId[] = [];

  const pushTrackAndDescendants = (track?: ITrack) => {
    if (!track) return;
    orderedTrackIds.push(track.id);
    const trackIds = sortTrackIds(track.trackIds, trackMap);
    for (const childId of trackIds) {
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
  if (track.parentId) {
    const parent = trackMap[track.parentId];
    const trackIds = sortTrackIds(parent?.trackIds ?? [], trackMap);
    const parentIndex = trackIds.indexOf(id);
    return parentIndex;
  }

  return track.order ?? -1;
};

/** Get the absolute track index relative to all tracks */
export const getAbsoluteTrackIndex = (id: TrackId, trackMap: TrackMap) => {
  let index = 0;
  let found = false;
  const topLevelTracks = getTopLevelTracks(trackMap);

  const pushChildren = (track: Track) => {
    index++;
    const orderedTrackIds = sortTrackIds(track.trackIds, trackMap);
    for (const childId of orderedTrackIds) {
      const child = trackMap[childId];
      if (child?.id === id) {
        found = true;
        return;
      }
      if (child) {
        pushChildren(child);
      }
    }
  };
  for (const track of topLevelTracks) {
    if (found || track.id === id) break;
    pushChildren(track);
  }

  return index;
};

/** Get the label of a track. */
export const getTrackLabel = (id: TrackId, trackMap: TrackMap) => {
  if (!id) return "";
  const index = getAbsoluteTrackIndex(id, trackMap);
  return numberToUpper(index);
};

/** Get the order of a track. */
export const getTrackOrder = (id: TrackId, trackMap: TrackMap) => {
  const separator = ".";
  const trackIds = getTrackChainIds(id, trackMap);
  return trackIds
    .map((track) => getTrackIndex(track, trackMap) + 1)
    .join(separator);
};

/** Get the Scale Track or parent Scale Track of a Pattern Track. */
export const getScaleTrack = (id: TrackId, trackMap: TrackMap) => {
  const track = trackMap[id];
  if (!track) return undefined;
  if (isScaleTrack(track)) return track;
  if (!track.parentId) return undefined;
  const parent = trackMap[track.parentId];
  if (isScaleTrack(parent)) return parent;
  return undefined;
};

// ------------------------------------------------------------
// Scale Track Chain
// ------------------------------------------------------------

/** Get the scale track ID chain of a track. */
export const getTrackChainIds = (
  id: TrackId,
  trackMap: TrackMap
): TrackId[] => {
  const track = trackMap[id];
  if (!track) return [];

  // Start from the track and keep adding parents
  let trackIds: TrackId[] = [id];
  let parentId = track.parentId;

  // Keep going up parents while there is a parent scale track
  while (parentId) {
    const parent = trackMap[parentId];
    if (!parent) break;
    trackIds = [parent.id, ...trackIds];
    parentId = parent.parentId;
  }

  // Return the id chain
  return trackIds;
};

/** Get the scale track ID chain of a track. */
export const getScaleTrackChainIds = (
  id: TrackId,
  trackMap: TrackMap
): ScaleTrackId[] => {
  const trackIds = getTrackChainIds(id, trackMap);
  return trackIds.filter(isScaleTrackId);
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
  const idChain = getTrackChainIds(id, trackMap);
  return idChain.slice(0, -1);
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
