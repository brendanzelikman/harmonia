import {
  COLLAPSED_TRACK_HEIGHT,
  MEASURE_COUNT,
  TRACK_WIDTH,
} from "utils/constants";
import { getSubdivisionTicks, getTickColumns } from "utils/durations";
import { Tick, Timed } from "types/units";
import { getValueByKey, getValuesByKeys } from "utils/objects";
import { selectClipDurationMap, selectClipMap } from "../Clip/ClipSelectors";
import { selectPoseMap } from "../Pose/PoseSelectors";
import { createSelector } from "reselect";
import { capitalize, mapValues, some } from "lodash";
import { createDeepSelector, createValueSelector } from "lib/redux";
import {
  Clip,
  ClipId,
  defaultPatternClip,
  defaultPoseClip,
  defaultScaleClip,
  isPatternClip,
  isPoseClip,
  isPoseClipId,
  isScaleClip,
  PatternClip,
  PoseClip,
  ScaleClip,
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
  (timeline) => timeline.selection?.trackId
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
export const selectTimelineType = createSelector(
  [selectTimeline],
  (timeline) => timeline.type
);

// ------------------------------------------------------------
// Timeline Media Selection
// ------------------------------------------------------------

/** Select the current media selection. */
export const selectMediaSelection = createDeepSelector(
  [selectTimeline],
  (timeline) => timeline.selection || defaultMediaSelection
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
  [selectSelectedClipIds, selectClipMap, selectClipDurationMap],
  (clipIds, clipMap, durationMap) =>
    getValuesByKeys(clipMap, clipIds)
      .filter(Boolean)
      .map((clip) => ({
        ...clip,
        duration: durationMap[clip.id] ?? clip.duration,
      })) as Timed<Clip>[]
);

/** Select the currently selected pattern clips. */
export const selectSelectedPatternClips = createDeepSelector(
  [selectSelectedClips],
  (clips) => clips.filter(isPatternClip) as Timed<PatternClip>[]
);

/** Select the currently selected pose clips. */
export const selectSelectedPoseClips = createDeepSelector(
  [selectSelectedClips],
  (clips) => clips.filter(isPoseClip) as Timed<PoseClip>[]
);

/** Select the currently selected scale clips. */
export const selectSelectedScaleClips = createDeepSelector(
  [selectSelectedClips],
  (clips) => clips.filter(isScaleClip) as Timed<ScaleClip>[]
);

/** Select the currently selected portals. */
export const selectSelectedPortals = createDeepSelector(
  [selectPortalMap, selectSelectedPortalIds],
  (portalMap, portalIds) =>
    getValuesByKeys(portalMap, portalIds)
      .filter(Boolean)
      .map((portal) => ({ ...portal, duration: 1 })) as Timed<Portal>[]
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

/** Select the current draft. */
export const selectDraft = createDeepSelector(
  [selectTimeline],
  (timeline) => timeline.draft || defaultMediaDraft
);

/** Select the drafted portal  */
export const selectPortalDraft = createSelector(
  [selectDraft],
  (draft) => draft.portal
);

// ------------------------------------------------------------
// Timeline Media Clipboard
// ------------------------------------------------------------

/** Select the current clipboard.*/
export const selectClipboard = createDeepSelector(
  [selectTimeline],
  (timeline) => timeline.clipboard || defaultMediaClipboard
);

/** Select the currently copied clips. */
export const selectCopiedClips = createDeepSelector(
  [selectClipboard],
  (clipboard) => clipboard?.clips ?? []
);

/** Select the currently copied portals. */
export const selectCopiedPortals = createDeepSelector(
  [selectClipboard],
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
export const selectIsAddingClips = createSelector(
  [selectTimeline],
  (timeline) => timeline.state === "adding-clips"
);

/** Select if the timeline is adding pattern clips. */
export const selectIsAddingPatternClips = createSelector(
  [selectTimeline],
  (timeline) => timeline.state === "adding-clips" && timeline.type === "pattern"
);

/** Select if the timeline is adding pose clips. */
export const selectIsAddingPoseClips = createSelector(
  [selectTimeline],
  (timeline) => timeline.state === "adding-clips" && timeline.type === "pose"
);

/** Select if the timeline is adding scale clips. */
export const selectIsAddingScaleClips = createSelector(
  [selectTimeline],
  (timeline) => timeline.state === "adding-clips" && timeline.type === "scale"
);

/** Select if the timeline is portaling clips. */
export const selectIsAddingPortals = createSelector(
  [selectTimeline],
  (timeline) => timeline.state === "portaling-clips"
);

/** Select if the timeline is slicing clips. */
export const selectIsSlicingClips = createSelector(
  [selectTimeline],
  (timeline) => timeline.state === "slicing-clips"
);

// ------------------------------------------------------------
// Media Draft
// ------------------------------------------------------------

/** Select the currently drafted pattern clip. */
export const selectDraftedPatternClip = createSelector(
  [selectTimeline],
  (timeline) => timeline.draft?.patternClip ?? defaultPatternClip
);

/** Select the currently drafted pose clip. */
export const selectDraftedPoseClip = createSelector(
  [selectTimeline],
  (timeline) => timeline.draft?.poseClip ?? defaultPoseClip
);

/** Select the currently drafted scale clip. */
export const selectDraftedScaleClip = createSelector(
  [selectTimeline],
  (timeline) => timeline.draft?.scaleClip ?? defaultScaleClip
);

/** Select the currently drafted clip */
export const selectDraftedClip = (project: Project) => {
  const type = selectTimelineType(project);
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
export const selectSelectedMotif = (
  project: Project,
  type: ClipType | undefined = selectTimelineType(project)
) => {
  const timeline = selectTimeline(project);
  if (!type) return undefined;
  return {
    pattern: selectSelectedPattern,
    pose: selectSelectedPose,
    scale: selectSelectedScale,
  }[type](project);
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
  (timeline) => timeline.draft?.portal
);

export const selectHasPortalFragment = createSelector(
  [selectPortalFragment],
  (portal) => some(portal)
);

// ------------------------------------------------------------
// Timeline Tracks
// ------------------------------------------------------------

export const selectTrackHeightMap = createDeepSelector(
  [selectTrackMap, selectCellHeight],
  (trackMap, cellHeight) =>
    mapValues(trackMap, (track) =>
      track?.collapsed ? COLLAPSED_TRACK_HEIGHT : cellHeight
    )
);

/** Select the height of a track based on whether it is collapsed. */
export const selectTrackHeight = createValueSelector(selectTrackHeightMap, 0);
