import { getValueByKey } from "utils/objects";
import { TrackMap, TrackInterface, TrackId } from "./TrackTypes";
import { isScaleTrack } from "types/Track";
import { numberToLower } from "utils/math";

// ------------------------------------------------------------
// String Conversion
// ------------------------------------------------------------

/** Get a `Track` as a string. */
export const getTrackAsString = (track: TrackInterface) => {
  return JSON.stringify(track);
};

// ------------------------------------------------------------
// Track Map Properties
// ------------------------------------------------------------

/** Get the list of top level tracks. */
export const getTopLevelTracks = (trackMap: TrackMap) => {
  return Object.values(trackMap).filter((t) => !t.parentId);
};

/** Get the list of ordered track IDs. */
export const getOrderedTrackIds = (trackMap: TrackMap) => {
  const topLevelTracks = getTopLevelTracks(trackMap);
  const trackIds: TrackId[] = [];

  // Recursively add all children of a track
  const addChildren = (children: TrackId[]) => {
    if (!children?.length) return;
    children.forEach((trackId) => {
      const node = trackMap[trackId];
      if (!node) return;
      trackIds.push(trackId);
      addChildren(node.trackIds);
    });
  };

  // Add all tracks from the top level
  topLevelTracks.forEach((track) => {
    trackIds.push(track.id);
    addChildren(track.trackIds);
  });

  // Return the track IDs
  return trackIds;
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
  const topLevelTracks = getTopLevelTracks(trackMap);
  const track = trackMap[id];
  if (!track) return -1;

  // If the track is a scale track, try to find it in the top level
  if (isScaleTrack(track)) {
    const topLevelIndex = topLevelTracks.findIndex((track) => track.id === id);
    if (topLevelIndex > -1) return topLevelIndex;
  }

  // Otherwise, return the index of the track in its parent
  const parent = getValueByKey(trackMap, track.parentId);
  return parent?.trackIds.indexOf(track.id) ?? -1;
};

/** Get the label of a track. */
export const getTrackLabel = (id: TrackId, trackMap: TrackMap) => {
  const track = trackMap[id];
  if (!track) return "";

  // Return just the index if the track is in the top level
  const trackIndex = getTrackIndex(id, trackMap) + 1;
  if (!track?.parentId || trackIndex === 0) return `${trackIndex}`;

  // Otherwise, use all track parents to get the label
  const topLevelTracks = getTopLevelTracks(trackMap);
  const ancestorIds = getTrackAncestorIds(id, trackMap);
  const trackIds = [...ancestorIds, id];

  // Get the index of the root track
  const rootId = trackIds[0];
  const rootIndex = topLevelTracks.findIndex((t) => rootId === t.id) + 1;

  // Get the letters of the rest of the tracks
  const rest = trackIds.slice(1);
  const restLetters = rest.map((track) => {
    const index = getTrackIndex(track, trackMap);
    return numberToLower(index);
  });

  // Return the label
  return `${rootIndex}${restLetters.join("")}`;
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

/** Get the descendant IDs of a track by ID. */
export const getTrackDescendantIds = (id: TrackId, trackMap: TrackMap) => {
  const tracks = Object.values(trackMap);
  const descendantIds: TrackId[] = [];
  const children = tracks.filter((track) => track.parentId === id);
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    descendantIds.push(child.id);
    descendantIds.push(...getTrackDescendantIds(child.id, trackMap));
  }
  return descendantIds;
};
