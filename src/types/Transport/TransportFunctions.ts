import { getTransport } from "tone";
import { Tick, BPM } from "types/units";
import { QuarterNoteTicks, ticksToSeconds } from "utils/duration";
import { format } from "utils/math";

/** Get the number of ticks per bar. */
export const getTicksPerBar = (bpm: BPM, timeSignature: number) => {
  const quartersPerBar = timeSignature;
  const ticksPerBar = quartersPerBar * QuarterNoteTicks;
  const totalSeconds = ticksToSeconds(1, bpm);
  const secondsPerBar = ticksToSeconds(ticksPerBar, bpm);
  return secondsPerBar / totalSeconds;
};

/** Get the number of bars, beats, and sixteenths from a tick, */
export const getBarsBeatsSixteenths = (
  tick: Tick,
  deps?: { bpm?: BPM; timeSignature?: number }
) => {
  const bpm = deps?.bpm ?? (getTransport().bpm.value as number);
  const meter = deps?.timeSignature ?? (getTransport().timeSignature as number);
  if (!bpm) return { bars: 0, beats: 0, sixteenths: 0 };

  // Get the number of quarters and ticks per bar
  const quartersPerBar = meter;
  const ticksPerBar = quartersPerBar * QuarterNoteTicks;

  // Find the total seconds and seconds per bar
  const totalSeconds = ticksToSeconds(tick, bpm);
  const secondsPerBar = ticksToSeconds(ticksPerBar, bpm);

  // Divide the total seconds by the seconds per bar to get the bars
  const dirtyBars = totalSeconds / secondsPerBar;

  // Sanitize the number of bars to avoid floating point errors
  const bars = parseFloat(dirtyBars.toFixed(4));

  // Get the number of beats by multiplying the fraction of the bar by the number of quarters per bar
  const beats = (bars % 1) * quartersPerBar;
  const sixteenths = (beats * 4) % 4;

  const cleanBars = Math.floor(bars);
  const cleanBeats = Math.floor(beats);
  const clean16ths = format(sixteenths, 3);
  const string = `${cleanBars}:${cleanBeats}:${clean16ths}`;

  return { bars, beats, sixteenths, string };
};
