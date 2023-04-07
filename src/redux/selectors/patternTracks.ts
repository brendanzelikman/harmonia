import { createSelector } from "reselect";
import { RootState } from "redux/store";
import { TrackId } from "types/tracks";
import { selectScales } from "./scales";
import { selectScaleTracks } from "./scaleTracks";

// Select the ID of a track
const selectTrackId = (state: RootState, id: TrackId) => id;

// Select all pattern tracks
export const selectPatternTracks = createSelector(
  [(state: RootState) => state.timeline.present.patternTracks],
  (patternTracks) => patternTracks.allIds.map((id) => patternTracks.byId[id])
);

// Select all pattern track IDs
export const selectPatternTrackIds = (state: RootState) => {
  return state.timeline.present.patternTracks.allIds;
};

// Select a specific pattern track
export const selectPatternTrack = createSelector(
  [selectPatternTracks, selectTrackId],
  (tracks, id) => tracks.find((track) => track.id === id)
);

// Select the scale of a pattern track with respect to its scale track
export const selectPatternTrackScale = createSelector(
  [selectPatternTrack, selectScaleTracks, selectScales],
  (track, scaleTracks, scales) => {
    if (!track) return;
    const scaleTrack = scaleTracks.find((s) => s.id === track.scaleTrackId);
    if (!scaleTrack) return;
    return scales.find((scale) => scale.id === scaleTrack.scaleId);
  }
);
