export const PROJECT_DIARY_PAGE_COUNT = 10;

// The `ProjectDiary` is a list of strings
export type ProjectDiary = ProjectDiaryPage[];
export type ProjectDiaryPage = string;

/** Create a new project diary. */
export const initializeProjectDiary = (): ProjectDiary =>
  new Array(PROJECT_DIARY_PAGE_COUNT).fill("");
