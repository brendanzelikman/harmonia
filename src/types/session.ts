import { NormalizedState, initializeState } from "redux/util";
import { Clip, ClipId, ClipMap } from "./clip";
import { Track, TrackId, TrackType } from "./tracks";
import {
  Transposition,
  TranspositionId,
  TranspositionMap,
} from "./transposition";

// A session entity refers to a scale or pattern track and its descendants
export interface SessionEntity {
  id: TrackId;
  type: TrackType;
  depth: number;
  trackIds: TrackId[];
  clipIds: ClipId[];
  transpositionIds: TranspositionId[];
}

// The default scale track entity is built from the default scale track
export const defaultScaleTrackEntity: SessionEntity = {
  id: "default-scale-track",
  type: "scaleTrack",
  depth: 0,
  trackIds: ["default-pattern-track"],
  clipIds: [],
  transpositionIds: [],
};
// The default pattern track entity is built from the default pattern track
export const defaultPatternTrackEntity: SessionEntity = {
  id: "default-pattern-track",
  type: "patternTrack",
  depth: 1,
  trackIds: [],
  clipIds: [],
  transpositionIds: [],
};

// The session map uses a normalized state with top-level information
export interface SessionMap extends NormalizedState<TrackId, SessionEntity> {
  topLevelIds: TrackId[];
}

const normalizedSession = initializeState<TrackId, SessionEntity>([
  defaultScaleTrackEntity,
  defaultPatternTrackEntity,
]);

export const defaultSessionMap: SessionMap = {
  ...normalizedSession,
  topLevelIds: [defaultScaleTrackEntity.id],
};

interface CreateSessionProps {
  tracks: Track[];
  clips: Clip[];
  transpositions: Transposition[];
}

export const createSessionMap = ({
  tracks,
  clips,
  transpositions,
}: CreateSessionProps): SessionMap => {
  const sessionMap = initializeState<TrackId, SessionEntity>();
  const topLevelIds: TrackId[] = [];
  let sessionIds = 0;
  let previousIds = 0;
  while (sessionIds < tracks.length) {
    tracks.forEach((track, i) => {
      const { id, type, parentId } = track;
      if (i === 0) {
        if (sessionIds > 0 && previousIds === sessionIds) {
          throw new Error(`Could not create session map.`);
        } else {
          previousIds = sessionIds;
        }
      }
      if (sessionMap.byId[id]) return;
      const entity: SessionEntity = {
        id,
        type,
        depth: 0,
        trackIds: [],
        clipIds: [],
        transpositionIds: [],
      };
      if (!parentId) {
        topLevelIds.push(id);
      } else {
        const parentEntity = sessionMap.byId[parentId];
        if (!parentEntity) return;
        parentEntity.trackIds.push(id);
        entity.depth = parentEntity.depth + 1;
      }
      sessionMap.byId[id] = entity;
      sessionMap.allIds.push(id);
      sessionIds++;
    });
  }
  clips.forEach((clip) => {
    const { id, trackId } = clip;
    const entity = sessionMap.byId[trackId];
    if (!entity) return;
    entity.clipIds.push(id);
  });
  transpositions.forEach((transposition) => {
    const { id, trackId } = transposition;
    const entity = sessionMap.byId[trackId];
    if (!entity) return;
    entity.transpositionIds.push(id);
  });
  return { ...sessionMap, topLevelIds };
};

export const getTrackTranspositions = (
  track?: Track,
  transpositions?: TranspositionMap,
  sessionMap?: SessionMap
) => {
  if (!track || !transpositions || !sessionMap) return [];
  const trackEntity = sessionMap.byId[track.id];
  if (!trackEntity) return [];
  const trackTranspositionIds = trackEntity.transpositionIds;
  const trackTranspositions = trackTranspositionIds
    .map((id) => transpositions[id])
    .filter(Boolean);
  return trackTranspositions.sort((a, b) => b.tick - a.tick);
};

export const getTrackClips = ({
  track,
  clips,
  sessionMap,
}: {
  track: Track;
  clips: ClipMap;
  sessionMap: SessionMap;
}) => {
  const trackEntity = sessionMap.byId[track.id];
  if (!trackEntity) return [];
  const trackClipIds = trackEntity.clipIds;
  const trackClips = trackClipIds.map((id) => clips[id]).filter(Boolean);
  return trackClips.sort((a, b) => a.tick - b.tick);
};
