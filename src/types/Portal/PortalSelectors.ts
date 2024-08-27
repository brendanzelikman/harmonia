import { createSelector } from "reselect";
import { Project, SafeProject } from "types/Project/ProjectTypes";
import { TrackId } from "types/Track/TrackTypes";
import { defaultPortalState, portalAdapter } from "./PortalSlice";
import { PortalId, PortalState } from "./PortalTypes";

// Create a safe selector for the portal state.
export const selectPortalState = (project: SafeProject) =>
  (project?.present?.portals ?? defaultPortalState) as PortalState;

// Use the memoized selectors from the entity adapter.
const portalSelectors = portalAdapter.getSelectors<Project>(selectPortalState);

export const selectPortals = portalSelectors.selectAll;
export const selectPortalById = portalSelectors.selectById;
export const selectPortalMap = portalSelectors.selectEntities;
export const selectPortalIds = portalSelectors.selectIds as (
  project: Project
) => PortalId[];
export const selectPortalCount = portalSelectors.selectTotal;

export const selectPortalsByTrackId = createSelector(
  [selectPortals, (_: Project, trackId: TrackId) => trackId],
  (portals, trackId) => portals.filter((p) => p.trackId === trackId)
);

export const selectPortalsByTrackIds = createSelector(
  [selectPortals, (_: Project, trackIds: TrackId[]) => trackIds],
  (portals, trackIds) => portals.filter((p) => trackIds.includes(p.trackId))
);
