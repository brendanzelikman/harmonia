import { Project } from "types/Project";
import { createSelector } from "reselect";
import { ScaleId } from "types/Scale";
import { getValuesByKeys, getValueByKey } from "utils/objects";
import { createDeepEqualSelector } from "redux/util";
import { SCALE_TRACK_SCALE_NAME } from "utils/constants";

/** Select the scale past length. */
export const selectScalePastLength = (project: Project) =>
  project.scales.past.length;

/** Select the scale future length. */
export const selectScaleFutureLength = (project: Project) =>
  project.scales.future.length;

/** Select the scale map. */
export const selectScaleMap = (project: Project) => project.scales.present.byId;

/** Select all scale IDs. */
export const selectScaleIds = (project: Project) =>
  project.scales.present.allIds;

/** Select all scales (including track scales) */
export const selectScales = createDeepEqualSelector(
  [selectScaleMap, selectScaleIds],
  (scaleMap, ids) => getValuesByKeys(scaleMap, ids)
);

/** Select all custom scales (excluding track scales). */
export const selectCustomScales = createSelector(
  [selectScaleMap, selectScaleIds],
  (scaleMap, ids) => {
    const scales = getValuesByKeys(scaleMap, ids);
    return scales.filter((scale) => scale.name !== SCALE_TRACK_SCALE_NAME);
  }
);

/** Select a specific scale. */
export const selectScaleById = (project: Project, id: ScaleId) => {
  const scaleMap = selectScaleMap(project);
  return getValueByKey(scaleMap, id);
};
