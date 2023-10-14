import { RootState } from "redux/store";
import { createSelector } from "reselect";
import { Tick } from "types/units";
import {
  NormalizedState,
  createMap,
  getProperties,
  getProperty,
} from "types/util";
import {
  Track,
  TrackId,
  TrackMap,
  TrackType,
  getTrackChildren,
  getTrackParents,
  getTransposedScaleTrackScalesAtTick,
} from "types/Track";
import { ScaleTrack, getScaleTrackScale, isScaleTrack } from "types/ScaleTrack";
import { getLastTransposition } from "types/Transposition";
import { getTrackTranspositions } from "types/Session";
import {
  selectScaleTracks,
  selectScaleTrackMap,
  selectScaleTrackById,
} from "../ScaleTrack";
import { selectPatternTracks, selectPatternTrackMap } from "../PatternTrack";
import { selectTranspositionMap } from "../Transposition";
import { selectSession, selectSessionMap } from "../Session";
import { createDeepEqualSelector } from "redux/util";
import {
  NestedScaleMap,
  applyTranspositionToNestedScale,
  chromaticScale,
} from "types/Scale";
import { selectScaleMap } from "../Scale";

/**
 * Select the track map from the store.
 * @param state - The root state.
 * @returns The track map.
 */
export const selectTrackMap = createSelector(
  [selectScaleTrackMap, selectPatternTrackMap],
  (scaleTrackMap, patternTrackMap): TrackMap => ({
    ...scaleTrackMap,
    ...patternTrackMap,
  })
);

/**
 * Select all tracks from the store.
 * @param state - The root state.
 * @returns A list of tracks.
 */
export const selectTracks = createSelector(
  [selectScaleTracks, selectPatternTracks],
  (scaleTracks, patternTracks): Track[] => [...scaleTracks, ...patternTracks]
);

/**
 * Select a specific track by ID from the store.
 * @param state - The root state.
 * @param id - The ID of the track.
 * @returns The track or undefined.
 */
export const selectTrackById = (state: RootState, id?: TrackId) => {
  const trackMap = selectTrackMap(state);
  return getProperty(trackMap, id);
};

/**
 * Select all track IDs ordered by index from the store.
 * @param state - The root state.
 * @returns A list of track IDs.
 */
export const selectOrderedTrackIds = createDeepEqualSelector(
  [selectSession],
  (sessionMap) => {
    // Initialize the ordered tracks
    const { topLevelIds, byId } = sessionMap;
    const orderedTrackIds: TrackId[] = [];

    // Recursively add all children of a track
    const addChildren = (children: TrackId[]) => {
      if (!children?.length) return;
      children.forEach((trackId) => {
        const entity = byId[trackId];
        if (!entity) return;
        orderedTrackIds.push(trackId);
        addChildren(entity.trackIds);
      });
    };

    // Add the scale tracks from the top level
    for (const trackId of topLevelIds) {
      const entity = byId[trackId];
      if (!entity) continue;
      orderedTrackIds.push(trackId);
      addChildren(entity.trackIds);
    }
    return orderedTrackIds;
  }
);

/**
 * Select all tracks ordered by index from the store.
 * @param state - The root state.
 * @returns A list of tracks.
 */
export const selectOrderedTracks = createDeepEqualSelector(
  [selectTrackMap, selectOrderedTrackIds],
  (trackMap, orderedTrackIds) => getProperties(trackMap, orderedTrackIds)
);

/**
 * Select the index of a track by ID from the store.
 * @param state - The root state.
 * @param id - The ID of the track.
 * @returns The index of the track or -1 if not found.
 */
export const selectTrackIndexById = (state: RootState, id: TrackId) => {
  const session = selectSession(state);
  const track = selectTrackById(state, id);
  if (!track) return -1;

  // If the track is a scale track, try to find it in the top level
  if (isScaleTrack(track)) {
    const topLevelIndex = session.topLevelIds.indexOf(track.id);
    if (topLevelIndex !== 0) return topLevelIndex;
  }

  // Otherwise, return the index of the track in its parent
  const parent = getProperty(session.byId, track.parentId);
  return parent ? parent.trackIds.indexOf(track.id) : -1;
};

/**
 * Selects the parent tracks of a track.
 * @param state - The root state.
 * @param id - The ID of the track.
 * @returns An array of parent tracks.
 */
export const selectTrackParents = (state: RootState, id?: TrackId) => {
  const track = selectTrackById(state, id);
  if (!track) return [];
  const trackMap = selectTrackMap(state);
  return getTrackParents(track, trackMap);
};

/**
 * Selects the children of a track.
 * @param state - The root state.
 * @param id - The ID of the track.
 * @returns An array of child tracks.
 */
export const selectTrackChildren = (state: RootState, id?: TrackId) => {
  const track = selectTrackById(state, id);
  if (!track) return [];
  const trackMap = selectTrackMap(state);
  const sessionMap = selectSessionMap(state);
  return getTrackChildren(track, trackMap, sessionMap);
};

/**
 * Select the transpositions of a track by ID from the store.
 * @param state - The root state.
 * @param id - The ID of the track.
 * @returns The transpositions of the track.
 */
export const selectTrackTranspositions = (state: RootState, id: TrackId) => {
  const track = selectTrackById(state, id);
  if (!track) return [];
  const transpositionMap = selectTranspositionMap(state);
  const sessionMap = selectSessionMap(state);
  return getTrackTranspositions(track, transpositionMap, sessionMap);
};

/**
 * Selects the transpositions of the parent of a track.
 * @param state - The root state.
 * @param id - The ID of the track.
 * @returns An array of transpositions.
 */
export const selectTrackParentTranspositions = (
  state: RootState,
  id: TrackId
) => {
  const track = selectTrackById(state, id);
  if (!track) return [];
  const trackMap = selectTrackMap(state);
  const transpositionMap = selectTranspositionMap(state);
  const sessionMap = selectSessionMap(state);
  const parents = getTrackParents(track, trackMap);
  return parents.map((parent) =>
    getTrackTranspositions(parent, transpositionMap, sessionMap)
  );
};

/**
 * Select the scale track of a track by ID from the store.
 * * If the track is a scale track, return itself.
 * * If the track is a pattern track, return its parent.
 * @param state The root state.
 * @param id The ID of the track.
 * @returns The scale track or undefined if not found.
 */
export const selectTrackScaleTrack = (
  state: RootState,
  id?: TrackId
): ScaleTrack | undefined => {
  const track = selectTrackById(state, id);
  if (!track) return undefined;
  if (isScaleTrack(track)) return track;
  if (!track.parentId) return undefined;
  return selectScaleTrackById(state, track.parentId);
};

/**
 * Select the scale of a specific track by ID from the store.
 * @param state The root state.
 * @param id The ID of the track.
 * @returns The scale or undefined if not found.
 */
export const selectTrackScale = (state: RootState, id?: TrackId) => {
  const track = selectTrackById(state, id);
  const scaleTrackMap = selectScaleTrackMap(state);
  const scaleMap = selectScaleMap(state);
  if (!track) return;

  // If the track is a scale track, return its scale
  if (isScaleTrack(track)) {
    return getScaleTrackScale(track, scaleTrackMap, scaleMap);
  }

  // Otherwise, return the scale of its parent
  const scaleTrack = getProperty(scaleTrackMap, track.parentId);
  return getScaleTrackScale(scaleTrack, scaleTrackMap, scaleMap);
};

/**
 * Select the scale of a track at a given tick (accounting for transpositions).
 * @param state The root state.
 * @param trackId The ID of the track.
 * @param tick The tick.
 * @returns The scale or the chromatic scale if not found.
 */
export const selectTrackScaleAtTick = (
  state: RootState,
  trackId: TrackId,
  tick: Tick = 0
) => {
  const track = selectTrackById(state, trackId);
  const scaleTrack = selectTrackScaleTrack(state, trackId);
  const scaleTrackMap = selectScaleTrackMap(state);
  if (!track || !scaleTrack) return chromaticScale;

  // Get the track scale and transpositions
  const scaleMap = selectScaleMap(state);
  const scale = getProperty(scaleMap, scaleTrack.scaleId);
  const transpositions = selectTrackTranspositions(state, trackId);
  if (!scale) return chromaticScale;

  // Get the track's parents and their transpositions
  const parents = selectTrackParents(state, trackId);
  const parentTranspositions = selectTrackParentTranspositions(state, trackId);

  // Transpose the parents at the current tick
  const currentTick = tick + 1;
  const transposedParents = getTransposedScaleTrackScalesAtTick(
    parents,
    parentTranspositions,
    scaleMap,
    currentTick
  );

  // Transpose the scale track at the current tick
  const transposition = getLastTransposition(
    transpositions,
    currentTick,
    false
  );
  const transposedScale = applyTranspositionToNestedScale(scale, transposition);

  // Transpose the scale along the transposed parent scales
  const transposedScaleMap = createMap<NestedScaleMap>([
    ...transposedParents,
    transposedScale,
  ]);
  return getScaleTrackScale(scaleTrack, scaleTrackMap, transposedScaleMap);
};

/**
 * The `TrackInfo` type stores essential information needed to render a track.
 */
export type TrackInfo = {
  id: TrackId;
  trackIds: TrackId[];
  type: TrackType;
  depth: number;
};

/**
 * The `TrackInfoRecord` type stores a map of `TrackInfo` objects similarly to the
 * `Session` type.
 */
export interface TrackInfoRecord extends NormalizedState<TrackId, TrackInfo> {
  topLevelIds: TrackId[];
}

/**
 * Select the dependencies of a track as a simplified `TrackInfoRecord`.
 * @param state - The root state.
 * @param id - The ID of the track.
 * @returns The `TrackInfoRecord`.
 */
export const selectTrackInfoRecord = createDeepEqualSelector(
  [selectSession],
  (session): TrackInfoRecord => ({
    ...session,
    byId: Object.keys(session.byId).reduce((acc, id) => {
      const track = session.byId[id];
      const { trackIds, type, depth } = track;
      return { ...acc, [id]: { id, trackIds, type, depth } };
    }, {} as Record<TrackId, TrackInfo>),
  })
);
