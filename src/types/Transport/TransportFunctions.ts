import { MIDI } from "types/midi";
import { Tick, Time } from "types/units";
import { Transport } from "./TransportTypes";

/**
 * Convert ticks to seconds.
 * @param transport The transport.
 * @param tick The value in ticks.
 * @return The value in seconds.
 */
export const convertTicksToSeconds = (transport: Transport, tick: Tick): Time =>
  MIDI.ticksToSeconds(tick, transport.bpm);

/**
 * Convert seconds to ticks.
 * @param transport The transport.
 * @param time The value in seconds.
 * @returns The value in ticks.
 */
export const convertSecondsToTicks = (transport: Transport, time: Time): Tick =>
  MIDI.secondsToTicks(time, transport.bpm);

/**
 * Convert ticks to bars, beats, and sixteenths.
 * @param transport The transport.
 * @param tick The value in ticks.
 * @returns The value in bars, beats, and sixteenths.
 */
export const convertTicksToBarsBeatsSixteenths = (
  transport: Transport,
  tick: Tick
) => {
  const { bpm, timeSignature } = transport;
  if (!bpm || !timeSignature) return { bars: 0, beats: 0, sixteenths: 0 };

  // Get the number of sixteenths and ticks per bar
  const sixteenthsPerBar = timeSignature?.[0] ?? 16;
  const ticksPerBar = sixteenthsPerBar * MIDI.SixteenthNoteTicks;

  // Find the total seconds and seconds per bar
  const totalSeconds = MIDI.ticksToSeconds(tick, bpm);
  const secondsPerBar = MIDI.ticksToSeconds(ticksPerBar, bpm);

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

/**
 * Get the next tick in the transport.
 * @param transport The transport.
 * @returns The next tick or the start of the loop if the transport has looped.
 */
export const getNextTransportTick = (transport: Transport): Tick => {
  return transport.loop && transport.tick === transport.loopEnd
    ? transport.loopStart
    : transport.tick + 1;
};
