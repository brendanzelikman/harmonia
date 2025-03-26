import { Tick, BPM } from "types/units";
import { SixteenthNoteTicks, ticksToSeconds } from "utils/durations";
import { format } from "utils/math";

/** Get the number of ticks per bar. */
export const getTicksPerBar = (bpm: BPM, timeSignature: [number, number]) => {
  const sixteenthsPerBar = timeSignature[0];
  const ticksPerBar = sixteenthsPerBar * SixteenthNoteTicks;
  const totalSeconds = ticksToSeconds(1, bpm);
  const secondsPerBar = ticksToSeconds(ticksPerBar, bpm);
  return secondsPerBar / totalSeconds;
};

export const getBarsBeatsSixteenths = (
  tick: Tick,
  deps: { bpm: BPM; timeSignature?: [number, number] }
) => {
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
  const bars = parseFloat(dirtyBars.toFixed(4));

  // Get the number of beats by multiplying the fraction of the bar by the number of sixteenths per bar
  const beats = (bars % 1) * sixteenthsPerBar;
  const sixteenths = beats % 4;

  const string = `${Math.floor(bars)}:${Math.floor(beats / 4)}:${format(
    sixteenths,
    2
  )}`;

  return { bars, beats, sixteenths, string };
};
