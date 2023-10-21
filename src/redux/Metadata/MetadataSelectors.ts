import { RootState } from "redux/store";

/**
 * Select the project metadata.
 */
export const selectMetadata = (state: RootState) => state.meta;

/**
 * Select the project ID.
 */
export const selectProjectId = (state: RootState) => state.meta.id;

/**
 * Select the project name.
 */
export const selectProjectName = (state: RootState) => state.meta.name;
