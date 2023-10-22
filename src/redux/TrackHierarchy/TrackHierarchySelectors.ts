import { Project } from "types/Project";

/**
 * Select the hierarchy from the state.
 * @param project The Project object.
 * @returns The hierarchy object.
 */
export const selectTrackHierarchy = (project: Project) =>
  project.arrangement.present.hierarchy;

/**
 * Select the hierarchy's node map from the state.
 * @param project The Project object.
 * @returns The node map.
 */
export const selectTrackNodeMap = (project: Project) =>
  project.arrangement.present.hierarchy.byId;

/**
 * Select the hierarchy's list of IDs from the state.
 * @param project The Project object.
 * @returns The hierarchy's list of IDs.
 */
export const selectTrackNodeIds = (project: Project) =>
  project.arrangement.present.hierarchy.allIds;
