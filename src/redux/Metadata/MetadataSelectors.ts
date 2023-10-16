import { RootState } from "redux/store";

/**
 * Select the project metadata.
 */
export const selectMetadata = (state: Project) => state.meta;

/**
 * Select the project ID.
 */
export const selectProjectId = (state: Project) => state.meta.id;

/**
 * Select the project name.
 */
export const selectProjectName = (state: Project) => state.meta.name;
