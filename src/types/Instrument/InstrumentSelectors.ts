import { createSelector } from "reselect";
import { Project, SafeProject } from "types/Project/ProjectTypes";
import { getValueByKey, getValuesByKeys } from "utils/object";
import {
  defaultInstrumentState,
  InstrumentId,
  InstrumentState,
} from "./InstrumentTypes";
import { getInstrumentName } from "./InstrumentFunctions";
import { createDeepSelector, createValueSelector } from "types/redux";
import { mapValues } from "lodash";

// Create a safe selector for the instrument state.
export const selectInstrumentState = (project: SafeProject) =>
  (project?.present?.instruments ?? defaultInstrumentState) as InstrumentState;

/** Select the instrument map. */
export const selectInstrumentMap = createDeepSelector(
  [selectInstrumentState],
  (instrumentState) => instrumentState.entities
);

/** Select the list of instrument IDs. */
export const selectInstrumentIds = createDeepSelector(
  [selectInstrumentState],
  (instrumentState) => instrumentState.ids
);

/** Select all instruments. */
export const selectInstruments = createSelector(
  [selectInstrumentMap, selectInstrumentIds],
  getValuesByKeys
);

/** Select all unique instrument names. */
export const selectUniqueInstrumentNames = createSelector(
  [selectInstruments],
  (instruments) =>
    [...new Set(instruments.map((i) => getInstrumentName(i.key)))].join(", ")
);

/** Select the map of instrument ids to keys */
export const selectInstrumentKeyMap = createDeepSelector(
  [selectInstrumentMap],
  (map) => mapValues(map, (i) => i?.key)
);
export const selectInstrumentKey = createValueSelector(selectInstrumentKeyMap);

/** Select an instrument by ID or return undefined if not found. */
export const selectInstrumentById = (project: Project, id?: InstrumentId) => {
  const instrumentMap = selectInstrumentMap(project);
  return getValueByKey(instrumentMap, id);
};
