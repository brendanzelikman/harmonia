import { createSelector } from "reselect";
import { getValuesByKeys } from "utils/objects";
import { PresetScaleMap } from "assets/scales";
import { createDeepSelector } from "lib/redux";
import { Project, SafeProject } from "types/Project/ProjectTypes";
import { defaultScaleState, scaleAdapter } from "./ScaleSlice";
import { ScaleId, ScaleMap, ScaleState } from "./ScaleTypes";

export const selectScaleState = (state: SafeProject) =>
  (state?.present?.motifs?.scale ?? defaultScaleState) as ScaleState;

const scaleSelectors = scaleAdapter.getSelectors<Project>(selectScaleState);
export const selectScales = scaleSelectors.selectAll;
export const selectScaleById = scaleSelectors.selectById;
export const selectScaleIds = scaleSelectors.selectIds as (
  project: Project
) => ScaleId[];
export const _selectScaleMap = scaleSelectors.selectEntities;

/** Select the scale map (including all preset scales). */
export const selectScaleMap = createDeepSelector(
  [_selectScaleMap],
  (scaleMap): ScaleMap => ({ ...scaleMap, ...PresetScaleMap })
);

/** Select only custom scales (excluding track scales). */
export const selectCustomScales = createSelector(
  [selectScaleMap, selectScaleIds],
  (scaleMap, ids) => {
    const scales = getValuesByKeys(scaleMap, ids);
    return scales.filter((scale) => scale.scaleTrackId === undefined);
  }
);

/** Select only track scales (excluding custom scales). */
export const selectTrackScales = createSelector(
  [selectScaleMap, selectScaleIds],
  (scaleMap, ids) => {
    const scales = getValuesByKeys(scaleMap, ids);
    return scales.filter((scale) => scale.scaleTrackId !== undefined);
  }
);
