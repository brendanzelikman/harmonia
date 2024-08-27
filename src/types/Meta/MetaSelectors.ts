import { createDeepSelector } from "lib/redux";
import { Project } from "../Project/ProjectTypes";
import {
  initializeProjectDiary,
  PROJECT_DIARY_PAGE_COUNT,
} from "../Diary/DiaryTypes";
import { createSelector } from "reselect";

/** Select the project metadata. */
export const selectMetadata = (project: Project) => project.present.meta;

/** Select the project ID. */
export const selectProjectId = createSelector(
  [selectMetadata],
  (meta) => meta.id
);

/** Select the project name. */
export const selectProjectName = createSelector(
  [selectMetadata],
  (meta) => meta.name
);

/** Select the project diary and constrain it to the page. */
export const selectProjectDiary = createDeepSelector(
  [selectMetadata],
  (meta) =>
    Array.from({ length: PROJECT_DIARY_PAGE_COUNT }).map(
      (_, i) => meta.diary?.[i] ?? ""
    ) ?? initializeProjectDiary()
);

export const selectCanUndoProject = (project: Project) => {
  return project.past.length > 0;
};

export const selectCanRedoProject = (project: Project) =>
  project.future.length > 0;
