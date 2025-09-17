import { selectMidiChordsByTicks } from "types/Arrangement/ArrangementSelectors";
import {
  getActiveInstances,
  LIVE_AUDIO_INSTANCES,
} from "types/Instrument/InstrumentClass";
import { playPatternChord } from "types/Pattern/PatternThunks";
import {
  PPQ,
  QUARTER_NOTE_TICKS,
  SIXTEENTH_NOTE_TICKS,
  WHOLE_NOTE_TICKS,
} from "utils/duration";
import { selectTransport } from "./TransportSelectors";
import { dispatchTick } from "./TransportTick";
import { Thunk } from "types/Project/ProjectTypes";
import { getDestination, getTransport } from "tone";
import { selectCellsPerTick } from "types/Timeline/TimelineSelectors";
import {
  getRecordingStart,
  RECORD_TRANSPORT,
  recordNoteToMidiStream,
} from "./TransportRecorder";
import { getToggleValue } from "hooks/useToggle";
import { parseValue } from "utils/math";
import { selectTrackMap } from "types/Track/TrackSelectors";
import { rhythmGate } from "utils/gate";

let scheduleId: number | undefined = undefined;

/** Schedule the main transport audio loop. */
export const scheduleTransport = (): Thunk => async (dispatch, getProject) => {
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
    const cellWidth = selectCellsPerTick(project);
    const {
      bpm,
      timeSignature,
      loop,
      swing,
      loopStart,
      loopEnd,
      volume,
      mute,
      scroll,
    } = transport;

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

    // Scroll the timeline every measure
    const scrollRatio = (scroll || 1) * timeSignature;
    if (
      scroll &&
      newTick &&
      newTick % (scrollRatio * QUARTER_NOTE_TICKS) === 0
    ) {
      const grid = document.getElementsByClassName("rdg-grid")[0];
      if (grid)
        grid.scroll({
          left: grid.scrollLeft + scroll * WHOLE_NOTE_TICKS * cellWidth,
          behavior: "smooth",
        });
    }

    // If swinging, offset the time
    const stepIndex = Math.floor(newTick / SIXTEENTH_NOTE_TICKS);
    const isSwing = stepIndex % 2 === 1;
    if (swing && isSwing) {
      const swingOffset = (60 / bpm) * (swing / 8);
      time += swingOffset;
    }

    // If the transport is muted, skip the playback
    if (mute) return;

    // Select the memoized record of chords to be played at the current tick
    const chordRecord = selectMidiChordsByTicks(project)[newTick];
    const trackMap = selectTrackMap(project);
    if (chordRecord === undefined) return;

    // Iterate over the instruments that are to be played at the current tick
    for (const instrumentId in chordRecord) {
      const chord = chordRecord[instrumentId];
      if (!chord) continue;

      // Get the live audio instance
      const instance = LIVE_AUDIO_INSTANCES[instrumentId];
      const loaded = instance?.isLoaded();
      if (!loaded) continue;

      // Check if the gate is available
      const track = trackMap[instance.trackId];
      if (track.gate !== undefined) {
        const isOpen = rhythmGate(track.gate, newTick);
        if (!isOpen) continue;
      }

      // Play the realized pattern chord using the sampler
      playPatternChord(instance.sampler, chord, time);
      const iid = instrumentId;
      if (getToggleValue(RECORD_TRANSPORT) && getActiveInstances().has(iid)) {
        recordNoteToMidiStream({
          id: iid,
          chord,
          time: time - (parseValue(getRecordingStart()) ?? startTime),
        });
      }
    }
  }, `1i`);
};
