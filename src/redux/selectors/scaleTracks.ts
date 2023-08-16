import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "redux/store";
import { TrackId } from "types/tracks";
import { selectScales } from "./scales";

// Select the ID of a track
const selectTrackId = (state: RootState, id: TrackId) => id;

// Select all scale tracks
export const selectScaleTracks = createSelector(
  [(state: RootState) => state.timeline.present.scaleTracks],
  (scaleTracks) => scaleTracks.allIds.map((id) => scaleTracks.byId[id])
);

// Select all scale track IDs
export const selectScaleTrackIds = (state: RootState): TrackId[] => {
  return state.timeline.present.scaleTracks.allIds;
};

// Select a specific scale track
export const selectScaleTrack = createSelector(
  [selectScaleTracks, selectTrackId],
  (tracks, id) => tracks.find((track) => track.id === id)
);

// Select the scale of a scale track
export const selectScaleTrackScale = createSelector(
  [selectScaleTrack, selectScales],
  (track, scales) => {
    if (!track) return;
    return scales.find((scale) => scale.id === track.scaleId);
  }
);
