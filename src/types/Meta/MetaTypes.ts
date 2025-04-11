import { nanoid } from "@reduxjs/toolkit";
import dayjs from "dayjs";

export const NEW_PROJECT_NAME = "New Project";
export const DIARY_PAGE_COUNT = 10;

// ------------------------------------------------------------
// Metadata Types
// ------------------------------------------------------------

// The `ProjectDiary` is a list of strings
export type ProjectDiary = ProjectDiaryPage[];
export type ProjectDiaryPage = string;

/** Create a new project diary. */
export const initializeProjectDiary = (): ProjectDiary =>
  new Array(DIARY_PAGE_COUNT).fill("");

/** The `ProjectMetadata` contains the top-level info of the project. */
export interface ProjectMetadata {
  id: string;
  name: string;
  diary: ProjectDiary;
  dateCreated: string;
  lastUpdated: string;
}

/** Create project metadata with a unique ID and the current date. */
export const initializeProjectMetadata = (): ProjectMetadata => ({
  id: `project-${nanoid()}`,
  name: NEW_PROJECT_NAME,
  dateCreated: dayjs().format(),
  lastUpdated: dayjs().format(),
  diary: initializeProjectDiary(),
});

// Export a new instance of project metadata.
export const defaultProjectMetadata = initializeProjectMetadata();
