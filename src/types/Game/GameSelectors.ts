import { Project } from "types/Project/ProjectTypes";

/** Select the project game. */
export const selectGame = (project: Project) => project.present?.game;

/** Select if there are game actions from the project. */
export const selectHasGame = (project: Project) =>
  !!project.present.game?.actions?.length;
