import { RootState } from "redux/store";

/**
 * Select the hierarchy from the state.
 * @param state The RootState object.
 * @returns The hierarchy object.
 */
export const selectTrackHierarchy = (state: RootState) =>
  state.arrangement.present.hierarchy;

/**
 * Select the hierarchy's node map from the state.
 * @param state The RootState object.
 * @returns The node map.
 */
export const selectTrackNodeMap = (state: RootState) =>
  state.arrangement.present.hierarchy.byId;

/**
 * Select the hierarchy's list of IDs from the state.
 * @param state The RootState object.
 * @returns The hierarchy's list of IDs.
 */
export const selectTrackNodeIds = (state: RootState) =>
  state.arrangement.present.hierarchy.allIds;
