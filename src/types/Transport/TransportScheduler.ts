import { selectMidiChordsByTicks } from "types/Arrangement/ArrangementSelectors";
import { LIVE_AUDIO_INSTANCES } from "types/Instrument/InstrumentClass";
import { playPatternChord } from "types/Pattern/PatternThunks";
import { PPQ, SixteenthNoteTicks } from "utils/duration";
import { selectTransport } from "./TransportSelectors";
import { dispatchTick } from "./TransportTick";
import { Thunk } from "types/Project/ProjectTypes";
import { getDestination, getTransport } from "tone";

let scheduleId: number | undefined = undefined;

/** Schedule the main transport audio loop. */
export const scheduleTransport = (): Thunk => (_, getProject) => {
  let startTime = getTransport().now();
  let startSeconds = getTransport().seconds;

  // Clear any previous scheduled events
  if (scheduleId) {
    getTransport().clear(scheduleId);
    scheduleId = undefined;
  }

  // Schedule the main loop
  scheduleId = getTransport().scheduleRepeat((time) => {
    const project = getProject();
    const transport = selectTransport(project);
    const { bpm, loop, swing, loopStart, loopEnd, volume, mute } = transport;

    // Set the volume and mute state
    if (volume !== getDestination().volume.value) {
      getDestination().volume.value = volume;
    }
    if (mute !== getDestination().mute) {
      getDestination().mute = mute;
    }

    // Compute the time using precise values
    const seconds = time - startTime + startSeconds;
    let newTick = Math.round((seconds * bpm * PPQ) / 60);

    // If looping, reset the tick to the loop start
    if (loop && newTick === loopEnd) {
      newTick = loopStart;
      startTime = time;
      startSeconds = (60 * loopStart) / (bpm * PPQ);
    }
    // Dispatch a tick update event
    dispatchTick(newTick);

    // If swinging, offset the time
    const stepIndex = Math.floor(newTick / SixteenthNoteTicks);
    const isSwing = stepIndex % 2 === 1;
    if (swing && isSwing) {
      const swingOffset = (60 / bpm) * (swing / 8);
      time += swingOffset;
    }

    // If the transport is muted, skip the playback
    if (mute) return;

    // Select the memoized record of chords to be played at the current tick
    const chordRecord = selectMidiChordsByTicks(project)[newTick];

    // Iterate over the instruments that are to be played at the current tick
    if (chordRecord) {
      for (const instrumentId in chordRecord) {
        const chord = chordRecord[instrumentId];
        if (!chord) continue;

        // Get the live audio instance
        const instance = LIVE_AUDIO_INSTANCES[instrumentId];
        if (!instance?.isLoaded()) continue;

        // Play the realized pattern chord using the sampler
        playPatternChord(instance.sampler, chord, time);
      }
    }
  }, `1i`);
};
