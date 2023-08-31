import { createSelector } from "reselect";
import { RootState } from "redux/store";
import { TrackId } from "types/tracks";
import { getSampler } from "types/instrument";
import { Sampler } from "tone";

// Select the ID of a track
const selectTrackId = (state: RootState, id: TrackId) => id;
export const selectPatternTrackMap = (state: RootState) =>
  state.timeline.present.patternTracks.byId;
export const selectPatternTrackIds = (state: RootState) =>
  state.timeline.present.patternTracks.allIds;

// Select all pattern tracks
export const selectPatternTracks = createSelector(
  [selectPatternTrackIds, selectPatternTrackMap],
  (ids, tracks) => ids.map((id) => tracks[id])
);

// Select a specific pattern track
export const selectPatternTrack = createSelector(
  [selectPatternTrackMap, selectTrackId],
  (tracks, id) => tracks[id]
);

// Select all pattern track samplers
export const selectPatternTrackSamplers = createSelector(
  [selectPatternTracks],
  (tracks) => {
    return tracks.reduce((acc, cur) => {
      if (!cur?.id) return acc;
      const sampler = getSampler(cur.id);
      if (!sampler) return acc;
      return { ...acc, [cur.id]: sampler };
    }, {} as Record<TrackId, Sampler>);
  }
);
