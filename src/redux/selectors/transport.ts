import { RootState } from "redux/store";
import { selectClips, selectClipStream } from "./clips";
import { createSelector } from "@reduxjs/toolkit";
import { subdivisionToTicks } from "appUtil";
import { MIDI } from "types/midi";

// Select the transport from the store.
export const selectTransport = (state: RootState) => {
  return state.transport;
};

export const selectTick = (state: RootState, tick: number) => tick;

const selectTransportTicks = createSelector([selectTransport], (transport) =>
  subdivisionToTicks(transport.subdivision)
);

export const selectTimelineTick = createSelector(
  [selectTransportTicks, selectTick],
  (ticks, tick) => {
    return ticks * tick;
  }
);

// Bars, beats, sixteenths of the timeline tick
export const selectTimelineBBS = createSelector(
  [selectTransport, selectTick],
  (transport, tick) => {
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
    const secondsPerSubdivision = secondsPerBeat / transport.subdivision;

    const bars = seconds / secondsPerBar;
    const beats = (seconds % secondsPerBar) / secondsPerSubdivision;
    const sixteenths =
      ((seconds % secondsPerBar) % secondsPerSubdivision) /
      (secondsPerSubdivision / 4);

    return { bars, beats, sixteenths };
  }
);

// Select the loop tick or the end tick of the last clip that is active
export const selectTransportEndTick = (state: RootState) => {
  const transport = selectTransport(state);
  if (transport.loop) return transport.loopEnd;

  const clips = selectClips(state);
  const streams = clips.map((clip) => selectClipStream(state, clip.id));
  const lastTick = clips.reduce((last, clip, i) => {
    const stream = streams[i];
    if (!stream) return last;
    const endTick = clip.tick + stream.length;
    return Math.max(last, endTick);
  }, 0);
  return lastTick;
};
