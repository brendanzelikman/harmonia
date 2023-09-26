import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "redux/store";
import { TrackId, getScaleTrackScale } from "types/tracks";

// Select the ID of a track
const selectTrackId = (state: RootState, id?: TrackId) => id;
export const selectScaleTrackMap = (state: RootState) =>
  state.session.present.scaleTracks.byId;
// Select all scale track IDs
export const selectScaleTrackIds = (state: RootState): TrackId[] => {
  return state.session.present.scaleTracks.allIds;
};

// Select all scale tracks
export const selectScaleTracks = createSelector(
  [selectScaleTrackMap, selectScaleTrackIds],
  (tracks, ids) => ids.map((id) => tracks[id])
);

// Select a specific scale track
export const selectScaleTrack = createSelector(
  [selectScaleTrackMap, selectTrackId],
  (tracks, id) => (id ? tracks[id] : undefined)
);

// Select the scale of a scale track
export const selectScaleTrackScale = createSelector(
  [selectScaleTrack, selectScaleTrackMap],
  (track, scaleTracks) => getScaleTrackScale(track, scaleTracks)
);
