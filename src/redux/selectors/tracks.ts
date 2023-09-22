import { RootState } from "redux/store";
import { createSelector } from "reselect";
import { INSTRUMENTS } from "types/instrument";
import { isScale, rotateScale, transposeScale } from "types/scale";
import {
  ScaleTrack,
  Track,
  TrackId,
  TrackType,
  getScaleTrackScale,
  getTrackParents,
  isPatternTrack,
  isScaleTrack,
} from "types/tracks";
import {
  getChordalTranspose,
  getChromaticTranspose,
  getScalarTranspose,
  getLastTransposition,
  Transposition,
  sortTranspositionOffsets,
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
import { selectScaleMap } from "./scales";
import { SessionMapState } from "redux/slices/sessionMap";

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
  [selectTrack, selectScaleTrackMap, selectScaleMap],
  (track, scaleTracks, scales) => {
    if (!track) return;
    if (isScaleTrack(track)) return getScaleTrackScale(track, { scaleTracks });
    if (!track.parentId) return;
    const scaleTrack = scaleTracks[track.parentId];
    if (!scaleTrack) return;
    return getScaleTrackScale(scaleTrack, { scaleTracks });
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
    const emptyTranspositions: Transposition[] = [];
    if (!track) return emptyTranspositions;

    const transpositionIds = sessionMap.byId[track.id]?.transpositionIds;
    if (!transpositionIds) return emptyTranspositions;
    return transpositionIds
      .map((id) => transpositions[id])
      .filter(Boolean) as Transposition[];
  }
);

// Select the scale track of a track
export const selectTrackScaleTrack = createSelector(
  [selectTrack, selectScaleTrackMap],
  (track, scaleTracks) => {
    if (!track) return;
    if (isScaleTrack(track)) return track;
    if (!track.parentId) return;
    return scaleTracks[track.parentId];
  }
);

// Select the scale tracks of a track in descending order
export const selectTrackParents = createSelector(
  [selectTrack, selectScaleTrackMap],
  (track, scaleTracks) => {
    return getTrackParents(track, { scaleTracks });
  }
);

// Select the scale track transpositions of a track
export const selectScaleTrackTranspositions = createSelector(
  [selectTrack, selectTranspositionMap, selectSessionMap],
  (track, transpositions, sessionMap) => {
    if (!track) return [];
    let trackId = track.id;
    if (isPatternTrack(track)) trackId = track.parentId!;
    const ids = sessionMap.byId[track.id]?.transpositionIds;
    if (!ids) return [];
    return ids
      .map((id) => transpositions[id])
      .filter(Boolean) as Transposition[];
  }
);

// Select the scale of a scale track at a given tick
export const selectTrackScaleAtTick = createSelector(
  [
    selectTrackScaleTrack,
    selectScaleTrackTranspositions,
    selectScaleTrackMap,
    (state: RootState, trackId?: string, tick?: Tick) => tick,
  ],
  (track, trackTranspositions, scaleTracks, tick) => {
    if (!track) return;

    let scale = getScaleTrackScale(track, { scaleTracks });
    const transposition = getLastTransposition(trackTranspositions, tick);
    if (!transposition) return scale;

    const offsets = sortTranspositionOffsets(transposition.offsets);
    for (const id of offsets) {
      if (id === "_chromatic") {
        scale = transposeScale(scale, getChromaticTranspose(transposition));
      } else if (id === "_self") {
        scale = rotateScale(scale, getChordalTranspose(transposition));
      } else {
        scale = transposeScale(scale, getScalarTranspose(transposition, id));
      }
    }

    return scale;
  }
);

export const selectTrackDependencies = createSelector(
  [selectSessionMap],
  (sessionMap) => {
    const dependencies = {
      topLevelIds: [] as string[],
      byId: {} as Record<
        string,
        { id: string; trackIds: string[]; depth: number; type: TrackType }
      >,
      allIds: [] as string[],
    };
    dependencies["topLevelIds"] = sessionMap.topLevelIds;
    dependencies["allIds"] = Object.keys(sessionMap.byId);
    const tracks = Object.values(sessionMap.byId);
    tracks.forEach((track) => {
      dependencies.byId[track.id] = {
        id: track.id,
        trackIds: track.trackIds,
        type: track.type,
        depth: track.depth,
      };
    });
    return dependencies;
  }
);
