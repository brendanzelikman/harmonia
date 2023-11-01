import { Project } from "types/Project";
import { createDeepEqualSelector } from "redux/util";
import { TrackId } from "types/Track";
import { getValueByKey, getValuesByKeys } from "utils/objects";
import { TranspositionId } from "types/Transposition";
import { isFiniteNumber } from "types/util";

/** Select the transposition map. */
export const selectTranspositionMap = (project: Project) =>
  project.arrangement.present.transpositions.byId;

/** Select all transposition IDs. */
export const selectTranspositionIds = (project: Project) =>
  project.arrangement.present.transpositions.allIds;

/** Select all transpositions. */
export const selectTranspositions = createDeepEqualSelector(
  [selectTranspositionMap, selectTranspositionIds],
  getValuesByKeys
);

/** Select a transposition by ID. */
export const selectTranspositionById = (
  project: Project,
  id: TranspositionId
) => {
  const transpositionMap = selectTranspositionMap(project);
  return getValueByKey(transpositionMap, id);
};

/** Select a list of transpositions by ID. */
export const selectTranspositionsByIds = (
  project: Project,
  ids: TranspositionId[]
) => {
  const transpositionMap = selectTranspositionMap(project);
  return getValuesByKeys(transpositionMap, ids);
};

/** Select a list of transpositions by track ID. */
export const selectTranspositionsByTrackIds = (
  project: Project,
  trackIds: TrackId[]
) => {
  const transpositions = selectTranspositions(project);
  return transpositions.filter((t) => trackIds.includes(t.trackId));
};

/** Select the duration of a transposition. */
export const selectTranspositionDuration = (
  project: Project,
  id: TranspositionId
) => {
  const transposition = selectTranspositionById(project, id);
  if (!transposition) return 0;
  const { duration } = transposition;
  if (isFiniteNumber(duration)) return duration;
  return Infinity;
};

/** Select the duration of a transposition. */
export const selectTranspositionDurations = (
  project: Project,
  ids: TranspositionId[]
) => {
  return ids.map((id) => selectTranspositionDuration(project, id));
};
