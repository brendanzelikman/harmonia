import { RootState } from "redux/store";
import { createDeepEqualSelector } from "redux/util";
import { createSelector } from "reselect";
import { TrackId } from "types/Track";
import { getProperty, getProperties, selectId, selectIds } from "types/util";

/**
 * Select all transposition IDs from the store.
 * @param state The root state of the store.
 * @returns An array of transposition IDs.
 */
export const selectTranspositionIds = (state: RootState) =>
  state.session.present.transpositions.allIds;

/**
 * Select the transposition map from the store.
 * @param state The root state of the store.
 * @returns The transposition map.
 */
export const selectTranspositionMap = (state: RootState) =>
  state.session.present.transpositions.byId;

/**
 * Select all transpositions from the store.
 * @returns An array of transpositions.
 */
export const selectTranspositions = createDeepEqualSelector(
  [selectTranspositionMap, selectTranspositionIds],
  getProperties
);

/**
 * Select a list of transpositions from the store by ID.
 * @param ids The IDs of the transpositions to select.
 * @returns An array of transpositions.
 */
export const selectTranspositionsByIds = createSelector(
  [selectTranspositionMap, selectIds],
  getProperties
);

/**
 * Select a list of transpositions by track IDs.
 * @param state The root state.
 * @param trackIds The track IDs.
 */
export const selectTranspositionsByTrackIds = (
  state: RootState,
  trackIds: TrackId[]
) => {
  const transpositions = selectTranspositions(state);
  return transpositions.filter((t) => trackIds.includes(t.trackId));
};

/**
 * Select a specific transposition from the store by ID.
 * @param id The ID of the transposition to select.
 * @returns The transposition object.
 */
export const selectTranspositionById = createSelector(
  [selectTranspositionMap, selectId],
  getProperty
);
