import { beatsToSubdivision } from "appUtil";
import { selectPattern, selectTransport } from "redux/selectors";
import { convertTimeToSeconds } from "redux/slices/transport";
import { AppThunk } from "redux/store";
import { getGlobalSampler } from "types/instrument";
import { MIDI } from "types/midi";
import { PatternId, realizePattern, isRest } from "types/patterns";
import { defaultScale } from "types/scales";

export const playPattern =
  (id: PatternId): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const pattern = selectPattern(state, id);

    if (!pattern) return;

    const sampler = getGlobalSampler();
    if (!sampler?.loaded) return;

    const transport = selectTransport(state);
    const stream = realizePattern(pattern, defaultScale);
    if (!stream.length) return;

    let time = 0;
    for (let i = 0; i < stream.length; i++) {
      const chord = stream[i];
      if (!chord.length) continue;
      const firstNote = chord[0];
      const duration = convertTimeToSeconds(transport, firstNote.duration);
      const subdivision = beatsToSubdivision(firstNote.duration);
      if (isRest(firstNote)) {
        time += duration;
        continue;
      }
      const pitches = chord.map((note) => MIDI.toPitch(note.MIDI));
      setTimeout(() => {
        if (!sampler.loaded) return;
        sampler.triggerAttackRelease(pitches, subdivision);
      }, time * 1000);
      time += duration;
    }
  };
