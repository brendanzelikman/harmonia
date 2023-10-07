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
  Session,
  SessionEntity,
  SessionMap,
  isSession,
  isSessionMap,
} from "./SessionTypes";

/**
 * Create a session map from tracks, clips, and transpositions.
 * @param tracks - The tracks to include.
 * @param clips - The clips to include.
 * @param transpositions - The transpositions to include.
 * @returns A session map created from the tracks, clips, and transpositions. If an invalid configuration is provided, return an empty session map.
 */
export const createSession = (props: {
  tracks: Track[];
  clips: Clip[];
  transpositions: Transposition[];
}): Session => {
  // Initialize the session map
  const session = {
    ...initializeState<TrackId, SessionEntity>(),
    topLevelIds: [] as string[],
  };
  const { tracks, clips, transpositions } = props;

  // Return early if any of the parameters are invalid
  if (tracks.some((track) => !isTrack(track))) return session;
  if (clips.some((clip) => !isClip(clip))) return session;
  if (transpositions.some((t) => !isTransposition(t))) return session;

  // Initialize the loop variables
  let sessionIds = 0;
  let previousIds = 0;

  // Iterate through the tracks and create session entities
  while (sessionIds < tracks.length) {
    tracks.forEach((track, i) => {
      const { id, type, parentId } = track;

      // If the track is the first track, check if the number of tracks has changed. If not, return early.
      if (i === 0) {
        if (sessionIds > 0 && previousIds === sessionIds) {
          sessionIds = tracks.length;
          return;
        } else {
          previousIds = sessionIds;
        }
      }
      // If the track already exists, return.
      if (session.byId[id]) return;

      // Create the session entity
      const entity: SessionEntity = {
        id,
        type,
        depth: 0,
        trackIds: [],
        clipIds: [],
        transpositionIds: [],
      };

      // If the track is a top-level track, add it to the top-level IDs.
      if (!parentId) {
        session.topLevelIds.push(id);
      } else {
        // Otherwise, add it to the parent track's track IDs and set the depth.
        const parentEntity = session.byId[parentId];
        if (!parentEntity) return;
        parentEntity.trackIds.push(id);
        entity.depth = parentEntity.depth + 1;
      }

      // Add the entity to the session map and increment the session IDs.
      session.byId[id] = entity;
      session.allIds.push(id);
      sessionIds++;
    });
  }

  // Add all clips to their respective tracks.
  clips.forEach((clip) => {
    const { id, trackId } = clip;
    const entity = session.byId[trackId];
    if (!entity) return;
    entity.clipIds.push(id);
  });

  // Add all transpositions to their respective tracks.
  transpositions.forEach((transposition) => {
    const { id, trackId } = transposition;
    const entity = session.byId[trackId];
    if (!entity) return;
    entity.transpositionIds.push(id);
  });

  // Return the session.
  return { ...session };
};

/**
 * Get the clips of a track in the session.
 * @param track The Track object.
 * @param clipMap The ClipMap object.
 * @param session The Session object.
 * @returns The clips of the track in the session. If any parameter is invalid, return an empty array.
 */
export const getTrackClips = (
  track: Track,
  clipMap: ClipMap,
  sessionMap: SessionMap
) => {
  // Return an empty array if any parameter is invalid
  if (!isTrack(track)) return [];
  if (!isClipMap(clipMap)) return [];
  if (!isSessionMap(sessionMap)) return [];

  // Get the track entity from the session map
  const trackEntity = sessionMap[track.id];
  if (!trackEntity) return [];

  // Map the entity's clip IDs to clips
  const trackClipIds = trackEntity.clipIds;
  const trackClips = trackClipIds.map((id) => clipMap[id]);

  // Sort the clips by tick
  const sortedClips = trackClips.sort((a, b) => a.tick - b.tick);

  // Return the sorted clips
  return sortedClips;
};

/**
 * Get the transpositions of a track in the session map.
 * @param track The Track object.
 * @param transpositionMap The TranspositionMap object.
 * @param sessionMap The SessionMap object.
 * @returns The transpositions of the track in the session map. If any parameter is invalid, return an empty array.
 */
export const getTrackTranspositions = (
  track: Track,
  transpositionMap: TranspositionMap,
  sessionMap: SessionMap
) => {
  // Return an empty array if any parameter is invalid
  if (!isTrack(track)) return [];
  if (!isTranspositionMap(transpositionMap)) return [];
  if (!isSessionMap(sessionMap)) return [];

  // Get the track entity from the session map
  const trackEntity = sessionMap[track.id];
  if (!trackEntity) return [];

  // Map the entity's transposition IDs to transpositions
  const trackTranspositionIds = trackEntity.transpositionIds;
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
