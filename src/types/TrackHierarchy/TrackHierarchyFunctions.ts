import { initializeState } from "../util";
import { Clip, ClipMap, isClip, isClipMap } from "../Clip";
import { Track, TrackId, isTrack } from "../Track";
import {
  Transposition,
  TranspositionMap,
  isTransposition,
  isTranspositionMap,
} from "../Transposition";
import {
  TrackHierarchy,
  TrackNode,
  TrackNodeMap,
  isTrackNodeMap,
} from "./TrackHierarchyTypes";

/**
 * Create a `TrackHierarchy` from the given tracks, clips, and transpositions.
 * @param tracks - The tracks to include.
 * @param clips - The clips to include.
 * @param transpositions - The transpositions to include.
 * @returns A `TrackHierarchy` created from the tracks, clips, and transpositions. If an invalid configuration is provided, the hierarchy will be empty.
 */
export const createTrackHierarchy = (props: {
  tracks: Track[];
  clips: Clip[];
  transpositions: Transposition[];
}): TrackHierarchy => {
  // Initialize the track hierarchy
  const hierarchy = {
    ...initializeState<TrackId, TrackNode>(),
    topLevelIds: [] as string[],
  };
  const { tracks, clips, transpositions } = props;

  // Return early if any of the parameters are invalid
  if (tracks.some((track) => !isTrack(track))) return hierarchy;
  if (clips.some((clip) => !isClip(clip))) return hierarchy;
  if (transpositions.some((t) => !isTransposition(t))) return hierarchy;

  // Initialize the loop variables
  let trackIds = 0;
  let previousIds = 0;

  // Iterate through the tracks and create corresponding nodes
  while (trackIds < tracks.length) {
    tracks.forEach((track, i) => {
      const { id, type, parentId } = track;

      // If the track is the first track, check if the number of tracks has changed. If not, return early.
      if (i === 0) {
        if (trackIds > 0 && previousIds === trackIds) {
          trackIds = tracks.length;
          return;
        } else {
          previousIds = trackIds;
        }
      }
      // If the track already exists, return.
      if (hierarchy.byId[id]) return;

      // Create the track node
      const node: TrackNode = {
        id,
        type,
        depth: 0,
        trackIds: [],
        clipIds: [],
        transpositionIds: [],
      };

      // If the track is a top-level track, add it to the top-level IDs.
      if (!parentId) {
        hierarchy.topLevelIds.push(id);
      } else {
        // Otherwise, add it to the parent track's track IDs and set the depth.
        const parentNode = hierarchy.byId[parentId];
        if (!parentNode) return;
        parentNode.trackIds.push(id);
        node.depth = parentNode.depth + 1;
      }

      // Add the node to the hierarchy and increment the number of track IDs.
      hierarchy.byId[id] = node;
      hierarchy.allIds.push(id);
      trackIds++;
    });
  }

  // Add all clips to their respective tracks.
  clips.forEach((clip) => {
    const { id, trackId } = clip;
    const node = hierarchy.byId[trackId];
    if (!node) return;
    node.clipIds.push(id);
  });

  // Add all transpositions to their respective tracks.
  transpositions.forEach((transposition) => {
    const { id, trackId } = transposition;
    const node = hierarchy.byId[trackId];
    if (!node) return;
    node.transpositionIds.push(id);
  });

  // Return the hierarchy.
  return { ...hierarchy };
};

/**
 * Get the clips of a track in the node map, sorted by tick.
 * @param track The Track object.
 * @param clipMap The ClipMap object.
 * @param trackNodeMap The TrackNodeMap object.
 * @returns The clips of the track. If any parameter is invalid, return an empty array.
 */
export const getTrackClips = (
  track: Track,
  clipMap: ClipMap,
  trackNodeMap: TrackNodeMap
) => {
  // Return an empty array if any parameter is invalid
  if (!isTrack(track)) return [];
  if (!isClipMap(clipMap)) return [];
  if (!isTrackNodeMap(trackNodeMap)) return [];

  // Get the track node from the track hierarchy
  const trackNode = trackNodeMap[track.id];
  if (!trackNode) return [];

  // Map the node's clip IDs to clips
  const trackClipIds = trackNode.clipIds;
  const trackClips = trackClipIds.map((id) => clipMap[id]);

  // Sort the clips by tick
  const sortedClips = trackClips.sort((a, b) => a.tick - b.tick);

  // Return the sorted clips
  return sortedClips;
};

/**
 * Get the transpositions of a track in the node map, sorted by tick.
 * @param track The Track object.
 * @param transpositionMap The TranspositionMap object.
 * @param trackNodeMap The trackNodeMap object.
 * @returns The transpositions of the track. If any parameter is invalid, return an empty array.
 */
export const getTrackTranspositions = (
  track: Track,
  transpositionMap: TranspositionMap,
  trackNodeMap: TrackNodeMap
) => {
  // Return an empty array if any parameter is invalid
  if (!isTrack(track)) return [];
  if (!isTranspositionMap(transpositionMap)) return [];
  if (!isTrackNodeMap(trackNodeMap)) return [];

  // Get the track node from the track hierarchy
  const trackNode = trackNodeMap[track.id];
  if (!trackNode) return [];

  // Map the node's transposition IDs to transpositions
  const trackTranspositionIds = trackNode.transpositionIds;
  const trackTranspositions = trackTranspositionIds.map(
    (id) => transpositionMap[id]
  );

  // Sort the transpositions by tick
  const sortedTranspositions = trackTranspositions.sort(
    (a, b) => b.tick - a.tick
  );

  // Return the sorted transpositions
  return sortedTranspositions;
};
