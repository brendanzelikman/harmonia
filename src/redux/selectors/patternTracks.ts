import { createSelector } from "reselect";
import { RootState } from "redux/store";
import { TrackId } from "types/tracks";
import { Sampler } from "tone";
import { INSTRUMENTS } from "types";

// Select the ID of a track
const selectTrackId = (state: RootState, id?: TrackId) => id;

export const selectPatternTrackMap = (state: RootState) =>
  state.session.present.patternTracks.byId;
export const selectPatternTrackIds = (state: RootState) =>
  state.session.present.patternTracks.allIds;

// Select all pattern tracks
export const selectPatternTracks = createSelector(
  [selectPatternTrackIds, selectPatternTrackMap],
  (ids, tracks) => ids.map((id) => tracks[id])
);

// Select a specific pattern track
export const selectPatternTrack = createSelector(
  [selectPatternTrackMap, selectTrackId],
  (tracks, id) => (id ? tracks[id] : undefined)
);

// Select all pattern track samplers
export const selectPatternTrackSamplers = createSelector(
  [selectPatternTracks],
  (tracks) => {
    return tracks.reduce((acc, cur) => {
      if (!cur?.id) return acc;
      const sampler = INSTRUMENTS[cur.id]?.sampler;
      if (!sampler) return acc;
      return { ...acc, [cur.id]: sampler };
    }, {} as Record<TrackId, Sampler>);
  }
);

// Select a specific pattern track sampler by mixer Id
export const selectPatternTrackByMixerId = createSelector(
  [selectPatternTracks, selectTrackId],
  (tracks, mixerId) => {
    return tracks.find((track) => track.mixerId === mixerId);
  }
);
