import * as _ from "./InstrumentSlice";
import { PayloadAction } from "@reduxjs/toolkit";
import { ActionGroup } from "redux/util";
import {
  getInstrumentEffectAsString,
  getInstrumentAsString,
} from "types/Instrument";
import { getTrackAsString } from "types/Track";

export const INSTRUMENT_UNDO_TYPES: ActionGroup = {
  "instruments/addInstrument": (
    action: PayloadAction<_.AddInstrumentPayload>
  ) => {
    return `ADD_TRACK:${getTrackAsString(action.payload.track)}`;
  },
  "instruments/removeInstrument": (
    action: PayloadAction<_.RemoveInstrumentPayload>
  ) => {
    const id = action.payload.trackId;
    return `REMOVE_TRACK:${id}`;
  },
  "instruments/addInstrumentEffect": (
    action: PayloadAction<_.AddInstrumentEffectPayload>
  ) => {
    return `${action.payload.id}:${action.payload.key}`;
  },
  "instruments/removeInstrumentEffect": (
    action: PayloadAction<_.RemoveInstrumentEffectPayload>
  ) => {
    return `${action.payload.id}:${action.payload.effectId}`;
  },
  "instruments/updateInstrument": (
    action: PayloadAction<_.UpdateInstrumentPayload>
  ) => {
    const tag = getInstrumentAsString(action.payload.update);
    return `${action.payload.id}:${tag}`;
  },
  "instruments/updateInstrumentEffect": (
    action: PayloadAction<_.UpdateInstrumentEffectPayload>
  ) => {
    const tag = getInstrumentEffectAsString(action.payload.update);
    return `${action.payload.id}:${tag}`;
  },
  "instruments/resetInstrumentEffect": (
    action: PayloadAction<_.ResetInstrumentEffectPayload>
  ) => {
    return `${action.payload.id}:${action.payload.effectId}`;
  },
  "instruments/removeAllInstrumentEffects": (
    action: PayloadAction<_.RemoveAllInstrumentEffectsPayload>
  ) => {
    return `${action.payload}`;
  },
};
