import { DEFAULT_CELL_WIDTH, TRACK_WIDTH } from "appConstants";
import {
  subdivisionToTicks,
  subdivisionToValue,
  ticksToColumns,
} from "appUtil";
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

// Bars, beats, sixteenths of the timeline tick
export const selectBarsBeatsSixteenths = createSelector(
  [selectTimeline, selectTransport, selectTick],
  (timeline, transport, tick) => {
    const secondsPerBeat = MIDI.ticksToSeconds(
      MIDI.QuarterNoteTicks,
      transport.bpm
    );
    const sixteenthsPerBar = transport.timeSignature?.[0] ?? 16;
    const seconds = MIDI.ticksToSeconds(tick, transport.bpm);
    const secondsPerBar = MIDI.ticksToSeconds(
      sixteenthsPerBar * MIDI.SixteenthNoteTicks,
      transport.bpm
    );
    const subdivisionValue = subdivisionToValue(timeline.subdivision);
    const secondsPerSubdivision = secondsPerBeat / subdivisionValue;

    const bars = seconds / secondsPerBar;
    const beats = (seconds % secondsPerBar) / secondsPerSubdivision;
    const sixteenths =
      ((seconds % secondsPerBar) % secondsPerSubdivision) /
      (secondsPerSubdivision / 4);

    return { bars, beats, sixteenths };
  }
);
