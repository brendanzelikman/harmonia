import { Project } from "types/Project";
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
import { getTrackTranspositions } from "types/TrackHierarchy";
import {
  selectScaleTracks,
  selectScaleTrackMap,
  selectScaleTrackById,
} from "../ScaleTrack/ScaleTrackSelectors";
import {
  selectPatternTracks,
  selectPatternTrackMap,
  selectPatternTrackById,
} from "../PatternTrack/PatternTrackSelectors";
import { selectTranspositionMap } from "../Transposition/TranspositionSelectors";
import { selectTrackHierarchy, selectTrackNodeMap } from "../TrackHierarchy";
import { createDeepEqualSelector } from "redux/util";
import {
  NestedScaleMap,
  applyTranspositionToNestedScale,
  chromaticScale,
} from "types/Scale";
import { selectScaleMap } from "../Scale/ScaleSelectors";
import { numberToLower, numberToUpper } from "utils";

/**
 * Select the track map from the store.
 * @param project - The project.
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
 * @param project - The project.
 * @returns A list of tracks.
 */
export const selectTracks = createSelector(
  [selectScaleTracks, selectPatternTracks],
  (scaleTracks, patternTracks): Track[] => [...scaleTracks, ...patternTracks]
);

/**
 * Select a specific track by ID from the store.
 * @param project - The project.
 * @param id - The ID of the track.
 * @returns The track or undefined.
 */
export const selectTrackById = (project: Project, id?: TrackId) => {
  const trackMap = selectTrackMap(project);
  return getProperty(trackMap, id);
};

/**
 * Select all track IDs ordered by index from the store.
 * @param project - The project.
 * @returns A list of track IDs.
 */
export const selectOrderedTrackIds = createDeepEqualSelector(
  [selectTrackHierarchy],
  (hierarchy) => {
    // Initialize the ordered tracks
    const { topLevelIds, byId } = hierarchy;
    const orderedTrackIds: TrackId[] = [];

    // Recursively add all children of a track
    const addChildren = (children: TrackId[]) => {
      if (!children?.length) return;
      children.forEach((trackId) => {
        const node = byId[trackId];
        if (!node) return;
        orderedTrackIds.push(trackId);
        addChildren(node.trackIds);
      });
    };

    // Add the scale tracks from the top level
    for (const trackId of topLevelIds) {
      const node = byId[trackId];
      if (!node) continue;
      orderedTrackIds.push(trackId);
      addChildren(node.trackIds);
    }
    return orderedTrackIds;
  }
);

/**
 * Select all tracks ordered by index from the store.
 * @param project - The project.
 * @returns A list of tracks.
 */
export const selectOrderedTracks = createDeepEqualSelector(
  [selectTrackMap, selectOrderedTrackIds],
  (trackMap, orderedTrackIds) => getProperties(trackMap, orderedTrackIds)
);

/**
 * Select the index of a track by ID from the store.
 * @param project - The project.
 * @param id - The ID of the track.
 * @returns The index of the track or -1 if not found.
 */
export const selectTrackIndexById = (project: Project, id?: TrackId) => {
  if (!id) return -1;
  const hierarchy = selectTrackHierarchy(project);
  const track = selectTrackById(project, id);
  if (!track) return -1;

  // If the track is a scale track, try to find it in the top level
  if (isScaleTrack(track)) {
    const topLevelIndex = hierarchy.topLevelIds.indexOf(track.id);
    if (topLevelIndex > -1) return topLevelIndex;
  }

  // Otherwise, return the index of the track in its parent
  const parent = getProperty(hierarchy.byId, track.parentId);
  return parent ? parent.trackIds.indexOf(track.id) : -1;
};

/**
 * Select the label of a track by ID from the store.
 * @param project - The project.
 * @param id - The ID of the track.
 * @returns The label of the track or undefined if not found.
 */
export const selectTrackLabelById = (project: Project, id?: TrackId) => {
  if (!id) return undefined;

  // Return just the index if the track is in the top level
  const trackIndex = selectTrackIndexById(project, id) + 1;
  const hierarchy = selectTrackHierarchy(project);
  if (hierarchy.topLevelIds.includes(id)) return trackIndex;

  // Otherwise, use all track parents to get the label
  const parents = selectTrackParents(project, id);
  const patternTrack = selectPatternTrackById(project, id);
  const tracks = !!patternTrack ? [...parents, patternTrack] : parents;
  const root = tracks[0];
  const rest = tracks.slice(1);

  // Get the index of the root and the letters of the rest
  const rootIndex = hierarchy.topLevelIds.indexOf(root.id) + 1;
  const restLetters = rest.map((track) => {
    const index = selectTrackIndexById(project, track.id);
    return numberToLower(index);
  });

  // Return the label
  return `${rootIndex}${restLetters.join("")}`;
};

/**
 * Selects the parent tracks of a track.
 * @param project - The project.
 * @param id - The ID of the track.
 * @returns An array of parent tracks.
 */
export const selectTrackParents = (project: Project, id?: TrackId) => {
  const track = selectTrackById(project, id);
  if (!track) return [];
  const trackMap = selectTrackMap(project);
  return getTrackParents(track, trackMap);
};

/**
 * Selects the children of a track.
 * @param project - The project.
 * @param id - The ID of the track.
 * @returns An array of child tracks.
 */
export const selectTrackChildren = (project: Project, id?: TrackId) => {
  const track = selectTrackById(project, id);
  if (!track) return [];
  const trackMap = selectTrackMap(project);
  const trackNodeMap = selectTrackNodeMap(project);
  return getTrackChildren(track, trackMap, trackNodeMap);
};

/**
 * Select the transpositions of a track by ID from the store.
 * @param project - The project.
 * @param id - The ID of the track.
 * @returns The transpositions of the track.
 */
export const selectTrackTranspositions = (project: Project, id: TrackId) => {
  const track = selectTrackById(project, id);
  if (!track) return [];
  const transpositionMap = selectTranspositionMap(project);
  const trackNodeMap = selectTrackNodeMap(project);
  return getTrackTranspositions(track, transpositionMap, trackNodeMap);
};

/**
 * Selects the transpositions of the parent of a track.
 * @param project - The project.
 * @param id - The ID of the track.
 * @returns An array of transpositions.
 */
export const selectTrackParentTranspositions = (
  project: Project,
  id: TrackId
) => {
  const track = selectTrackById(project, id);
  if (!track) return [];
  const trackMap = selectTrackMap(project);
  const transpositionMap = selectTranspositionMap(project);
  const trackNodeMap = selectTrackNodeMap(project);
  const parents = getTrackParents(track, trackMap);
  return parents.map((parent) =>
    getTrackTranspositions(parent, transpositionMap, trackNodeMap)
  );
};

/**
 * Select the scale track of a track by ID from the store.
 * * If the track is a scale track, return itself.
 * * If the track is a pattern track, return its parent.
 * @param project The project.
 * @param id The ID of the track.
 * @returns The scale track or undefined if not found.
 */
export const selectTrackScaleTrack = (
  project: Project,
  id?: TrackId
): ScaleTrack | undefined => {
  const track = selectTrackById(project, id);
  if (!track) return undefined;
  if (isScaleTrack(track)) return track;
  if (!track.parentId) return undefined;
  return selectScaleTrackById(project, track.parentId);
};

/**
 * Select the scale of a specific track by ID from the store.
 * @param project The project.
 * @param id The ID of the track.
 * @returns The scale or undefined if not found.
 */
export const selectTrackScale = (project: Project, id?: TrackId) => {
  const track = selectTrackById(project, id);
  const scaleTrackMap = selectScaleTrackMap(project);
  const scaleMap = selectScaleMap(project);
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
 * @param project The project.
 * @param trackId The ID of the track.
 * @param tick The tick.
 * @returns The scale or the chromatic scale if not found.
 */
export const selectTrackScaleAtTick = (
  project: Project,
  trackId: TrackId,
  tick: Tick = 0
) => {
  const track = selectTrackById(project, trackId);
  const scaleTrack = selectTrackScaleTrack(project, trackId);
  const scaleTrackMap = selectScaleTrackMap(project);
  if (!track || !scaleTrack) return chromaticScale;

  // Get the track scale and transpositions
  const scaleMap = selectScaleMap(project);
  const scale = getProperty(scaleMap, scaleTrack.scaleId);
  const transpositions = selectTrackTranspositions(project, trackId);
  if (!scale) return chromaticScale;

  // Get the track's parents and their transpositions
  const parents = selectTrackParents(project, trackId);
  const parentTranspositions = selectTrackParentTranspositions(
    project,
    trackId
  );

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
 * `TrackHierarchy` type.
 */
export interface TrackInfoRecord extends NormalizedState<TrackId, TrackInfo> {
  topLevelIds: TrackId[];
}

/**
 * Select the dependencies of a track as a simplified `TrackInfoRecord`.
 * @param project - The project.
 * @param id - The ID of the track.
 * @returns The `TrackInfoRecord`.
 */
export const selectTrackInfoRecord = createDeepEqualSelector(
  [selectTrackHierarchy],
  (trackHierarchy): TrackInfoRecord => ({
    ...trackHierarchy,
    byId: Object.keys(trackHierarchy.byId).reduce((acc, id) => {
      const track = trackHierarchy.byId[id];
      const { trackIds, type, depth } = track;
      return { ...acc, [id]: { id, trackIds, type, depth } };
    }, {} as Record<TrackId, TrackInfo>),
  })
);
