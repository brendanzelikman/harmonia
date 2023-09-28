import { TRACK_WIDTH } from "appConstants";
import { subdivisionToTicks, ticksToColumns } from "utils";
import { RootState } from "redux/store";
import { createSelector } from "reselect";
import { selectTick, selectTransport } from "./transport";
import { MIDI } from "types/midi";
import { DEFAULT_CELL } from "types";

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
