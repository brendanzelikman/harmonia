import { nanoid } from "@reduxjs/toolkit";
import { initializeProjectDiary, ProjectDiary } from "../Diary/DiaryTypes";
import dayjs from "dayjs";

export const NEW_PROJECT_NAME = "New Project";

// ------------------------------------------------------------
// Metadata Types
// ------------------------------------------------------------

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
