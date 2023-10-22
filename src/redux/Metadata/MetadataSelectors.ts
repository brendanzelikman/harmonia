import { Project } from "types/Project";

/**
 * Select the project metadata.
 */
export const selectMetadata = (project: Project) => project.meta;

/**
 * Select the project ID.
 */
export const selectProjectId = (project: Project) => project.meta.id;

/**
 * Select the project name.
 */
export const selectProjectName = (project: Project) => project.meta.name;
