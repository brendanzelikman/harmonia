import { Project } from "types/Project";
import { createSelector } from "reselect";
import { TrackId } from "types/Track";
import { getProperty, getProperties } from "types/util";

/**
 * Select all instrument IDs from the store.
 * @param project The project.
 * @returns An array of instrument IDs.
 */
export const selectInstrumentIds = (project: Project) =>
  project.arrangement.present.instruments.allIds;

/**
 * Select the instrument map from the store.
 * @param project The project.
 * @returns A map of instrument IDs to instruments.
 */
export const selectInstrumentMap = (project: Project) =>
  project.arrangement.present.instruments.byId;

/**
 * Select all instruments from the store.
 * @param project The project.
 * @returns An array of instruments.
 */
export const selectInstruments = createSelector(
  [selectInstrumentMap, selectInstrumentIds],
  getProperties
);

/**
 * Select a specific instrument by ID from the store.
 * @param project The project.
 * @param id The instrument ID.
 * @returns The instrument.
 */
export const selectInstrumentById = (project: Project, id?: TrackId) => {
  const instrumentMap = selectInstrumentMap(project);
  return getProperty(instrumentMap, id);
};
