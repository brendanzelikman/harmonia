import { createSelector } from "reselect";
import { getValuesByKeys } from "utils/objects";
import { createArraySelector } from "lib/redux";
import { Project, SafeProject } from "types/Project/ProjectTypes";
import { defaultScaleState, scaleAdapter } from "./ScaleSlice";
import { ScaleId, ScaleState } from "./ScaleTypes";

export const selectScaleState = (state: SafeProject) =>
  (state?.present?.scales ?? defaultScaleState) as ScaleState;

const scaleSelectors = scaleAdapter.getSelectors<Project>(selectScaleState);
export const selectScales = scaleSelectors.selectAll;
export const selectScaleById = scaleSelectors.selectById;
export const selectScaleIds = scaleSelectors.selectIds as (
  project: Project
) => ScaleId[];
export const selectScaleMap = scaleSelectors.selectEntities;

/** Select a potentially custom scale by ID. */
export const selectCustomScaleById = createArraySelector(selectScaleMap);

/** Select only custom scales (excluding track scales). */
export const selectCustomScales = createSelector(
  [selectScaleMap, selectScaleIds],
  (scaleMap, ids) => {
    const scales = getValuesByKeys(scaleMap, ids);
    return scales.filter((scale) => scale.trackId === undefined);
  }
);

/** Select only track scales (excluding custom scales). */
export const selectTrackScales = createSelector(
  [selectScaleMap, selectScaleIds],
  (scaleMap, ids) => {
    const scales = getValuesByKeys(scaleMap, ids);
    return scales.filter((scale) => scale.trackId !== undefined);
  }
);
