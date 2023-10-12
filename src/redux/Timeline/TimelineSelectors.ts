import {
  COLLAPSED_TRACK_HEIGHT,
  HEADER_HEIGHT,
  MEASURE_COUNT,
  TRACK_WIDTH,
} from "appConstants";
import { subdivisionToTicks, ticksToColumns } from "utils";
import { RootState } from "redux/store";
import { createSelector } from "reselect";
import { InstrumentChordRecord } from "types/Instrument";
import { getPatternChordAtTick } from "types/Pattern";
import { ClipId, getClipDuration } from "types/Clip";
import { TimelineObject, getTimelineObjectTrackId } from "types/Timeline";
import { Tick } from "types/units";
import {
  selectClipDuration,
  selectClipStreams,
  selectClips,
  selectOrderedTrackIds,
  selectPatternMap,
  selectPatternTrackMap,
  selectSession,
  selectTrackById,
  selectTransport,
} from "redux/selectors";
import { createDeepEqualSelector } from "redux/util";
import { isTrack } from "types/Track";

/**
 * Select the timeline object from the store.
 * @param state The root state.
 * @param object The timeline object.
 * @returns The timeline object.
 */
export const selectTimelineObject = (
  state: RootState,
  object: TimelineObject
) => object;

/**
 * Select the timeline from the store.
 * @param state The root state.
 * @returns The timeline.
 */
export const selectTimeline = (state: RootState) => state.timeline;

/**
 * Select the timeline cell.
 * @param state The root state.
 * @returns The timeline cell, containing its width and height.
 */
export const selectCell = (state: RootState) => state.timeline.cell;

/**
 * Select the width of a timeline cell.
 * @param state The root state.
 * @returns The cell width.
 */
export const selectCellWidth = (state: RootState) => state.timeline.cell.width;

/**
 * Select the height of a timeline cell.
 * @param state The root state.
 * @returns The cell height.
 */
export const selectCellHeight = (state: RootState) =>
  state.timeline.cell.height;

/**
 * Select the width of a clip in pixels. Always at least 1 pixel.
 * @param state The root state.
 * @param id The ID of the clip.
 * @returns The width of the clip.
 */
export const selectClipWidth = (state: RootState, id?: ClipId) => {
  const duration = selectClipDuration(state, id);
  const timeline = selectTimeline(state);
  const cellWidth = selectCellWidth(state);
  const columns = ticksToColumns(duration, timeline.subdivision);
  return Math.max(cellWidth * columns, 1);
};

/**
 * Select the number of ticks in a timeline subdivision.
 * @param state The root state.
 * @returns The number of ticks.
 * @example
 * If ```PPQ = 96``` and
 * ```Subdivision = 1/16```,
 * then ```Ticks = 96 / 16 = 6```
 */
export const selectSubdivisionTicks = (state: RootState) => {
  const timeline = selectTimeline(state);
  return subdivisionToTicks(timeline.subdivision);
};

/**
 * Select the current tick using the given column based on the timeline subdivision.
 * @param state The root state.
 * @param column The column to select.
 * @returns The corresponding tick.
 * @example
 * If ```PPQ = 96``` and
 * ```Subdivision = 1/16```
 * and ```Column = 2```,
 * then ```Tick = 96 / 16 * 2 = 12```
 */
export const selectTickFromColumn = (state: RootState, column: number) => {
  const timeline = selectTimeline(state);
  const ticks = subdivisionToTicks(timeline.subdivision);
  return ticks * column;
};

/**
 * Select the timeline column count.
 * @param state The root state.
 * @returns The column count.
 */
export const selectTimelineColumnCount = (state: RootState) => {
  return MEASURE_COUNT * 128;
};

/**
 * Select the background width of the timeline.
 * @param state The root state.
 * @returns The background width.
 */
export const selectTimelineBackgroundWidth = (state: RootState) => {
  const cellWidth = selectCellWidth(state);
  const columns = selectTimelineColumnCount(state);
  return columns * cellWidth + TRACK_WIDTH;
};

/**
 * Select the left offset of the timeline tick in pixels.
 * @param state The root state.
 * @param tick The tick to select.
 * @returns The left value.
 */
export const selectTimelineTickLeft = (state: RootState, tick: Tick = 0) => {
  const timeline = selectTimeline(state);
  const cellWidth = selectCellWidth(state);
  const columns = ticksToColumns(tick, timeline.subdivision);
  return TRACK_WIDTH + Math.round(columns * cellWidth);
};

/**
 * Select the height of a timeline object based on whether the track is collapsed.
 * @param state The root state.
 * @param object The timeline object.
 * @returns The height of the timeline object.
 */
export const selectTimelineObjectHeight = (
  state: RootState,
  object?: TimelineObject
) => {
  const cellHeight = selectCellHeight(state);
  if (isTrack(object)) {
    return object.collapsed ? COLLAPSED_TRACK_HEIGHT : cellHeight;
  } else {
    const track = selectTrackById(state, object?.trackId);
    return track?.collapsed ? COLLAPSED_TRACK_HEIGHT : cellHeight;
  }
};

/**
 * Select the top offset of the track in pixels based on the given track ID.
 * @param state The root state.
 * @param object The timeline object.
 * @returns The top value.
 */
export const selectTimelineObjectTop = (
  state: RootState,
  object?: TimelineObject
) => {
  const session = selectSession(state);
  const cellHeight = selectCellHeight(state);
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
      const child = session.byId[id];
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
  const topLevelIdCount = session.topLevelIds.length;
  for (let i = 0; i < topLevelIdCount; i++) {
    // If the object is found, return the top offset
    if (found) return top;

    // Get the top-level id
    const topLevelId = session.topLevelIds[i];
    if (topLevelId === getTimelineObjectTrackId(object)) break;

    // Get the top-level entity
    const entity = session.byId[topLevelId];
    if (!entity) continue;

    // Add the height of the entity and its children
    top += !!entity.collapsed ? COLLAPSED_TRACK_HEIGHT : cellHeight;
    top += getChildrenTop(entity.trackIds);
  }

  // Return the top offset
  return top;
};

/**
 * Select the track index of a timeline object.
 * @param state The root state.
 * @param object The timeline object.
 * @returns The track index.
 */
export const selectTimelineObjectTrackIndex = (
  state: RootState,
  object?: TimelineObject
) => {
  if (!object) return -1;
  const orderedTrackIds = selectOrderedTrackIds(state);
  const id = isTrack(object) ? object.id : object.trackId;
  return orderedTrackIds.indexOf(id);
};

/**
 * A map of ticks to a record of chords to play at that tick.
 */
export type ChordsByTicks = Record<Tick, InstrumentChordRecord>;

/**
 * Select all pattern chords to be played by each track at every tick.
 * @param state The root state.
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
 * @param state The root state.
 * @param tick The tick.
 * @returns The chord record.
 */
export const selectChordsAtTick = (state: RootState, tick: Tick) => {
  const chordsByTicks = selectChordsByTicks(state);
  return chordsByTicks[tick];
};

/**
 * Select the timeline end tick based on the clips and loop state.
 * @param state The root state.
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
