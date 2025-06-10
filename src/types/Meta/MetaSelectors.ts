import { Project } from "../Project/ProjectTypes";
import { createSelector } from "reselect";

/** Select the project metadata. */
export const selectMeta = (project: Project) => project.present.meta;

/** Select the project ID. */
export const selectProjectId = createSelector([selectMeta], (meta) => meta.id);

/** Select the project name. */
export const selectProjectName = createSelector(
  [selectMeta],
  (meta) => meta.name
);

/** Select the project created date */
export const selectProjectDateCreated = createSelector(
  [selectMeta],
  (meta) => meta.dateCreated
);

/** Select the project uploaded date */
export const selectProjectLastUpdated = createSelector(
  [selectMeta],
  (meta) => meta.lastUpdated
);
