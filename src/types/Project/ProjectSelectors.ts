import { Project } from "./ProjectTypes";

export const selectCanUndo = (project: Project) => project.past.length > 0;
export const selectCanRedo = (project: Project) => project.future.length > 0;
