import { ScaleTrack, isScaleTrack } from "./scaleTrack";
import { PatternTrack, isPatternTrack } from "./patternTrack";
import { SessionMap } from "./session";

export type Track = ScaleTrack | PatternTrack;
export type TrackId = string;
export type TrackType = "scaleTrack" | "patternTrack" | "defaultTrack";
export type TrackMap = Record<TrackId, Track>;

export interface TrackInterface {
  id: TrackId;
  parentId?: TrackId;
  name: string;
  type: TrackType;
  collapsed?: boolean;
}

export const createTrackTag = (track: TrackInterface): string => {
  return `${track.id}:${track.type}`;
};

// Get the parent scale tracks of a track
export const getTrackParents = (
  track?: Track,
  scaleTracks?: Record<TrackId, ScaleTrack>
): ScaleTrack[] => {
  if (!track || !scaleTracks) return [];
  let parents: ScaleTrack[] = [];
  let parentId = track.parentId;

  // Keep going up parents while there is a parent scale track
  while (parentId) {
    const parent = scaleTracks[parentId];
    if (!parent) break;
    parents = [parent, ...parents];
    parentId = parent.parentId;
  }

  // If the track is a scale track, then add it to the parents
  if (isScaleTrack(track)) parents.push(track);
  return parents;
};

// Get the child scale tracks and pattern tracks of a track
export const getTrackChildren = (
  track?: Track,
  trackMap?: TrackMap,
  sessionMap?: SessionMap
): Track[] => {
  if (!track || !sessionMap || !trackMap) return [];
  if (isPatternTrack(track)) return [];
  const children: Track[] = [];
  const entity = sessionMap.byId[track.id];
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

export * from "./scaleTrack";
export * from "./patternTrack";
