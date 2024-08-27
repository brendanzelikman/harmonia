import {
  COLLAPSED_TRACK_HEIGHT,
  MEASURE_COUNT,
  TRACK_WIDTH,
} from "utils/constants";
import { getSubdivisionTicks, getTickColumns } from "utils/durations";
import { Tick } from "types/units";
import { createMapWithFn, getValueByKey, getValuesByKeys } from "utils/objects";
import { selectClipMap } from "../Clip/ClipSelectors";
import { selectPoseMap } from "../Pose/PoseSelectors";
import { createSelector } from "reselect";
import { capitalize } from "lodash";
import { createDeepSelector, createValueSelector } from "lib/redux";
import {
  ClipId,
  defaultPatternClip,
  defaultPoseClip,
  defaultScaleClip,
  isPatternClip,
  isPoseClip,
  isPoseClipId,
  isScaleClip,
} from "types/Clip/ClipTypes";
import { ClipType } from "types/Clip/ClipTypes";
import { Portal } from "types/Portal/PortalTypes";
import { Project } from "types/Project/ProjectTypes";
import { getTrackIndex } from "types/Track/TrackFunctions";
import { isPatternTrack, isScaleTrack } from "types/Track/TrackTypes";
import {
  defaultTimeline,
  DEFAULT_CELL_WIDTH,
  DEFAULT_CELL_HEIGHT,
} from "./TimelineTypes";
import { selectPatternMap } from "types/Pattern/PatternSelectors";
import { selectPortalMap } from "types/Portal/PortalSelectors";
import { selectScaleMap } from "types/Scale/ScaleSelectors";
import { selectTrackMap, selectTrackChain } from "types/Track/TrackSelectors";
import {
  defaultMediaClipboard,
  defaultMediaDraft,
  defaultMediaSelection,
  Media,
} from "types/Media/MediaTypes";
import { selectMotifState } from "types/Motif/MotifSelectors";
import { Motif } from "types/Motif/MotifTypes";

/** Select the timeline from the store. */
export const selectTimeline = (project: Project) => project.present.timeline;

// ------------------------------------------------------------
// Timeline State
// ------------------------------------------------------------

/** Select the action state of the timeline. */
export const selectTimelineState = createSelector(
  [selectTimeline],
  (timeline) => timeline.state
);

// ------------------------------------------------------------
// Timeline Selected Track
// ------------------------------------------------------------

/** Select the currently selected track ID. */
export const selectSelectedTrackId = createSelector(
  [selectTimeline],
  (timeline) => timeline.selectedTrackId
);

/** Select the currently selected track. */
export const selectSelectedTrack = createSelector(
  [selectSelectedTrackId, selectTrackMap],
  (trackId, trackMap) => getValueByKey(trackMap, trackId)
);

/** Select the currently selected pattern track. */
export const selectSelectedPatternTrack = createSelector(
  [selectSelectedTrack],
  (track) => (isPatternTrack(track) ? track : undefined)
);

/** Select the currently selected scale track. */
export const selectSelectedScaleTrack = createSelector(
  [selectSelectedTrack],
  (track) => (isScaleTrack(track) ? track : undefined)
);

/** Select the index of the currently selected track or -1 if undefined. */
export const selectSelectedTrackIndex = createSelector(
  [selectSelectedTrackId, selectTrackMap],
  (trackId, trackMap) => (trackId ? getTrackIndex(trackId, trackMap) : -1)
);

/** Select the parents of the currently selected track. */
export const selectSelectedTrackParents = (project: Project) => {
  const selectedTrack = selectSelectedTrack(project);
  if (!selectedTrack) return [];
  return selectTrackChain(project, selectedTrack.id);
};

// ------------------------------------------------------------
// Timeline Selected Type
// ------------------------------------------------------------

/** Select the current clip type. */
export const selectSelectedClipType = createSelector(
  [selectTimeline],
  (timeline) => timeline.selectedClipType
);

// ------------------------------------------------------------
// Timeline Media Selection
// ------------------------------------------------------------

/** Select the current media selection. */
export const selectMediaSelection = createDeepSelector(
  [selectTimeline],
  (timeline) => timeline.mediaSelection || defaultMediaSelection
);

/** Select the currently selected clip IDs. */
export const selectSelectedClipIds = createDeepSelector(
  [selectMediaSelection],
  (selection) => selection?.clipIds ?? []
);

/** Select the boolean map of selected clips. */
export const selectSelectedClipIdMap = createDeepSelector(
  [selectSelectedClipIds],
  (clipIds) =>
    clipIds.reduce(
      (map, id) => ({ ...map, [id]: true }),
      {} as Record<ClipId, boolean>
    )
);

/** Select the currently selected portal IDs. */
export const selectSelectedPortalIds = createDeepSelector(
  [selectMediaSelection],
  (selection) => selection?.portalIds ?? []
);

/** Select all selected clips. */
export const selectSelectedClips = createDeepSelector(
  [selectSelectedClipIds, selectClipMap],
  (clipIds, clipMap) => getValuesByKeys(clipMap, clipIds)
);

/** Select the currently selected pattern clips. */
export const selectSelectedPatternClips = createDeepSelector(
  [selectSelectedClips],
  (clips) => clips.filter(isPatternClip)
);

/** Select the currently selected pose clips. */
export const selectSelectedPoseClips = createDeepSelector(
  [selectSelectedClips],
  (clips) => clips.filter(isPoseClip)
);

/** Select the currently selected scale clips. */
export const selectSelectedScaleClips = createDeepSelector(
  [selectSelectedClips],
  (clips) => clips.filter(isScaleClip)
);

/** Select the currently selected portals. */
export const selectSelectedPortals = createDeepSelector(
  [selectPortalMap, selectSelectedPortalIds],
  (portalMap, portalIds) =>
    getValuesByKeys(portalMap, portalIds).filter(Boolean) as Portal[]
);

/** Select all selected media. */
export const selectSelectedMedia = createDeepSelector(
  [selectSelectedClips, selectSelectedPortals],
  (clips, portals): Media => [...clips, ...portals]
);

/** Select if the timeline is live */
export const selectIsLive = createSelector(
  [selectSelectedTrackId, selectSelectedClipIds],
  (trackId, clipIds) => trackId !== undefined && clipIds?.some(isPoseClipId)
);

// ------------------------------------------------------------
// Timeline Media Draft
// ------------------------------------------------------------

/** Select the current media draft. */
export const selectMediaDraft = createDeepSelector(
  [selectTimeline],
  (timeline) => timeline.mediaDraft || defaultMediaDraft
);

// ------------------------------------------------------------
// Timeline Media Clipboard
// ------------------------------------------------------------

/** Select the current media clipboard.*/
export const selectMediaClipboard = createDeepSelector(
  [selectTimeline],
  (timeline) => timeline.mediaClipboard || defaultMediaClipboard
);

/** Select the currently copied clips. */
export const selectCopiedClips = createDeepSelector(
  [selectMediaClipboard],
  (clipboard) => clipboard?.clips ?? []
);

/** Select the currently copied portals. */
export const selectCopiedPortals = createDeepSelector(
  [selectMediaClipboard],
  (clipboard) => clipboard?.portals ?? []
);

// ------------------------------------------------------------
// Timeline Subdivision
// ------------------------------------------------------------

/** Select the subdivision of the timeline. */
export const selectSubdivision = createSelector(
  [selectTimeline],
  (timeline) => timeline.subdivision || defaultTimeline.subdivision
);

/** Select the width of a timeline cell. */
export const selectCellWidth = createSelector(
  [selectTimeline],
  (timeline) => timeline.cellWidth || DEFAULT_CELL_WIDTH
);

/** Select the height of a timeline cell. */
export const selectCellHeight = createSelector(
  [selectTimeline],
  (timeline) => timeline.cellHeight || DEFAULT_CELL_HEIGHT
);

// ------------------------------------------------------------
// Timeline Durations
// ------------------------------------------------------------

/** Select the number of ticks in a timeline subdivision. */
export const selectSubdivisionTicks = createSelector(
  [selectSubdivision],
  (subdivision) => getSubdivisionTicks(subdivision)
);

/** Select the timeline column count. */
export const selectTimelineColumns = createSelector(
  [selectSubdivisionTicks],
  (ticks) => ticks * MEASURE_COUNT * 64
);

/** Select the current tick using the given column based on the timeline subdivision. */
export const selectColumnTicks = (project: Project, column: number) => {
  const ticks = selectSubdivisionTicks(project);
  return ticks * column;
};

/** Select the left offset of the timeline tick in pixels. */
export const selectTimelineTickLeft = (project: Project, tick: Tick = 0) => {
  const timeline = selectTimeline(project);
  const cellWidth = selectCellWidth(project);
  const columns = getTickColumns(tick, timeline.subdivision);
  return TRACK_WIDTH + Math.round(columns * cellWidth);
};

/** Select the background width of the timeline. */
export const selectTimelineBackgroundWidth = createSelector(
  [selectTimelineColumns, selectCellWidth],
  (columns, cellWidth) => columns * cellWidth + TRACK_WIDTH
);

// ------------------------------------------------------------
// Timeline State
// ------------------------------------------------------------

/** Select if the timeline is adding some kind of clips */
export const selectIsTimelineAddingClips = createSelector(
  [selectTimelineState],
  (state) => state?.startsWith("adding")
);

/** Select if the timeline is adding pattern clips. */
export const selectIsTimelineAddingPatternClips = createSelector(
  [selectTimelineState],
  (state) => state === "adding-pattern-clips"
);

/** Select if the timeline is adding pose clips. */
export const selectIsTimelineAddingPoseClips = createSelector(
  [selectTimelineState],
  (state) => state === "adding-pose-clips"
);

/** Select if the timeline is adding scale clips. */
export const selectIsTimelineAddingScaleClips = createSelector(
  [selectTimelineState],
  (state) => state === "adding-scale-clips"
);

/** Select if the timeline is portaling clips. */
export const selectIsTimelinePortalingClips = createSelector(
  [selectTimelineState],
  (state) => state === "portaling-clips"
);

/** Select if the timeline is slicing scale clips. */
export const selectIsTimelineSlicingClips = createSelector(
  [selectTimelineState],
  (state) => state === "slicing-clips"
);

/** Select if the timeline is adding the selected clip. */
export const selectIsTimelineAddingSelectedClip = createSelector(
  [selectTimelineState, selectSelectedClipType],
  (state, type) => state === `adding-${type}-clips`
);

export const selectIsTimelineLive = createSelector(
  [selectSelectedTrackId, selectSelectedClipIds],
  (trackId, clipIds) => {
    const onTrack = !!trackId;
    const onPoseClip = !!clipIds.some(isPoseClipId);
    return onTrack && onPoseClip;
  }
);

// ------------------------------------------------------------
// Media Draft
// ------------------------------------------------------------

/** Select the currently drafted pattern clip. */
export const selectDraftedPatternClip = createSelector(
  [selectTimeline],
  (timeline) => timeline.mediaDraft?.patternClip ?? defaultPatternClip
);

/** Select the currently drafted pose clip. */
export const selectDraftedPoseClip = createSelector(
  [selectTimeline],
  (timeline) => timeline.mediaDraft?.poseClip ?? defaultPoseClip
);

/** Select the currently drafted scale clip. */
export const selectDraftedScaleClip = createSelector(
  [selectTimeline],
  (timeline) => timeline.mediaDraft?.scaleClip ?? defaultScaleClip
);

/** Select the currently drafted clip */
export const selectDraftedClip = (project: Project) => {
  const type = selectSelectedClipType(project);
  if (!type) return undefined;
  return {
    pattern: selectDraftedPatternClip(project),
    pose: selectDraftedPoseClip(project),
    scale: selectDraftedScaleClip(project),
  }[type];
};

/** Select the currently selected pattern. */
export const selectSelectedPattern = createDeepSelector(
  [selectPatternMap, selectDraftedPatternClip],
  (patternMap, { patternId }) => getValueByKey(patternMap, patternId)
);

/** Select the currently selected pose. */
export const selectSelectedPose = createDeepSelector(
  [selectPoseMap, selectDraftedPoseClip],
  (poseMap, { poseId }) => getValueByKey(poseMap, poseId)
);

/** Select the currently selected scale. */
export const selectSelectedScale = createDeepSelector(
  [selectScaleMap, selectDraftedScaleClip],
  (scaleMap, { scaleId }) => getValueByKey(scaleMap, scaleId)
);

/** Select the currently selected motif. */
export const selectSelectedMotif = (project: Project, type?: ClipType) => {
  const timeline = selectTimeline(project);
  const motifType = type ?? timeline.selectedClipType;
  if (!motifType) return undefined;
  return {
    pattern: selectSelectedPattern,
    pose: selectSelectedPose,
    scale: selectSelectedScale,
  }[motifType](project);
};

/** Select the name of a potential new motif. */
export const selectNewMotifName = (project: Project, type: ClipType) => {
  const motifs = selectMotifState(project);
  const Type = capitalize(type);
  if (!type) return `New ${Type}`;

  const refs: Motif[] = Object.values(motifs[type].entities);

  let champ = `New ${Type}`;
  let champCount = 1;

  while (refs.some((p) => p.name === champ)) {
    champ = `New ${Type} ${++champCount}`;
  }

  return champ;
};

export const selectPortalFragment = createSelector(
  [selectTimeline],
  (timeline) => timeline.mediaDraft?.portal
);

// ------------------------------------------------------------
// Timeline Tracks
// ------------------------------------------------------------

export const selectTrackHeightMap = createDeepSelector(
  [selectTrackMap, selectCellHeight],
  (trackMap, cellHeight) =>
    createMapWithFn(trackMap, (track) =>
      track?.collapsed ? COLLAPSED_TRACK_HEIGHT : cellHeight
    )
);

/** Select the height of a track based on whether it is collapsed. */
export const selectTrackHeight = createValueSelector(selectTrackHeightMap, 0);
