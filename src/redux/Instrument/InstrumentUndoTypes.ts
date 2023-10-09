import { PayloadAction } from "@reduxjs/toolkit";
import { ActionGroup } from "types/units";
import * as InstrumentSlice from "./InstrumentSlice";
import { getInstrumentEffectTag, getInstrumentTag } from "types/Instrument";
import { createTag } from "types/util";
import { getTrackTag } from "types/Track";

export const INSTRUMENT_UNDO_TYPES: ActionGroup = {
  "instruments/addInstrument": (
    action: PayloadAction<InstrumentSlice.AddInstrumentPayload>
  ) => {
    const tag = createTag(action.payload.track, getTrackTag);
    return `ADD_TRACK:${tag}`;
  },
  "instruments/removeInstrument": (
    action: PayloadAction<InstrumentSlice.RemoveInstrumentPayload>
  ) => {
    const id = action.payload.trackId;
    return `REMOVE_TRACK:${id}`;
  },
  "instruments/addInstrumentEffect": (
    action: PayloadAction<InstrumentSlice.AddInstrumentEffectPayload>
  ) => {
    return `${action.payload.instrumentId}:${action.payload.key}`;
  },
  "instruments/removeInstrumentEffect": (
    action: PayloadAction<InstrumentSlice.RemoveInstrumentEffectPayload>
  ) => {
    return `${action.payload.instrumentId}:${action.payload.effectId}`;
  },
  "instruments/updateInstrument": (
    action: PayloadAction<InstrumentSlice.UpdateInstrumentPayload>
  ) => {
    const tag = getInstrumentTag(action.payload.update);
    return `${action.payload.instrumentId}:${tag}`;
  },
  "instruments/updateInstrumentEffect": (
    action: PayloadAction<InstrumentSlice.UpdateInstrumentEffectPayload>
  ) => {
    const tag = getInstrumentEffectTag(action.payload.update);
    return `${action.payload.instrumentId}:${tag}`;
  },
  "instruments/resetInstrumentEffect": (
    action: PayloadAction<InstrumentSlice.ResetInstrumentEffectPayload>
  ) => {
    return `${action.payload.instrumentId}:${action.payload.effectId}`;
  },
  "instruments/removeAllInstrumentEffects": (
    action: PayloadAction<InstrumentSlice.RemoveAllInstrumentEffectsPayload>
  ) => {
    return `${action.payload}`;
  },
};
