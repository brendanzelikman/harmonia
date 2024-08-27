import { createSelector } from "reselect";
import { Project, SafeProject } from "types/Project/ProjectTypes";
import { getValueByKey, getValuesByKeys } from "utils/objects";
import {
  defaultInstrumentState,
  InstrumentId,
  InstrumentState,
} from "./InstrumentTypes";

// Create a safe selector for the instrument state.
export const selectInstrumentState = (project: SafeProject) =>
  (project?.present?.instruments ?? defaultInstrumentState) as InstrumentState;

/** Select the instrument map. */
export const selectInstrumentMap = createSelector(
  [selectInstrumentState],
  (instrumentState) => instrumentState.entities
);

/** Select the list of instrument IDs. */
export const selectInstrumentIds = createSelector(
  [selectInstrumentState],
  (instrumentState) => instrumentState.ids
);

/** Select all instruments. */
export const selectInstruments = createSelector(
  [selectInstrumentMap, selectInstrumentIds],
  getValuesByKeys
);

/** Select an instrument by ID or return undefined if not found. */
export const selectInstrumentById = (project: Project, id?: InstrumentId) => {
  const instrumentMap = selectInstrumentMap(project);
  return getValueByKey(instrumentMap, id);
};
