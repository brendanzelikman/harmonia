import { Clip } from "../Clip";
import { Track, TrackId } from "../Track";
import { Pose } from "../Pose";
import {
  TrackHierarchy,
  TrackNode,
  TrackNodeMap,
  initializeTrackHierarchy,
} from "./TrackHierarchyTypes";

/** Create a `TrackHierarchy` from the given tracks, clips, and poses. */
export const createTrackHierarchy = (props: {
  tracks?: Track[];
  clips?: Clip[];
  poses?: Pose[];
}): TrackHierarchy => {
  const hierarchy = initializeTrackHierarchy();
  const { tracks, clips, poses } = props;
  const trackCount = tracks?.length ?? 0;
  if (!tracks || !trackCount) return hierarchy;

  let trackIds = 0;
  let previousIds = 0;

  // Iterate through the tracks and create nodes for each track
  while (trackIds < trackCount) {
    tracks.forEach((track, i) => {
      const { id, type, parentId } = track;

      // If the track is the first track, check if the number of tracks has changed. If not, return early.
      if (i === 0) {
        if (trackIds > 0 && previousIds === trackIds) {
          trackIds = tracks.length;
          return;
        } else {
          previousIds = trackIds;
        }
      }
      // If the track already exists, return.
      if (hierarchy.byId[id]) return;

      // Create the track node
      const node: TrackNode = {
        id,
        type,
        depth: 0,
        trackIds: [],
        clipIds: [],
        poseIds: [],
      };

      // If the track is a top-level track, add it to the top-level IDs.
      if (!parentId) {
        hierarchy.topLevelIds.push(id);
      } else {
        // Otherwise, add it to the parent track's track IDs and set the depth.
        const parentNode = hierarchy.byId[parentId];
        if (!parentNode) return;
        parentNode.trackIds.push(id);
        node.depth = parentNode.depth + 1;
      }

      // Add the node to the hierarchy and increment the number of track IDs.
      hierarchy.byId[id] = node;
      hierarchy.allIds.push(id);
      trackIds++;
    });
  }

  // Add all clips to their respective tracks.
  if (clips?.length)
    clips.forEach((clip) => {
      const { id, trackId } = clip;
      const node = hierarchy.byId[trackId];
      if (!node) return;
      node.clipIds.push(id);
    });

  // Add all poses to their respective tracks.
  if (poses?.length)
    poses.forEach((pose) => {
      const { id, trackId } = pose;
      const node = hierarchy.byId[trackId];
      if (!node) return;
      node.poseIds.push(id);
    });

  // Return the hierarchy.
  return { ...hierarchy };
};

/** Get the child IDs of a track by ID. */
export const getTrackChildIds = (id: TrackId, trackNodeMap: TrackNodeMap) => {
  const children: TrackId[] = [];
  const trackNode = trackNodeMap[id];
  if (!trackNode) return children;
  for (let i = 0; i < trackNode.trackIds.length; i++) {
    const id = trackNode.trackIds[i];
    const child = trackNodeMap[id];
    if (!child) continue;
    children.push(child.id);
    children.push(...getTrackChildIds(child.id, trackNodeMap));
  }
  return children;
};

/** Get the clip IDs of a track by ID. */
export const getTrackClipIds = (id: TrackId, trackNodeMap?: TrackNodeMap) => {
  return trackNodeMap?.[id]?.clipIds ?? [];
};

/** Get the pose IDs of a track by ID. */
export const getTrackPoseIds = (id: TrackId, trackNodeMap?: TrackNodeMap) => {
  return trackNodeMap?.[id]?.poseIds ?? [];
};
