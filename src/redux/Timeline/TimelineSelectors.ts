import {
  COLLAPSED_TRACK_HEIGHT,
  HEADER_HEIGHT,
  MEASURE_COUNT,
  TRACK_WIDTH,
} from "utils/constants";
import { subdivisionToTicks, ticksToColumns } from "utils";
import { Project } from "types/Project";
import { createSelector } from "reselect";
import { InstrumentChordRecord } from "types/Instrument";
import { getPatternChordAtTick } from "types/Pattern";
import { ClipId, getClipDuration } from "types/Clip";
import { TimelineObject, getTimelineObjectTrackId } from "types/Timeline";
import { isTrack } from "types/Track";
import { Media } from "types/Media";
import { Tick } from "types/units";
import { getProperty, getProperties } from "types/util";
import { createDeepEqualSelector } from "redux/util";
import { selectPatternMap } from "redux/Pattern/PatternSelectors";
import {
  selectOrderedTrackIds,
  selectTrackById,
  selectTrackMap,
  selectTrackParents,
} from "../Track/TrackSelectors";
import {
  selectClipDuration,
  selectClipMap,
  selectClipStreams,
  selectClips,
} from "../Clip/ClipSelectors";
import { selectTranspositionMap } from "../Transposition/TranspositionSelectors";
import { selectTrackHierarchy } from "../TrackHierarchy/TrackHierarchySelectors";
import { selectPatternTrackMap } from "../PatternTrack/PatternTrackSelectors";
import { selectTransport } from "../Transport/TransportSelectors";

/**
 * Select the timeline object from the store.
 */
export const selectTimelineObject = (
  project: Project,
  object: TimelineObject
) => object;

/**
 * Select the timeline from the store.
 */
export const selectTimeline = (project: Project) => project.timeline;

/**
 * Select the timeline cell.
 */
export const selectCell = (project: Project) => project.timeline.cell;

/**
 * Select the width of a timeline cell.
 */
export const selectCellWidth = (project: Project) =>
  project.timeline.cell.width;

/**
 * Select the height of a timeline cell.
 */
export const selectCellHeight = (project: Project) =>
  project.timeline.cell.height;

/**
 * Select the currently selected track ID.
 */
export const selectSelectedTrackId = (project: Project) =>
  project.timeline.selectedTrackId;

/**
 * Select the current media selection.
 */
export const selectMediaSelection = (project: Project) =>
  project.timeline.mediaSelection;

/**
 * Select the currently selected clip IDs.
 */
export const selectSelectedClipIds = (project: Project) =>
  project.timeline.mediaSelection.clipIds;

/**
 * Select the currently selected transposition IDs.
 */
export const selectSelectedTranspositionIds = (project: Project) =>
  project.timeline.mediaSelection.transpositionIds;

/**
 * Select the current media draft.
 */
export const selectMediaDraft = (project: Project) =>
  project.timeline.mediaDraft;

/**
 * Select the currently drafted clip.
 */
export const selectDraftedClip = (project: Project) =>
  project.timeline.mediaDraft.clip;

/**
 * Select the currently drafted transposition.
 */
export const selectDraftedTransposition = (project: Project) =>
  project.timeline.mediaDraft.transposition;

/**
 * Select the current media clipboard.
 */
export const selectMediaClipboard = (project: Project) =>
  project.timeline.mediaClipboard;

/**
 * Select the currently copied clips.
 */
export const selectCopiedClips = (project: Project) =>
  project.timeline.mediaClipboard.clips;

/**
 * Select the currently copied transpositions.
 */
export const selectCopiedTranspositions = (project: Project) =>
  project.timeline.mediaClipboard.transpositions;

/**
 * Select the current media drag state.
 */
export const selectMediaDragState = (project: Project) =>
  project.timeline.mediaDragState;

/**
 * Select the live transposition settings.
 */
export const selectLiveTranspositionSettings = (project: Project) =>
  project.timeline.liveTranspositionSettings;

/**
 * Select the currently selected pattern.
 * @param project The project.
 * @returns The currently selected pattern or undefined if none is selected or found.
 */
export const selectSelectedPattern = (project: Project) => {
  const patternMap = selectPatternMap(project);
  const { patternId } = selectDraftedClip(project);
  return getProperty(patternMap, patternId);
};

/**
 * Select the currently selected track.
 * @param project The project.
 * @returns The currently selected track or undefined if none is selected or found.
 */
export const selectSelectedTrack = (project: Project) => {
  const trackMap = selectTrackMap(project);
  const selectedTrackId = selectSelectedTrackId(project);
  return getProperty(trackMap, selectedTrackId);
};

/**
 * Select the index of the currently selected track.
 * @param project The project.
 * @returns The index of the currently selected track or -1 if none is selected.
 */
export const selectSelectedTrackIndex = (project: Project) => {
  const selectedTrackId = selectSelectedTrackId(project);
  if (!selectedTrackId) return -1;
  const orderedTrackIds = selectOrderedTrackIds(project);
  return orderedTrackIds.indexOf(selectedTrackId);
};

/**
 * Select the parents of the currently selected track.
 * @param project The project.
 * @returns The parents of the currently selected track or an empty array if none is selected.
 */
export const selectSelectedTrackParents = (project: Project) => {
  const selectedTrack = selectSelectedTrack(project);
  if (!selectedTrack) return [];
  return selectTrackParents(project, selectedTrack.id);
};

/**
 * Select the currently selected clips.
 * @param project The project.
 * @returns The currently selected clips.
 */
export const selectSelectedClips = createDeepEqualSelector(
  [selectClipMap, selectSelectedClipIds],
  (clipMap, selectedClipIds) => getProperties(clipMap, selectedClipIds)
);

/**
 * Select the currently selected transpositions.
 * @param project The project.
 * @returns The currently selected transpositions or an empty array if none are selected or found.
 */
export const selectSelectedTranspositions = createDeepEqualSelector(
  [selectTranspositionMap, selectSelectedTranspositionIds],
  (transpositionMap, selectedTranspositionIds) =>
    getProperties(transpositionMap, selectedTranspositionIds)
);

/**
 * Select all selected media.
 * @param project The project.
 * @returns An array of selected media.
 */
export const selectSelectedMedia = createDeepEqualSelector(
  [selectSelectedClips, selectSelectedTranspositions],
  (selectedClips, selectedTranspositions): Media[] => [
    ...selectedClips,
    ...selectedTranspositions,
  ]
);

/**
 * Select the width of a clip in pixels. Always at least 1 pixel.
 */
export const selectClipWidth = (project: Project, id?: ClipId) => {
  const duration = selectClipDuration(project, id);
  const timeline = selectTimeline(project);
  const cellWidth = selectCellWidth(project);
  const columns = ticksToColumns(duration, timeline.subdivision);
  return Math.max(cellWidth * columns, 1);
};

/**
 * Select the number of ticks in a timeline subdivision.
 * @example
 * If ```PPQ = 96``` and
 * ```Subdivision = 1/16```,
 * then ```Ticks = 96 / 16 = 6```
 */
export const selectSubdivisionTicks = (project: Project) => {
  const timeline = selectTimeline(project);
  return subdivisionToTicks(timeline.subdivision);
};

/**
 * Select the current tick using the given column based on the timeline subdivision.
 * @example
 * If ```PPQ = 96``` and
 * ```Subdivision = 1/16```
 * and ```Column = 2```,
 * then ```Tick = 96 / 16 * 2 = 12```
 */
export const selectTickFromColumn = (project: Project, column: number) => {
  const timeline = selectTimeline(project);
  const ticks = subdivisionToTicks(timeline.subdivision);
  return ticks * column;
};

/**
 * Select the timeline column count.
 */
export const selectTimelineColumnCount = (project: Project) => {
  return MEASURE_COUNT * 128;
};

/**
 * Select the background width of the timeline.
 */
export const selectTimelineBackgroundWidth = (project: Project) => {
  const cellWidth = selectCellWidth(project);
  const columns = selectTimelineColumnCount(project);
  return columns * cellWidth + TRACK_WIDTH;
};

/**
 * Select the left offset of the timeline tick in pixels.
 */
export const selectTimelineTickLeft = (project: Project, tick: Tick = 0) => {
  const timeline = selectTimeline(project);
  const cellWidth = selectCellWidth(project);
  const columns = ticksToColumns(tick, timeline.subdivision);
  return TRACK_WIDTH + Math.round(columns * cellWidth);
};

/**
 * Select the height of a timeline object based on whether the track is collapsed.
 */
export const selectTimelineObjectHeight = (
  project: Project,
  object?: TimelineObject
) => {
  const cellHeight = selectCellHeight(project);
  if (isTrack(object)) {
    return object.collapsed ? COLLAPSED_TRACK_HEIGHT : cellHeight;
  } else {
    const track = selectTrackById(project, object?.trackId);
    return track?.collapsed ? COLLAPSED_TRACK_HEIGHT : cellHeight;
  }
};

/**
 * Select the top offset of the track in pixels based on the given track ID.
 */
export const selectTimelineObjectTop = (
  project: Project,
  object?: TimelineObject
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

/**
 * Select the track index of a timeline object.
 */
export const selectTimelineObjectTrackIndex = (
  project: Project,
  object?: TimelineObject
) => {
  if (!object) return -1;
  const orderedTrackIds = selectOrderedTrackIds(project);
  const id = isTrack(object) ? object.id : object.trackId;
  return orderedTrackIds.indexOf(id);
};

/**
 * A map of ticks to a record of chords to play at that tick.
 */
export type ChordsByTicks = Record<Tick, InstrumentChordRecord>;

/**
 * Select all pattern chords to be played by each track at every tick.
 * @param project The project.
 * @returns A map of ticks to an array of chords to be played at that tick.
 */
export const selectChordsByTicks = createDeepEqualSelector(
  [selectClips, selectClipStreams, selectPatternTrackMap],
  (clips, clipStreams, patternTrackMap) => {
    const result = {} as ChordsByTicks;
    const length = clips.length;

    // Iterate through each clip stream
    for (let i = 0; i < length; i++) {
      const clip = clips[i];
      const stream = clipStreams[clip.id];
      const streamLength = stream.length;
      if (!clip) continue;

      // Get the pattern track
      const patternTrack = patternTrackMap[clip.trackId];
      if (!patternTrack) continue;

      // Get the instrument ID
      const instrumentStateId = patternTrack.instrumentId;
      if (!instrumentStateId) continue;

      const baseTick = clip.tick;

      // Iterate through each chord in the stream
      for (let j = 0; j < streamLength; j++) {
        // Get the current chord
        const chord = getPatternChordAtTick(stream, j);
        if (!chord) continue;

        // Get the current tick within the clip
        const tick = baseTick + j;

        // Add the chord to the map
        if (result[tick] === undefined) result[tick] = {};
        result[tick][instrumentStateId] = chord;
      }
    }

    return result;
  }
);

/**
 * Get the chord record at the given tick.
 * @param project The project.
 * @param tick The tick.
 * @returns The chord record.
 */
export const selectChordsAtTick = (project: Project, tick: Tick) => {
  const chordsByTicks = selectChordsByTicks(project);
  return chordsByTicks[tick];
};

/**
 * Select the timeline end tick based on the clips and loop state.
 * @param project The project.
 * @returns The end tick.
 */
export const selectTimelineEndTick = createSelector(
  [selectClips, selectPatternMap, selectTransport],
  (clips, patternMap, transport) => {
    if (transport.loop) return transport.loopEnd;
    const lastTick = clips.reduce((last, clip) => {
      const pattern = patternMap[clip.patternId];
      if (!pattern) return last;
      const endTick = clip.tick + getClipDuration(clip, pattern);
      return Math.max(last, endTick);
    }, 0);
    return lastTick;
  }
);
