import { createSelector } from "reselect";
import { Project, SafeProject } from "types/Project/ProjectTypes";
import {
  defaultInstrumentState,
  InstrumentId,
  InstrumentState,
} from "./InstrumentTypes";
import { getInstrumentName } from "./InstrumentFunctions";
import { createDeepSelector, createValueSelector } from "types/redux";
import { mapValues } from "lodash";
import { selectTrackMap } from "types/Track/TrackSelectors";
import { isPatternTrack, TrackId } from "types/Track/TrackTypes";

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
  (instrumentMap, instrumentIds) => instrumentIds.map((id) => instrumentMap[id])
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
  if (!id) return undefined;
  const instrumentMap = selectInstrumentMap(project);
  return instrumentMap[id];
};
