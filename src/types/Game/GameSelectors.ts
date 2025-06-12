import { createSelector } from "reselect";
import { Project } from "types/Project/ProjectTypes";
import { selectSelectedPoseClips } from "types/Timeline/TimelineSelectors";

/** Select the project game. */
export const selectGame = (project: Project) => project.present?.game;

/** Select if there are game actions from the project. */
export const selectHasGame = createSelector(
  selectGame,
  (game) => !!game?.actions?.length
);

/** Select if there are pose clips */
export const selectCanGame = createSelector(
  selectSelectedPoseClips,
  (clips) => !!clips.length
);
