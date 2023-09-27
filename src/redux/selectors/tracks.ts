import { RootState } from "redux/store";
import { createSelector } from "reselect";
import { INSTRUMENTS } from "types/instrument";
import {
  Track,
  TrackId,
  TrackType,
  createScaleTrackMap,
  getScaleTrackScale,
  getTrackParents,
  isScaleTrack,
} from "types/tracks";
import {
  getLastTransposition,
  transposeTracksAtTick,
  applyTranspositionToScaleTrack,
} from "types/transposition";
import { Tick } from "types/units";
import {
  selectPatternTrack,
  selectPatternTrackIds,
  selectPatternTracks,
} from "./patternTracks";
import {
  selectScaleTrack,
  selectScaleTrackIds,
  selectScaleTrackMap,
  selectScaleTracks,
} from "./scaleTracks";
import { selectTranspositionMap } from "./transpositions";
import { getTrackTranspositions } from "types/session";

// Select the ID of a track
export const selectTrackId = (state: RootState, id?: TrackId) => id;

// Select all tracks from the store.
export const selectTracks = createSelector(
  [selectScaleTracks, selectPatternTracks],
  (scaleTracks, patternTracks) => [...scaleTracks, ...patternTracks]
);

// Select all track IDs from the store.
export const selectTrackIds = createSelector(
  [selectScaleTrackIds, selectPatternTrackIds],
  (scaleTrackIds, patternTrackIds) => [...scaleTrackIds, ...patternTrackIds]
);

// Select a specific track from the store.
export const selectTrack = createSelector(
  [selectScaleTrack, selectPatternTrack],
  (scaleTrack, patternTrack) => (scaleTrack || patternTrack) as Track
);

// Select a track scale from the store
export const selectTrackScale = createSelector(
  [selectTrack, selectScaleTrackMap],
  (track, scaleTracks) => {
    if (!track) return;
    if (isScaleTrack(track)) return getScaleTrackScale(track, scaleTracks);
    if (!track.parentId) return;
    const scaleTrack = scaleTracks[track.parentId];
    if (!scaleTrack) return;
    return getScaleTrackScale(scaleTrack, scaleTracks);
  }
);

export const selectSessionMap = (state: RootState) =>
  state.session.present.sessionMap;

// Select the index of a track
export const selectTrackIndex = createSelector(
  [selectTrack, selectSessionMap],
  (track, sessionMap) => {
    if (!track) return -1;
    if (isScaleTrack(track)) {
      const topLevelIndex = sessionMap.topLevelIds.indexOf(track.id);
      if (topLevelIndex !== 0) return topLevelIndex;
    }
    if (!track.parentId) return -1;
    const parent = sessionMap.byId[track.parentId];
    return parent.trackIds.indexOf(track.id);
  }
);

// Select an instrument by track ID
export const selectInstrument = (state: RootState, trackId: TrackId) => {
  return INSTRUMENTS[trackId];
};

// Select the transpositions of a track
export const selectTrackTranspositions = createSelector(
  [selectTrack, selectTranspositionMap, selectSessionMap],
  (track, transpositions, sessionMap) => {
    return getTrackTranspositions(track, transpositions, sessionMap);
  }
);

// Select the scale tracks of a track in descending order
export const selectTrackParents = createSelector(
  [selectTrack, selectScaleTrackMap],
  (track, scaleTracks) => {
    return getTrackParents(track, scaleTracks);
  }
);

// Select the transpositions of the parent of a tarck
export const selectTrackParentTranspositions = createSelector(
  [selectTrackParents, selectTranspositionMap, selectSessionMap],
  (parents, transpositions, sessionMap) => {
    return parents.map((track) =>
      getTrackTranspositions(track, transpositions, sessionMap)
    );
  }
);

// Select the scale track of a track
export const selectTrackScaleTrack = createSelector(
  [selectTrack, selectScaleTrackMap],
  (track, scaleTracks) => {
    if (!track) return undefined;
    if (isScaleTrack(track)) return track;
    if (!track.parentId) return undefined;
    return scaleTracks[track.parentId];
  }
);

// Select the scale of a scale track at a given tick
export const selectTrackScaleAtTick = createSelector(
  [
    selectTrackScaleTrack,
    selectTrackTranspositions,
    selectTrackParents,
    selectTrackParentTranspositions,
    (state: RootState, trackId?: string, tick: Tick = 0) => tick + 1,
  ],
  (track, transpositions, parents, parentTranspositions, tick) => {
    if (!track) return;

    // Transpose the parent tracks at the current tick
    const transposedParents = transposeTracksAtTick(
      parents,
      parentTranspositions,
      tick
    );

    // Transpose the scale track at the current tick
    const transposition = getLastTransposition(transpositions, tick, false);
    const transposedScaleTrack = applyTranspositionToScaleTrack(
      track,
      transposition
    );

    // Transpose the scale track along the transposed parent scales
    const scaleTracks = createScaleTrackMap(transposedParents);
    return getScaleTrackScale(transposedScaleTrack, scaleTracks);
  }
);

// The essential information needed to render a track
type TrackInfo = {
  id: TrackId;
  trackIds: TrackId[];
  type: TrackType;
  depth: number;
};

type TrackInfoRecord = {
  byId: Record<TrackId, TrackInfo>;
  allIds: TrackId[];
  topLevelIds: TrackId[];
};

// Select the session map as a simplified record
export const selectTrackDependencies = createSelector(
  [selectSessionMap],
  (sessionMap): TrackInfoRecord => ({
    ...sessionMap,
    byId: Object.keys(sessionMap.byId).reduce((acc, id) => {
      const track = sessionMap.byId[id];
      const { trackIds, type, depth } = track;
      acc[id] = { id, trackIds, type, depth };
      return acc;
    }, {} as Record<TrackId, TrackInfo>),
  })
);
