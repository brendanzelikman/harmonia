import { Tick, Seconds, BPM } from "types/units";
import { Transport } from "./TransportTypes";
import { Transport as ToneTransport } from "tone";
import {
  SixteenthNoteTicks,
  secondsToTicks,
  ticksToSeconds,
} from "utils/durations";

/** Checks if the transport is started or not. */
export const isTransportStarted = (
  transport: Transport | typeof ToneTransport
) => transport.state === "started";

/** Checks if the transport is stopped or not. */
export const isTransportStopped = (
  transport: Transport | typeof ToneTransport
) => transport.state === "stopped";

/** Checks if the transport is paused or not. */
export const isTransportPaused = (
  transport: Transport | typeof ToneTransport
) => transport.state === "paused";

/** Get the next tick in the transport, looping back if necessary. */
export const getNextTransportTick = (transport: Transport): Tick => {
  return transport.loop && ToneTransport.ticks === transport.loopEnd
    ? transport.loopStart
    : ToneTransport.ticks + 1;
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
export const convertTicksToFormattedTime = (
  tick: Tick,
  deps: { bpm: BPM; timeSignature: [number, number] }
) => {
  const { bpm, timeSignature } = deps;
  if (!bpm || !timeSignature) return { bars: 0, beats: 0, sixteenths: 0 };

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

/** Get the transport with the user idled. */
export const getIdleTransport = (transport: Transport): Transport => ({
  ...transport,
  state: "stopped",
  recording: false,
  downloading: false,
});
