import { RootState } from "redux/store";

/**
 * Select the session from the state.
 * @param state The RootState object.
 * @returns The session object.
 */
export const selectSession = (state: RootState) =>
  state.session.present.session;

/**
 * Select the session's map from the state.
 * @param state The RootState object.
 * @returns The session's map.
 */
export const selectSessionMap = (state: RootState) =>
  state.session.present.session.byId;

/**
 * Select the session's list of IDs from the state.
 * @param state The RootState object.
 * @returns The session's list of IDs.
 */
export const selectSessionIds = (state: RootState) =>
  state.session.present.session.allIds;
