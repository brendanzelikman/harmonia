import { ticksToSubdivision } from "appUtil";
import { selectScale, selectTransport } from "redux/selectors";

import { convertSecondsToTicks } from "redux/slices/transport";
import { AppThunk } from "redux/store";
import { getGlobalSampler } from "types/instrument";
import { MIDI } from "types/midi";
import { ScaleId } from "types/scales";

export const playScale =
  (id: ScaleId): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const scale = selectScale(state, id);

    if (!scale) return;

    const sampler = getGlobalSampler();
    if (!sampler?.loaded) return;

    const transport = selectTransport(state);

    let time = 0;
    for (let i = 0; i < scale.notes.length; i++) {
      const note = scale.notes[i];
      const duration = convertSecondsToTicks(transport, 2);
      const subdivision = ticksToSubdivision(2);
      const pitch = MIDI.toPitch(note);
      setTimeout(() => {
        if (!sampler) return;
        sampler.triggerAttackRelease([pitch], subdivision);
      }, time * 1000);
      time += duration;
    }
  };
