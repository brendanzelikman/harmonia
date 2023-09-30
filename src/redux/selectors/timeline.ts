import {
  COLLAPSED_TRACK_HEIGHT,
  HEADER_HEIGHT,
  TRACK_WIDTH,
} from "appConstants";
import { subdivisionToTicks, ticksToColumns } from "utils";
import { RootState } from "redux/store";
import { createSelector } from "reselect";
import { selectTick, selectTransport } from "./transport";
import { MIDI } from "types/midi";
import { DEFAULT_CELL } from "types";
import { selectSessionMap, selectTrackMap } from "./tracks";
import { selectTransposition } from "./transpositions";

export const selectTimeline = (state: RootState) => state.timeline;

export const selectCell = (state: RootState) =>
  state.timeline.cell || DEFAULT_CELL;

export const selectCellWidth = (state: RootState) =>
  state.timeline.cell.width || DEFAULT_CELL.width;

export const selectCellHeight = (state: RootState) =>
  state.timeline.cell.height || DEFAULT_CELL.height;

const selectTimelineColumn = createSelector([selectTimeline], (timeline) => {
  return subdivisionToTicks(timeline.subdivision);
});

// Select the tick based on the timeline subdivision
export const selectTimelineTick = createSelector(
  [selectTimelineColumn, selectTick],
  (ticks, tick) => ticks * tick
);

// Select the offset of the timeline tick (in px)
export const selectTimelineTickOffset = createSelector(
  [selectTimeline, selectTick, selectCellWidth],
  (timeline, tick, cellWidth) => {
    const columns = ticksToColumns(tick, timeline.subdivision);
    return TRACK_WIDTH + Math.round(columns * cellWidth);
  }
);

const selectTimelineObject = (state: RootState, _: { trackId: string }) => _;

export const selectLastTimelineTrack = createSelector(
  [selectSessionMap, selectTrackMap],
  (sessionMap, trackMap) => {
    const topLevelIds = sessionMap.topLevelIds;
    const lastTopLevelId = topLevelIds.at(-1);
    if (!lastTopLevelId) return undefined;

    const getLastTrackId = (id: string): string => {
      const entity = sessionMap.byId[id];
      if (!entity) return id;
      const trackIds = entity.trackIds;
      if (!trackIds.length) return id;
      const lastId = trackIds.at(-1);
      if (!lastId) return id;
      return getLastTrackId(lastId);
    };
    const lastTrackId = getLastTrackId(lastTopLevelId);

    return trackMap[lastTrackId];
  }
);

// Find the top offset of the transposition
export const selectTimelineTrackOffset = createSelector(
  [selectTimelineObject, selectSessionMap, selectCellHeight],
  (object, sessionMap, cellHeight) => {
    let found = false;
    const getChildrenTop = (childIds: string[]): number => {
      let acc = 0;
      for (let i = 0; i < childIds.length; i++) {
        if (found) return acc;
        const id = childIds[i];
        const child = sessionMap.byId[id];
        if (!child) continue;
        if (child.id === object.trackId) {
          found = true;
          return acc;
        }
        acc += child.collapsed ? COLLAPSED_TRACK_HEIGHT : cellHeight;
        acc += getChildrenTop(child.trackIds);
      }
      return acc;
    };

    let top = HEADER_HEIGHT;
    const length = sessionMap.topLevelIds.length;
    for (let i = 0; i < length; i++) {
      if (found) return top;
      const topLevelId = sessionMap.topLevelIds[i];
      if (topLevelId === object.trackId) break;

      const entity = sessionMap.byId[topLevelId];
      if (!entity) continue;

      top += !!entity.collapsed ? COLLAPSED_TRACK_HEIGHT : cellHeight;

      top += getChildrenTop(entity.trackIds);
    }
    return top;
  }
);

// Select the transport bpm
export const selectTransportBpm = createSelector(
  [selectTransport],
  (transport) => transport.bpm
);

// Select the transport time signature
export const selectTransportTimeSignature = createSelector(
  [selectTransport],
  (transport) => transport.timeSignature
);

// Select the bars, beats, and sixteenths of the timeline tick
export const selectBarsBeatsSixteenths = createSelector(
  [selectTransportBpm, selectTransportTimeSignature, selectTick],
  (bpm, timeSignature, tick) => {
    const sixteenthsPerBar = timeSignature?.[0] ?? 16;
    const ticksPerBar = sixteenthsPerBar * MIDI.SixteenthNoteTicks;

    const totalSeconds = MIDI.ticksToSeconds(tick, bpm);
    const secondsPerBar = MIDI.ticksToSeconds(ticksPerBar, bpm);

    const dirtyBars = totalSeconds / secondsPerBar;
    const bars = parseFloat(dirtyBars.toFixed(2));
    const beats = (bars % 1) * sixteenthsPerBar;
    const sixteenths = (beats % 1) * 4;

    return { bars, beats, sixteenths };
  }
);
