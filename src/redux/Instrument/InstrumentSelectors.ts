import { Project } from "types/Project";
import { createSelector } from "reselect";
import { TrackId } from "types/Track";
import { getValueByKey, getValuesByKeys } from "utils/objects";

/** Select the instrument map. */
export const selectInstrumentMap = (project: Project) =>
  project.arrangement.present.instruments.byId;

/** Select the list of instrument IDs. */
export const selectInstrumentIds = (project: Project) =>
  project.arrangement.present.instruments.allIds;

/** Select all instruments. */
export const selectInstruments = createSelector(
  [selectInstrumentMap, selectInstrumentIds],
  getValuesByKeys
);

/** Select an instrument by ID or return undefined if not found. */
export const selectInstrumentById = (project: Project, id?: TrackId) => {
  const instrumentMap = selectInstrumentMap(project);
  return getValueByKey(instrumentMap, id);
};
