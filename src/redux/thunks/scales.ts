import { ticksToToneSubdivision } from "utils";
import { selectScale, selectTransport } from "redux/selectors";

import {
  convertSecondsToTicks,
  convertTicksToSeconds,
} from "redux/slices/transport";
import { AppThunk } from "redux/store";
import { getGlobalSampler } from "types/instrument";
import { MIDI } from "types/midi";
import { Scale, ScaleId } from "types/scale";
import { Midi } from "@tonejs/midi";

export const playScale =
  (scaleOrId: Scale | ScaleId): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    let scale: Scale;

    if (typeof scaleOrId === "string") {
      scale = selectScale(state, scaleOrId);
    } else {
      scale = scaleOrId;
    }

    if (!scale) return;

    const sampler = getGlobalSampler();
    if (!sampler?.loaded) return;

    const transport = selectTransport(state);

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
      const tonicOnTop = scale.notes[0] + 12;
      const pitch = MIDI.toPitch(tonicOnTop);
      const subdivision = ticksToToneSubdivision(MIDI.EighthNoteTicks);
      sampler.triggerAttackRelease([pitch], subdivision);
    }, time * 1000);
  };

export const exportScaleToMIDI =
  (id: ScaleId): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const scale = selectScale(state, id);
    if (!scale) return;

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
