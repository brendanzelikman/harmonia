import { selectTrackMap } from "redux/Track/TrackSelectors";
import { createDeepEqualSelector } from "redux/util";
import { Project } from "types/Project";
import { TrackId } from "types/Track";
import { TrackRenderData, TrackRenderDependencies } from "types/TrackHierarchy";
import { getValuesByKeys } from "utils/objects";

/** Select the track hierarchy. */
export const selectTrackHierarchy = (project: Project) =>
  project.arrangement.present.hierarchy;

/** Select the track node map. */
export const selectTrackNodeMap = (project: Project) =>
  project.arrangement.present.hierarchy.byId;

/** Select the list of track node IDs. */
export const selectTrackNodeIds = (project: Project) =>
  project.arrangement.present.hierarchy.allIds;

/** Select the render dependencies of a track. */
export const selectTrackRenderDependencies = createDeepEqualSelector(
  [selectTrackHierarchy],
  (trackHierarchy): TrackRenderDependencies => ({
    ...trackHierarchy,
    byId: Object.keys(trackHierarchy.byId).reduce((acc, id) => {
      const track = trackHierarchy.byId[id];
      const { trackIds, type, depth } = track;
      return { ...acc, [id]: { id, trackIds, type, depth } };
    }, {} as Record<TrackId, TrackRenderData>),
  })
);

/** Select all track IDs ordered by track index. */
export const selectOrderedTrackIds = createDeepEqualSelector(
  [selectTrackHierarchy],
  (hierarchy) => {
    // Initialize the ordered tracks
    const { topLevelIds, byId } = hierarchy;
    const orderedTrackIds: TrackId[] = [];

    // Recursively add all children of a track
    const addChildren = (children: TrackId[]) => {
      if (!children?.length) return;
      children.forEach((trackId) => {
        const node = byId[trackId];
        if (!node) return;
        orderedTrackIds.push(trackId);
        addChildren(node.trackIds);
      });
    };

    // Add the scale tracks from the top level
    for (const trackId of topLevelIds) {
      const node = byId[trackId];
      if (!node) continue;
      orderedTrackIds.push(trackId);
      addChildren(node.trackIds);
    }
    return orderedTrackIds;
  }
);

/** Select all tracks ordered by track index. */
export const selectOrderedTracks = createDeepEqualSelector(
  [selectTrackMap, selectOrderedTrackIds],
  (trackMap, orderedTrackIds) => getValuesByKeys(trackMap, orderedTrackIds)
);
