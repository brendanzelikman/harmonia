import { useToggledState } from "hooks/window/useToggledState";

export const PROJECT_DIARY_PAGE_COUNT = 10;

// The `ProjectDiary` is a list of strings
export type ProjectDiary = ProjectDiaryPage[];
export type ProjectDiaryPage = string;

// The diary is handled with a custom window event
export const useDiary = () => useToggledState("diary");

/** Create a new project diary. */
export const initializeProjectDiary = (): ProjectDiary =>
  new Array(PROJECT_DIARY_PAGE_COUNT).fill("");
