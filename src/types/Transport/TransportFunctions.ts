import { Tick, Seconds, BPM } from "types/units";
import { Transport } from "./TransportTypes";
import { Transport as TransportClass } from "tone/build/esm/core/clock/Transport";
import {
  SixteenthNoteTicks,
  secondsToTicks,
  ticksToSeconds,
} from "utils/durations";
import { getTransport } from "tone";

/** Checks if the transport is started or not. */
export const isTransportStarted = (transport: Transport | TransportClass) =>
  transport.state === "started";

/** Get the next tick in the transport, looping back if necessary. */
export const getNextTransportTick = (transport: Transport): Tick => {
  const ticks = getTransport().ticks;
  return transport.loop && ticks === transport.loopEnd
    ? transport.loopStart
    : ticks + 1;
};
/** Convert ticks to seconds using the transport. */
export const convertTicksToSeconds = (
  transport: Transport,
  tick: Tick
): Seconds => ticksToSeconds(tick, transport.bpm);

/** Convert seconds to ticks using the transport. */
export const convertSecondsToTicks = (
  transport: Transport,
  time: Seconds
): Tick => secondsToTicks(time, transport.bpm);

/** Convert ticks to (bars:beats:sixteenths) using the transport. */
export type BarsBeatsSixteenths = {
  bars: number;
  beats: number;
  sixteenths: number;
};

export const getTicksPerBar = (bpm: BPM, timeSignature: [number, number]) => {
  const sixteenthsPerBar = timeSignature[0];
  const ticksPerBar = sixteenthsPerBar * SixteenthNoteTicks;

  const totalSeconds = ticksToSeconds(1, bpm);
  const secondsPerBar = ticksToSeconds(ticksPerBar, bpm);

  return secondsPerBar / totalSeconds;
};

export const convertTicksToFormattedTime = (
  tick: Tick,
  deps: { bpm: BPM; timeSignature?: [number, number] }
): BarsBeatsSixteenths => {
  const { bpm } = deps;
  const timeSignature = deps.timeSignature ?? [16, 16];
  if (!bpm) return { bars: 0, beats: 0, sixteenths: 0 };

  // Get the number of sixteenths and ticks per bar
  const sixteenthsPerBar = timeSignature?.[0] ?? 16;
  const ticksPerBar = sixteenthsPerBar * SixteenthNoteTicks;

  // Find the total seconds and seconds per bar
  const totalSeconds = ticksToSeconds(tick, bpm);
  const secondsPerBar = ticksToSeconds(ticksPerBar, bpm);

  // Divide the total seconds by the seconds per bar to get the bars
  const dirtyBars = totalSeconds / secondsPerBar;

  // Sanitize the number of bars to avoid floating point errors
  const bars = parseFloat(dirtyBars.toFixed(2));

  // Get the number of beats by multiplying the fraction of the bar by the number of sixteenths per bar
  const beats = (bars % 1) * sixteenthsPerBar;

  // Get the number of sixteenths by multiplying the fraction of the beat by 4
  const sixteenths = (beats % 1) * 4;

  return { bars, beats, sixteenths };
};
