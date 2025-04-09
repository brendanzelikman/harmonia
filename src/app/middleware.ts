import { Middleware } from "@reduxjs/toolkit";
import { union } from "lodash";
import {
  selectInstrumentIds,
  selectInstrumentMap,
} from "../types/Instrument/InstrumentSelectors";
import { Project } from "types/Project/ProjectTypes";
import {
  LIVE_AUDIO_INSTANCES,
  LiveAudioInstance,
} from "../types/Instrument/InstrumentClass";

/** A custom middleware to recreate all audio instances when undoing/redoing. */
export const validateAudio: Middleware = (store) => (next) => (action: any) => {
  // Get the old state
  const oldState = store.getState() as Project;
  const oldInstrumentIds = selectInstrumentIds(oldState);
  const oldInstrumentMap = selectInstrumentMap(oldState);

  // Let the action pass through
  const result = next(action) as Project;
  if (!action.type.includes("undo")) return result;

  // Get the new state
  const nextState = store.getState() as Project;
  const newInstrumentMap = selectInstrumentMap(nextState);
  const newInstrumentIds = selectInstrumentIds(nextState);

  // Get all instrument IDs
  const ids = union(oldInstrumentIds, newInstrumentIds);

  // Validate all instruments if undoing/redoing the arrangement
  for (const id of ids) {
    // Get the instruments
    const oldInstrument = oldInstrumentMap[id];
    const newInstrument = newInstrumentMap[id];
    const instance = LIVE_AUDIO_INSTANCES[id];

    // If the instance has stopped existing, delete it and continue
    if (!newInstrument) {
      instance?.dispose?.();
      delete LIVE_AUDIO_INSTANCES[id];
      continue;
    }

    // If the instrument or effect has started existing, recreate the instance
    const oldEffectCount = oldInstrument?.effects.length ?? 0;
    const newEffectCount = newInstrument.effects.length;
    if (!oldInstrument || newEffectCount > oldEffectCount) {
      LIVE_AUDIO_INSTANCES[id] = new LiveAudioInstance({
        ...instance?.getInitializationProps?.(),
        ...newInstrument,
      });
    }
  }

  // Return the result
  return result;
};
