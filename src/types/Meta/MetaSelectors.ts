import { createDeepSelector } from "utils/redux";
import { Project } from "../Project/ProjectTypes";
import {
  initializeProjectDiary,
  PROJECT_DIARY_PAGE_COUNT,
} from "../Diary/DiaryTypes";
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

/** Select the project diary and constrain it to the page. */
export const selectProjectDiary = createDeepSelector(
  [selectMeta],
  (meta) =>
    Array.from({ length: PROJECT_DIARY_PAGE_COUNT }).map(
      (_, i) => meta.diary?.[i] ?? ""
    ) ?? initializeProjectDiary()
);
