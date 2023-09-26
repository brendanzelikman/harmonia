import { ticksToToneSubdivision } from "utils";
import { selectTransport } from "redux/selectors";

import { convertTicksToSeconds } from "redux/slices/transport";
import { AppThunk } from "redux/store";
import { getGlobalSampler } from "types/instrument";
import { MIDI } from "types/midi";
import { Scale } from "types/scale";
import { Midi } from "@tonejs/midi";

export const playScale =
  (scale: Scale): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const transport = selectTransport(state);
    const sampler = getGlobalSampler();
    if (!sampler?.loaded) return;

    // Play each note of the scale
    let time = 0;
    for (let i = 0; i < scale.notes.length; i++) {
      const note = scale.notes[i];
      const duration = convertTicksToSeconds(transport, MIDI.EighthNoteTicks);
      const subdivision = ticksToToneSubdivision(MIDI.EighthNoteTicks);
      const pitch = MIDI.toPitch(note);
      setTimeout(() => {
        if (!sampler) return;
        sampler.triggerAttackRelease([pitch], subdivision);
      }, time * 1000);
      time += duration;
    }
    // Play the tonic on top to complete the scale
    setTimeout(() => {
      if (!scale) return;
      const tonicOnTop = scale.notes[0] + 12;
      const pitch = MIDI.toPitch(tonicOnTop);
      const subdivision = ticksToToneSubdivision(MIDI.EighthNoteTicks);
      sampler.triggerAttackRelease([pitch], subdivision);
    }, time * 1000);
  };

export const exportScaleToMIDI =
  (scale: Scale): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const transport = selectTransport(state);
    const midi = new Midi();
    const track = midi.addTrack();

    // Add stream
    for (let i = 0; i < scale.notes.length; i++) {
      const note = scale.notes[i];

      track.addNote({
        midi: note,
        time: convertTicksToSeconds(transport, i * MIDI.EighthNoteTicks),
      });
    }
    const blob = new Blob([midi.toArray()], {
      type: "audio/midi",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${scale.name || "scale"}.mid`;
    a.click();
    URL.revokeObjectURL(url);
  };
