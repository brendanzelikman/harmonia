import { Project } from "./ProjectTypes";

/** Select whether the user can undo the project. */
export const selectCanUndoProject = (project: Project) => {
  return project.past.length > 0;
};

/** Select whether the user can redo the project. */
export const selectCanRedoProject = (project: Project) =>
  project.future.length > 0;
