import { nanoid } from "@reduxjs/toolkit";
import { initializeProjectDiary, ProjectDiary } from "../Diary/DiaryTypes";

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
  hideTooltips?: boolean;
  hideTimeline?: boolean;
}

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
