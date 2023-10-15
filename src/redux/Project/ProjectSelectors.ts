import { RootState } from "redux/store";

/**
 * Select the project.
 */
export const selectProject = (state: RootState) => state.project;
