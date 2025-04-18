import {
  COLLAPSED_TRACK_HEIGHT,
  MEASURE_COUNT,
  TRACK_WIDTH,
} from "utils/constants";
import {
  DURATION_TICKS,
  getCellsPerTick,
  getSubdivisionTicks,
  getTickColumns,
} from "utils/duration";
import { Tick, Timed } from "types/units";
import { selectClipDurationMap, selectClipMap } from "../Clip/ClipSelectors";
import { selectPoseMap } from "../Pose/PoseSelectors";
import { createSelector } from "reselect";
import { capitalize, pick, uniq, values } from "lodash";
import { createDeepSelector } from "types/redux";
import {
  Clip,
  ClipId,
  isPatternClip,
  isPoseClip,
  PatternClip,
  PoseClip,
} from "types/Clip/ClipTypes";
import { ClipType } from "types/Clip/ClipTypes";
import { Portal } from "types/Portal/PortalTypes";
import { Project } from "types/Project/ProjectTypes";
import { getTrackIndex } from "types/Track/TrackFunctions";
import {
  isPatternTrack,
  isScaleTrack,
  Track,
  TrackId,
} from "types/Track/TrackTypes";
import { defaultTimeline } from "./TimelineTypes";
import { DEFAULT_CELL_WIDTH, DEFAULT_CELL_HEIGHT } from "utils/constants";
import { selectPatternMap } from "types/Pattern/PatternSelectors";
import { selectPortalMap } from "types/Portal/PortalSelectors";
import {
  selectTrackMap,
  selectScaleTrackChainIdsMap,
  selectTrackById,
} from "types/Track/TrackSelectors";
import {
  defaultMediaClipboard,
  defaultMediaSelection,
  Media,
} from "types/Media/MediaTypes";
import { Pose } from "types/Pose/PoseTypes";
import { getTransport } from "tone";

/** Select the timeline from the store. */
export const selectTimeline = (project: Project) => project.present.timeline;

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

export const selectIsTrackSelected = (project: Project, id: TrackId) => {
  const selectedId = selectSelectedTrackId(project);
  return selectedId === id;
};

/** Select the currently selected track. */
export const selectSelectedTrack = createSelector(
  [selectSelectedTrackId, selectTrackMap],
  (trackId, trackMap) => (trackId ? trackMap[trackId] : undefined)
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
export const selectSelectedTrackParents = createDeepSelector(
  [selectSelectedTrack, selectScaleTrackChainIdsMap, selectTrackMap],
  (track, chainIds, trackMap) => {
    if (!track) return [];
    const parents = chainIds[track.id] || [];
    return parents.map((id) => trackMap[id]).filter(Boolean) as Track[];
  }
);

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
    values(pick(clipMap, clipIds))
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

/** Select the track IDs of the currently selected clips */
export const selectSelectedClipTrackIds = createDeepSelector(
  [selectSelectedClips],
  (clips) => uniq(clips.map((clip) => clip.trackId))
);

/** Select the currently selected portals. */
export const selectSelectedPortals = createDeepSelector(
  [selectPortalMap, selectSelectedPortalIds],
  (portalMap, portalIds) =>
    values(pick(portalMap, portalIds))
      .filter(Boolean)
      .map((portal) => ({ ...portal, duration: 1 })) as Timed<Portal>[]
);

/** Select all selected media. */
export const selectSelectedMedia = createDeepSelector(
  [selectSelectedClips, selectSelectedPortals],
  (clips, portals): Media => [...clips, ...portals]
);

/** Select the currently selected pattern clips. */
export const selectIsSelectingPatternClips = createSelector(
  [selectSelectedPatternClips],
  (clips) => clips.length > 0
);

/** Select the currently selected pose clips. */
export const selectIsSelectingPoseClips = createSelector(
  [selectSelectedPoseClips],
  (clips) => clips.length > 0
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
export const selectSubdivision = createDeepSelector(
  [selectTimeline],
  (timeline) => timeline.subdivision || defaultTimeline.subdivision
);

/** Select the width of a timeline cell. */
export const selectCellWidth = createDeepSelector(
  [selectTimeline],
  (timeline) => timeline.cellWidth || DEFAULT_CELL_WIDTH
);

/** Select the height of a timeline cell. */
export const selectCellHeight = createDeepSelector(
  [selectTimeline],
  (timeline) => timeline.cellHeight || DEFAULT_CELL_HEIGHT
);

/** Select the cells per tick. */
export const selectCellsPerTick = createDeepSelector(
  [selectSubdivision, selectCellWidth],
  getCellsPerTick
);

// ------------------------------------------------------------
// Timeline Durations
// ------------------------------------------------------------

/** Select the number of ticks in a timeline subdivision. */
export const selectSubdivisionTicks = createDeepSelector(
  [selectSubdivision],
  (subdivision) => getSubdivisionTicks(subdivision)
);

/** Select the timeline column count. */
export const selectTimelineColumns = createDeepSelector(
  [selectSubdivisionTicks],
  (ticks) => ticks * MEASURE_COUNT * 64
);

/** Select the current tick using the given column based on the timeline subdivision. */
export const selectColumnTicks = (project: Project, column: number) => {
  const ticks = selectSubdivisionTicks(project);
  return ticks * column;
};

/** Cache to avoid repetitive division */
export const selectCachedTickColumns = createDeepSelector(
  [selectSubdivisionTicks],
  (subdivision) => {
    return Object.fromEntries(
      Object.entries(DURATION_TICKS).map(([_, tick]) => [
        tick,
        tick / subdivision,
      ])
    ) as Record<number, number>;
  }
);

/* Try to find a cached value and then manually divide for other durations */
export const selectTickColumns = (project: Project, ticks: number) => {
  const cachedColumns = selectCachedTickColumns(project);
  return cachedColumns[ticks] ?? ticks / selectSubdivisionTicks(project);
};

/** Select the timeline tick */
export const selectTimelineTick = createSelector(
  [selectTimeline],
  (timeline) => timeline.tick ?? 0
);

/** Select the current timeline or transport tick */
export const selectCurrentTimelineTick = (project: Project) => {
  const tick = selectTimelineTick(project);
  return tick || getTransport().ticks;
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

/** Select if the timeline is editing tracks. */
export const selectIsEditingTracks = createSelector(
  [selectTimeline],
  (timeline) => timeline.state === "editing-tracks"
);

/** Select if the timeline is editing a specific track. */
export const selectIsEditingTrack = (project: Project, id: TrackId) => {
  const isEditing = selectIsEditingTracks(project);
  const selectedId = selectSelectedTrackId(project);
  return isEditing && selectedId === id;
};

/** Select if gestures are enabled. */
export const selectAreGesturesEnabled = createSelector(
  [selectTimeline],
  (timeline) => timeline.state !== "editing-tracks"
);

/** Select if gestures are disabled. */
export const selectAreGesturesDisabled = createSelector(
  [selectTimeline],
  (timeline) => timeline.state === "editing-tracks"
);

// ------------------------------------------------------------
// Media Draft
// ------------------------------------------------------------

/** Select the name of a potential new motif. */
export const selectNewMotifName = (project: Project, type: ClipType) => {
  const Type = capitalize(type);
  if (!type) return `New ${Type}`;

  const refs: { name: string }[] = Object.values(
    type === "pattern" ? selectPatternMap(project) : selectPoseMap(project)
  );

  let champ = `${Type} 1`;
  let champCount = 1;

  while (refs.some((p) => p.name === champ)) {
    champ = `${Type} ${++champCount}`;
  }

  return champ;
};

export const selectPortalFragment = createSelector(
  [selectTimeline],
  (timeline) => timeline.fragment
);

/** Select true if the user has a portal fragment */
export const selectHasPortalFragment = createSelector(
  [selectPortalFragment],
  (fragment) => fragment.tick !== undefined || fragment.trackId !== undefined
);

export const selectIsClipSelected = (project: Project, id: ClipId) => {
  const selection = selectSelectedClipIdMap(project);
  return !!selection[id];
};

// ------------------------------------------------------------
// Timeline Tracks
// ------------------------------------------------------------

/** Select the height of a track based on whether it is collapsed. */
export const selectTrackHeight = (project: Project, id: TrackId) => {
  return selectTrackById(project, id)?.collapsed
    ? COLLAPSED_TRACK_HEIGHT
    : selectCellHeight(project);
};
