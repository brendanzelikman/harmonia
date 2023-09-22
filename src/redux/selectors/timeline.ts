import { DEFAULT_CELL_WIDTH, TRACK_WIDTH } from "appConstants";
import { subdivisionToTicks, subdivisionToValue, ticksToColumns } from "utils";
import { RootState } from "redux/store";
import { createSelector } from "reselect";
import { selectTick, selectTransport } from "./transport";
import { MIDI } from "types/midi";

export const selectTimeline = (state: RootState) => state.timeline;

export const selectCellWidth = (state: RootState) =>
  state.timeline.cellWidth || DEFAULT_CELL_WIDTH;

const selectTimelineColumn = createSelector([selectTimeline], (timeline) => {
  return subdivisionToTicks(timeline.subdivision);
});

export const selectTimelineTick = createSelector(
  [selectTimelineColumn, selectTick],
  (ticks, tick) => {
    return ticks * tick;
  }
);

export const selectTimelineTickOffset = createSelector(
  [selectTimeline, selectTick, selectCellWidth],
  (timeline, tick, cellWidth) => {
    const columns = ticksToColumns(tick, timeline.subdivision);
    return TRACK_WIDTH + Math.round(columns * cellWidth);
  }
);

// Select transport bpm and time signature
export const selectTransportBpm = createSelector(
  [selectTransport],
  (transport) => transport.bpm
);

export const selectTransportTimeSignature = createSelector(
  [selectTransport],
  (transport) => transport.timeSignature
);

// Bars, beats, sixteenths of the timeline tick
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
