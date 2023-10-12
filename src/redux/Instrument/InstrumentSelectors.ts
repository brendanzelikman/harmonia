import { RootState } from "redux/store";
import { createSelector } from "reselect";
import { TrackId } from "types/Track";
import { getProperty, getProperties } from "types/util";

/**
 * Select all instrument IDs from the store.
 * @param state The root state.
 * @returns An array of instrument IDs.
 */
export const selectInstrumentIds = (state: RootState) =>
  state.session.present.instruments.allIds;

/**
 * Select the instrument map from the store.
 * @param state The root state.
 * @returns A map of instrument IDs to instruments.
 */
export const selectInstrumentMap = (state: RootState) =>
  state.session.present.instruments.byId;

/**
 * Select all instruments from the store.
 * @param state The root state.
 * @returns An array of instruments.
 */
export const selectInstruments = createSelector(
  [selectInstrumentMap, selectInstrumentIds],
  getProperties
);

/**
 * Select a specific instrument by ID from the store.
 * @param state The root state.
 * @param id The instrument ID.
 * @returns The instrument.
 */
export const selectInstrumentById = (state: RootState, id?: TrackId) => {
  const instrumentMap = selectInstrumentMap(state);
  return getProperty(instrumentMap, id);
};
