import { nanoid } from "@reduxjs/toolkit";

// ------------------------------------------------------------
// Metadata Types
// ------------------------------------------------------------

/** The `ProjectMetadata` contains the top-level info of the project. */
export interface ProjectMetadata {
  id: string;
  name: string;
  dateCreated: string;
  lastUpdated: string;
  diary: ProjectDiary;
}

// The `ProjectDiary` is a list of strings
export type ProjectDiary = ProjectDiaryPage[];
export type ProjectDiaryPage = string;
export const PROJECT_DIARY_PAGE_COUNT = 10;

// ------------------------------------------------------------
// Project Initialization
// ------------------------------------------------------------

/** Create a new project diary. */
export const initializeProjectDiary = (): ProjectDiary =>
  new Array(PROJECT_DIARY_PAGE_COUNT).fill("");

/** Create project metadata with a unique ID and the current date. */
export const initializeProjectMetadata = (): ProjectMetadata => ({
  id: `project-${nanoid()}`,
  name: "New Project",
  dateCreated: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
  diary: initializeProjectDiary(),
});

// Export a new instance of project metadata.
export const defaultProjectMetadata = initializeProjectMetadata();
