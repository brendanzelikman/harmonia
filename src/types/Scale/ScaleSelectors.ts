import { Project, SafeProject } from "types/Project/ProjectTypes";
import { defaultScaleState, scaleAdapter } from "./ScaleSlice";
import { ScaleId, ScaleState } from "./ScaleTypes";

export const selectScaleState = (state: SafeProject) =>
  (state?.present?.scales ?? defaultScaleState) as ScaleState;

const scaleSelectors = scaleAdapter.getSelectors<Project>(selectScaleState);

export const selectScaleIds = scaleSelectors.selectIds as (
  project: Project
) => ScaleId[];
export const selectScaleMap = scaleSelectors.selectEntities;
