import { Project } from "types/Project";

/**
 * Select the editor from the state.
 * @param project The Project object.
 * @returns The editor object.
 */
export const selectEditor = (project: Project) => project.editor;
