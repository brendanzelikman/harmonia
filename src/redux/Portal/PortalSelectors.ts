import { createSelector } from "reselect";
import { PortalId } from "types/Portal";
import { Project } from "types/Project";
import { TrackId } from "types/Track";
import { getValueByKey } from "utils/objects";

/** Select the portal map. */
export const selectPortalMap = (project: Project) =>
  project.arrangement.present.portals.byId;

/** Select all portal IDs. */
export const selectPortalIds = (project: Project) =>
  project.arrangement.present.portals.allIds;

/** Select all portals. */
export const selectPortals = createSelector(
  [selectPortalMap, selectPortalIds],
  (portalMap, portalIds) => portalIds.map((id) => portalMap[id])
);

/** Select a portal by ID. */
export const selectPortalById = (project: Project, id?: PortalId) => {
  const portalMap = selectPortalMap(project);
  return getValueByKey(portalMap, id);
};

/** Select the portals in a given track */
export const selectTrackPortals = (project: Project, trackId: TrackId) => {
  const portals = selectPortals(project);
  return portals.filter((portal) => portal.trackId === trackId);
};

/** Select a list of portals by their track IDs. */
export const selectPortalsByTrackIds = (
  project: Project,
  trackIds: TrackId[]
) => {
  const portals = selectPortals(project);
  return portals.filter((portal) => trackIds.includes(portal.trackId));
};
