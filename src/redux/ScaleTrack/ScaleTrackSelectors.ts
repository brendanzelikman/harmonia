import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "redux/store";
import { TrackId } from "types/Track";
import { getProperty, getProperties } from "types/util";

/**
 * Select the scale track map from the store.
 * @param state The RootState object.
 * @returns The scale track map.
 */
export const selectScaleTrackMap = (state: RootState) =>
  state.arrangement.present.scaleTracks.byId;

/**
 * Select all scale track IDs from the store.
 * @param state The RootState object.
 * @returns A list of scale track IDs.
 */
export const selectScaleTrackIds = (state: RootState) =>
  state.arrangement.present.scaleTracks.allIds;

/**
 * Select all scale tracks from the store.
 * @param state The RootState object.
 * @returns A list of scale tracks.
 */
export const selectScaleTracks = createSelector(
  [selectScaleTrackMap, selectScaleTrackIds],
  getProperties
);

/**
 * Select a specific scale track from the store.
 * @param state The RootState object.
 * @param id The ID of the scale track.
 * @returns The scale track.
 */
export const selectScaleTrackById = (state: RootState, id?: TrackId) => {
  const scaleTrackMap = selectScaleTrackMap(state);
  return getProperty(scaleTrackMap, id);
};
