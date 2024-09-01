import { createDeepSelector } from "lib/redux";
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

/** Select whether the user has hidden their tooltips. */
export const selectHideTooltips = createSelector(
  [selectMeta],
  (m) => !!m.hideTooltips
);

/** Select whether the user has hidden their timeline. */
export const selectHideTimeline = createSelector(
  [selectMeta],
  (m) => !!m.hideTimeline
);
