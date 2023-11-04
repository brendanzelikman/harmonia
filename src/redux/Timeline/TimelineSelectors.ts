import {
  COLLAPSED_TRACK_HEIGHT,
  HEADER_HEIGHT,
  MEASURE_COUNT,
  TRACK_WIDTH,
} from "utils/constants";
import { getSubdivisionTicks, getTickColumns } from "utils/durations";
import { Project } from "types/Project";
import { getTimelineObjectTrackId } from "types/Timeline";
import { Tracked, isTrack } from "types/Track";
import { Media, MediaClip } from "types/Media";
import { Tick } from "types/units";
import { getValueByKey, getValuesByKeys } from "utils/objects";
import { createDeepEqualSelector } from "redux/util";
import {
  selectPatternById,
  selectPatternMap,
} from "redux/Pattern/PatternSelectors";
import {
  selectTrackById,
  selectTrackMap,
  selectTrackChain,
} from "../Track/TrackSelectors";
import { selectClipMap } from "../Clip/ClipSelectors";
import { selectTranspositionMap } from "../Transposition/TranspositionSelectors";
import {
  selectOrderedTrackIds,
  selectTrackHierarchy,
} from "../TrackHierarchy/TrackHierarchySelectors";
import { Clip, getClipDuration } from "types/Clip";
import { Transposition } from "types/Transposition";
import { isFiniteNumber } from "types/util";
import { selectPortalMap } from "redux/Portal/PortalSelectors";

/** Select the timeline from the store. */
export const selectTimeline = (project: Project) => project.timeline;

/** Select the timeline column count. */
export const selectTimelineColumns = (project: Project) =>
  MEASURE_COUNT * 64 * getSubdivisionTicks(project.timeline.subdivision);

// ------------------------------------------------------------
// Timeline Dimensions
// ------------------------------------------------------------

/** Select the timeline cell. */
export const selectCell = (project: Project) => project.timeline.cell;

/** Select the width of a timeline cell. */
export const selectCellWidth = (project: Project) =>
  project.timeline.cell.width;

/** Select the height of a timeline cell. */
export const selectCellHeight = (project: Project) =>
  project.timeline.cell.height;

/** Select the background width of the timeline. */
export const selectTimelineBackgroundWidth = (project: Project) => {
  const cellWidth = selectCellWidth(project);
  const columns = selectTimelineColumns(project);
  return columns * cellWidth + TRACK_WIDTH;
};

// ------------------------------------------------------------
// Timeline Durations
// ------------------------------------------------------------

/** Select the number of ticks in a timeline subdivision. */
export const selectSubdivisionTicks = (project: Project) => {
  const timeline = selectTimeline(project);
  return getSubdivisionTicks(timeline.subdivision);
};

/** Select the current tick using the given column based on the timeline subdivision. */
export const selectColumnTicks = (project: Project, column: number) => {
  const timeline = selectTimeline(project);
  const ticks = getSubdivisionTicks(timeline.subdivision);
  return ticks * column;
};

/** Select the left offset of the timeline tick in pixels. */
export const selectTimelineTickLeft = (project: Project, tick: Tick = 0) => {
  const timeline = selectTimeline(project);
  const cellWidth = selectCellWidth(project);
  const columns = getTickColumns(tick, timeline.subdivision);
  return TRACK_WIDTH + Math.round(columns * cellWidth);
};

// ------------------------------------------------------------
// Selected Track
// ------------------------------------------------------------

/** Select the currently selected track ID. */
export const selectSelectedTrackId = (project: Project): string | undefined =>
  project.timeline.selectedTrackId;

/** Select the currently selected track. */
export const selectSelectedTrack = (project: Project) => {
  const trackMap = selectTrackMap(project);
  const selectedTrackId = selectSelectedTrackId(project);
  return getValueByKey(trackMap, selectedTrackId);
};

/** Select the index of the currently selected track or -1 if undefined. */
export const selectSelectedTrackIndex = (project: Project) => {
  const selectedTrackId = selectSelectedTrackId(project);
  if (!selectedTrackId) return -1;
  const orderedTrackIds = selectOrderedTrackIds(project);
  return orderedTrackIds.indexOf(selectedTrackId);
};

/** Select the parents of the currently selected track. */
export const selectSelectedTrackParents = (project: Project) => {
  const selectedTrack = selectSelectedTrack(project);
  if (!selectedTrack) return [];
  return selectTrackChain(project, selectedTrack.id);
};

// ------------------------------------------------------------
// Media Selection
// ------------------------------------------------------------

/** Select the current media selection. */
export const selectMediaSelection = (project: Project) =>
  project.timeline.mediaSelection;

/** Select the currently selected clip IDs. */
export const selectSelectedClipIds = (project: Project) =>
  project.timeline.mediaSelection.clipIds;

/** Select the currently selected transposition IDs. */
export const selectSelectedPoseIds = (project: Project) =>
  project.timeline.mediaSelection.poseIds;

/** Select the currently selected portal IDs. */
export const selectSelectedPortalIds = (project: Project) =>
  project.timeline.mediaSelection.portalIds;

/** Select the currently selected clips. */
export const selectSelectedClips = createDeepEqualSelector(
  [selectClipMap, selectSelectedClipIds],
  (clipMap, selectedClipIds) => getValuesByKeys(clipMap, selectedClipIds)
);

/** Select the currently selected transpositions. */
export const selectSelectedPoses = createDeepEqualSelector(
  [selectTranspositionMap, selectSelectedPoseIds],
  (poseMap, poseIds) => getValuesByKeys(poseMap, poseIds)
);

/** Select the currently selected portals. */
export const selectSelectedPortals = createDeepEqualSelector(
  [selectPortalMap, selectSelectedPortalIds],
  (portalMap, portalIds) => getValuesByKeys(portalMap, portalIds)
);

/** Select all selected media. */
export const selectSelectedMediaClips = createDeepEqualSelector(
  [selectSelectedClips, selectSelectedPoses],
  (clips, poses): MediaClip[] => [...clips, ...poses]
);

/** Select all selected media clips. */
export const selectSelectedMedia = createDeepEqualSelector(
  [selectSelectedClips, selectSelectedPoses, selectSelectedPortals],
  (clips, poses, portals): Media => [...clips, ...poses, ...portals]
);

// ------------------------------------------------------------
// Media Draft
// ------------------------------------------------------------

/** Select the current media draft. */
export const selectMediaDraft = (project: Project) =>
  project.timeline.mediaDraft;

/** Select the currently drafted clip. */
export const selectDraftedClip = (project: Project) =>
  project.timeline.mediaDraft.clip;

/** Select the currently drafted transposition. */
export const selectDraftedPose = (project: Project) =>
  project.timeline.mediaDraft.pose;

/** Select the currently drafted transposition. */
export const selectDraftedPortal = (project: Project) =>
  project.timeline.mediaDraft.portal;

/** Select the currently selected pattern. */
export const selectSelectedPattern = (project: Project) => {
  const patternMap = selectPatternMap(project);
  const { patternId } = selectDraftedClip(project);
  return getValueByKey(patternMap, patternId);
};

// ------------------------------------------------------------
// Media Clipboard
// ------------------------------------------------------------

/** Select the current media clipboard.*/
export const selectMediaClipboard = (project: Project) =>
  project.timeline.mediaClipboard;

/** Select the currently copied clips. */
export const selectCopiedClips = (project: Project) =>
  project.timeline.mediaClipboard.clips;

/** Select the currently copied transpositions. */
export const selectCopiedPoses = (project: Project) =>
  project.timeline.mediaClipboard.poses;

/** Select the currently copied portals. */
export const selectCopiedPortals = (project: Project) =>
  project.timeline.mediaClipboard.portals;

// ------------------------------------------------------------
// Media Drag State
// ------------------------------------------------------------

/** Select the current media drag state. */
export const selectMediaDragState = (project: Project) =>
  project.timeline.mediaDragState;

// ------------------------------------------------------------
// Transposition Settings
// ------------------------------------------------------------

/** Select the live transposition settings. */
export const selectLiveTranspositionSettings = (project: Project) =>
  project.timeline.liveTranspositionSettings;

// ------------------------------------------------------------
// Timeline Objects
// ------------------------------------------------------------

/** Select the height of a timeline object based on whether the track is collapsed. */
export const selectTimelineObjectHeight = <T>(
  project: Project,
  object?: Tracked<T>
) => {
  const cellHeight = selectCellHeight(project);
  if (isTrack(object)) {
    return object.collapsed ? COLLAPSED_TRACK_HEIGHT : cellHeight;
  } else {
    const track = selectTrackById(project, object?.trackId);
    return track?.collapsed ? COLLAPSED_TRACK_HEIGHT : cellHeight;
  }
};

/** Select the top offset of the track in pixels based on the given track ID. */
export const selectTrackedObjectTop = <T>(
  project: Project,
  object?: Tracked<T>
) => {
  const trackHierarchy = selectTrackHierarchy(project);
  const cellHeight = selectCellHeight(project);
  let found = false;
  let top = HEADER_HEIGHT;

  // Recursively get the top offset with the children
  const getChildrenTop = (childIds: string[]): number => {
    let acc = 0;

    // Iterate through each child
    for (let i = 0; i < childIds.length; i++) {
      if (found) return acc;

      // Get the child
      const id = childIds[i];
      const child = trackHierarchy.byId[id];
      if (!child) continue;

      // If the child is the object, return the top offset
      if (child.id === getTimelineObjectTrackId(object)) {
        found = true;
        return acc;
      }
      // Otherwise, add the height of the child and its children
      acc += child.collapsed ? COLLAPSED_TRACK_HEIGHT : cellHeight;
      acc += getChildrenTop(child.trackIds);
    }
    return acc;
  };

  // Iterate through each top-level track
  const topLevelIdCount = trackHierarchy.topLevelIds.length;
  for (let i = 0; i < topLevelIdCount; i++) {
    // If the object is found, return the top offset
    if (found) return top;

    // Get the top-level id
    const topLevelId = trackHierarchy.topLevelIds[i];
    if (topLevelId === getTimelineObjectTrackId(object)) break;

    // Get the top-level node
    const trackNode = trackHierarchy.byId[topLevelId];
    if (!trackNode) continue;

    // Add the height of the node and its children
    top += !!trackNode.collapsed ? COLLAPSED_TRACK_HEIGHT : cellHeight;
    top += getChildrenTop(trackNode.trackIds);
  }

  // Return the top offset
  return top;
};

/** Select the track index of a timeline object. */
export const selectTimelineObjectTrackIndex = <T>(
  project: Project,
  object?: Tracked<T>
) => {
  if (!object) return -1;
  const orderedTrackIds = selectOrderedTrackIds(project);
  const id = isTrack(object) ? object.id : object.trackId;
  return orderedTrackIds.indexOf(id);
};

/** Select the width of a clip in pixels. Always at least 1 pixel. */
export const selectClipWidth = (project: Project, clip?: Clip) => {
  const pattern = selectPatternById(project, clip?.patternId);
  const duration = getClipDuration(clip, pattern);
  const timeline = selectTimeline(project);
  const cellWidth = selectCellWidth(project);
  const columns = getTickColumns(duration, timeline.subdivision);
  return Math.max(cellWidth * columns, 1);
};

/** Select the width of a transposition. */
export const selectTranspositionWidth = (
  project: Project,
  transposition: Transposition
) => {
  const { subdivision, cell } = selectTimeline(project);
  const { tick, duration } = transposition;
  const left = selectTimelineTickLeft(project, tick);
  const backgroundWidth = selectTimelineBackgroundWidth(project);

  // If the duration is not finite or a number, return the remaining background width
  if (!isFiniteNumber(duration)) return backgroundWidth - left;

  // Otherwise, return the width of the transposition
  return getTickColumns(duration, subdivision) * cell.width;
};
