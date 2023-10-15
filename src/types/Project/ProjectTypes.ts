import { nanoid } from "@reduxjs/toolkit";

/**
 * The `Project` interface contains general, high-level info.
 * @property `id` - The ID of the project.
 * @property `name` - The name of the project.
 * @property `dateCreated` - The date the project was created.
 * @property `lastUpdated` - The date the project was last updated.
 */
export interface Project {
  id: string;
  name: string;
  dateCreated: string;
  lastUpdated: string;
}

/** Initialize a new project */
export const initializeProject = (): Project => ({
  id: `harmonia-project-${nanoid()}`,
  name: "New Project",
  dateCreated: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
});

/**
 * Checks if a given object is of type `Project`.
 * @param obj The object to check.
 * @returns True if the object is a `Project`, otherwise false.
 */
export const isProject = (obj: unknown): obj is Project => {
  const candidate = obj as Project;
  return (
    candidate?.id !== undefined &&
    candidate?.name !== undefined &&
    candidate?.dateCreated !== undefined &&
    candidate?.lastUpdated !== undefined
  );
};

/** Local Storage key names */
export const PROJECT_LIST = "harmonia-project-list";
export const CURRENT_PROJECT = "harmonia-current-project";
