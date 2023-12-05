import {
  COLLAPSED_TRACK_HEIGHT,
  HEADER_HEIGHT,
  MEASURE_COUNT,
  TRACK_WIDTH,
} from "utils/constants";
import { getSubdivisionTicks, getTickColumns } from "utils/durations";
import { Project } from "types/Project";
import { getTimelineObjectTrackId } from "types/Timeline";
import { Track, Tracked, getTrackIndex, isTrack } from "types/Track";
import { Media } from "types/Media";
import { Tick } from "types/units";
import { getValueByKey, getValuesByKeys } from "utils/objects";
import { createDeepEqualSelector } from "redux/util";
import { selectPatternMap } from "redux/Pattern/PatternSelectors";
import {
  selectTrackById,
  selectTrackMap,
  selectScaleTrackChain,
  selectTrackIds,
  selectTopLevelTracks,
  selectTrackChildren,
} from "../Track/TrackSelectors";
import { selectClipMap } from "../Clip/ClipSelectors";
import { selectPoseMap } from "../Pose/PoseSelectors";
import {
  Clip,
  PatternClip,
  PatternClipId,
  PoseClip,
  PoseClipId,
  getClipDuration,
  isPatternClip,
  isPoseClip,
} from "types/Clip";
import { isFiniteNumber } from "types/util";
import { selectPortalMap } from "redux/Portal/PortalSelectors";
import { createSelector } from "reselect";

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
export const selectSelectedTrackIndex = createSelector(
  [selectSelectedTrackId, selectTrackMap],
  (trackId, trackMap) => (trackId ? getTrackIndex(trackId, trackMap) : -1)
);

/** Select the parents of the currently selected track. */
export const selectSelectedTrackParents = (project: Project) => {
  const selectedTrack = selectSelectedTrack(project);
  if (!selectedTrack) return [];
  return selectScaleTrackChain(project, selectedTrack.id);
};

// ------------------------------------------------------------
// Media Selection
// ------------------------------------------------------------

/** Select the current media selection. */
export const selectMediaSelection = (project: Project) =>
  project.timeline.mediaSelection;

/** Select the currently selected pattern clip IDs. */
export const selectSelectedPatternClipIds = (
  project: Project
): PatternClipId[] => project.timeline.mediaSelection.patternClipIds;

/** Select the currently selected pose clip IDs. */
export const selectSelectedPoseClipIds = (project: Project): PoseClipId[] =>
  project.timeline.mediaSelection.poseClipIds;

/** Select the currently selected clip IDs. */
export const selectSelectedClipIds = (project: Project) => {
  const { patternClipIds, poseClipIds } = project.timeline.mediaSelection;
  return [...patternClipIds, ...poseClipIds];
};

/** Select the currently selected portal IDs. */
export const selectSelectedPortalIds = (project: Project) =>
  project.timeline.mediaSelection.portalIds;

/** Select the currently selected clips. */
export const selectSelectedPatternClips = createDeepEqualSelector(
  [selectClipMap, selectSelectedPatternClipIds],
  (clipMap, selectedClipIds) =>
    getValuesByKeys(clipMap, selectedClipIds).filter(isPatternClip)
);

/** Select the currently selected poses. */
export const selectSelectedPoseClips = createDeepEqualSelector(
  [selectClipMap, selectSelectedPoseClipIds],
  (poseMap, poseIds) => getValuesByKeys(poseMap, poseIds).filter(isPoseClip)
);

/** Select the currently selected portals. */
export const selectSelectedPortals = createDeepEqualSelector(
  [selectPortalMap, selectSelectedPortalIds],
  (portalMap, portalIds) => getValuesByKeys(portalMap, portalIds)
);

/** Select all selected clips. */
export const selectSelectedClips = createDeepEqualSelector(
  [selectSelectedPatternClips, selectSelectedPoseClips],
  (patternClips, poseClips) => [...patternClips, ...poseClips]
);

/** Select all selected media. */
export const selectSelectedMedia = createDeepEqualSelector(
  [selectSelectedClips, selectSelectedPortals],
  (clips, portals): Media => [...clips, ...portals]
);

// ------------------------------------------------------------
// Media Draft
// ------------------------------------------------------------

/** Select the current media draft. */
export const selectMediaDraft = (project: Project) =>
  project.timeline.mediaDraft;

/** Select the currently drafted clip. */
export const selectDraftedPatternClip = (project: Project) =>
  project.timeline.mediaDraft.patternClip;

/** Select the currently drafted pose. */
export const selectDraftedPoseClip = (project: Project) =>
  project.timeline.mediaDraft.poseClip;

/** Select the currently drafted pose. */
export const selectDraftedPortal = (project: Project) =>
  project.timeline.mediaDraft.portal;

/** Select the currently selected pattern. */
export const selectSelectedPattern = (project: Project) => {
  const patternMap = selectPatternMap(project);
  const { patternId } = selectDraftedPatternClip(project);
  return getValueByKey(patternMap, patternId);
};

/** Select the currently selected pose. */
export const selectSelectedPose = (project: Project) => {
  const poseMap = selectPoseMap(project);
  const { poseId } = selectDraftedPoseClip(project);
  return getValueByKey(poseMap, poseId);
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
// Pose Settings
// ------------------------------------------------------------

/** Select the live pose settings. */
export const selectLivePlaySettings = (project: Project) =>
  project.timeline.livePlay;

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
  const topLevelTracks = selectTopLevelTracks(project);
  const cellHeight = selectCellHeight(project);
  let found = false;
  let top = HEADER_HEIGHT;

  // Recursively get the top offset with the children
  const getChildrenTop = (tracks: Track[]): number => {
    let acc = 0;

    // Iterate through each child
    for (let i = 0; i < tracks.length; i++) {
      if (found) return acc;

      // Get the child
      const child = tracks[i];
      if (!child) continue;

      // If the child is the object, return the top offset
      if (child.id === getTimelineObjectTrackId(object)) {
        found = true;
        return acc;
      }
      // Otherwise, add the height of the child and its children
      const children = selectTrackChildren(project, child.id);
      acc += child.collapsed ? COLLAPSED_TRACK_HEIGHT : cellHeight;
      acc += getChildrenTop(children);
    }
    return acc;
  };

  // Iterate through each top-level track
  const topLevelIdCount = topLevelTracks.length;
  for (let i = 0; i < topLevelIdCount; i++) {
    // If the object is found, return the top offset
    if (found) return top;

    // Get the top-level track
    const topLevelTrack = topLevelTracks[i];
    if (topLevelTrack.id === getTimelineObjectTrackId(object)) break;

    // Add the height of the node and its children
    top += !!topLevelTrack.collapsed ? COLLAPSED_TRACK_HEIGHT : cellHeight;
    const children = selectTrackChildren(project, topLevelTrack.id);
    top += getChildrenTop(children);
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
  const orderedTrackIds = selectTrackIds(project);
  const id = isTrack(object) ? object.id : object.trackId;
  return orderedTrackIds.indexOf(id);
};

/** Select the width of a pattern clip in pixels. Always at least 1 pixel. */
export const selectPatternClipWidth = (
  project: Project,
  clip?: PatternClip
) => {
  if (!clip) return 1;
  const timeline = selectTimeline(project);
  const duration = getClipDuration(clip);
  const columns = getTickColumns(duration, timeline.subdivision);
  const width = Math.max(timeline.cell.width * columns, 1);
  return width;
};

/** Select the width of a pose clip in pixels. */
export const selectPoseClipWidth = (project: Project, clip?: PoseClip) => {
  if (!clip) return 1;
  const timeline = selectTimeline(project);
  const duration = getClipDuration(clip);
  const backgroundWidth = selectTimelineBackgroundWidth(project);
  const left = selectTimelineTickLeft(project, clip.tick);

  // If the duration is infinite, return the remaining width of the timeline
  if (!isFiniteNumber(duration)) return backgroundWidth - left;

  // Otherwise, return the width of the pose
  const columns = getTickColumns(duration, timeline.subdivision);
  const width = Math.max(timeline.cell.width * columns, 1);
  return width;
};

/** Select the width of a clip in pixels. */
export const selectClipWidth = (project: Project, clip?: Clip) => {
  if (isPatternClip(clip)) return selectPatternClipWidth(project, clip);
  if (isPoseClip(clip)) return selectPoseClipWidth(project, clip);
  return 1;
};
