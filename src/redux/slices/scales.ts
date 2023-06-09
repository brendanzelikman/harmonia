import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { beatsToSubdivision } from "appUtil";
import { selectScale, selectTransport } from "redux/selectors";
import { AppThunk } from "redux/store";
import { initializeState } from "redux/util";
import { getGlobalSampler } from "types/instrument";
import { MIDI } from "types/midi";
import Scales, {
  defaultScale,
  initializeScale,
  Scale,
  ScaleId,
  ScaleNoId,
  rotateScale as _rotateScale,
} from "types/scales";
import { Note } from "types/units";

import { convertTimeToSeconds } from "./transport";

const newScale: Scale = {
  ...defaultScale,
  name: Scales.TrackScaleName,
};
const initialState = initializeState<ScaleId, Scale>([newScale]);

interface ScaleNote {
  id: ScaleId;
  note: Note;
}

interface ScaleTranspose {
  id: ScaleId;
  offset: number;
}

export const scalesSlice = createSlice({
  name: "scales",
  initialState,
  reducers: {
    setScaleIds: (state, action: PayloadAction<ScaleId[]>) => {
      const patternIds = action.payload;
      state.allIds = patternIds;
    },
    addScale: (state, action: PayloadAction<Scale>) => {
      const scale = action.payload;
      state.allIds.push(scale.id);
      state.byId[scale.id] = scale;
    },
    removeScale: (state, action: PayloadAction<ScaleId>) => {
      const scaleId = action.payload;
      const index = state.allIds.findIndex((id) => id === scaleId);
      if (index === -1) return;
      state.allIds.splice(index, 1);
      delete state.byId[scaleId];
    },
    addNoteToScale: (state, action: PayloadAction<ScaleNote>) => {
      const { id, note } = action.payload;
      const scale = state.byId[id];
      if (!scale) return;

      // Get the pitch classes of the scale and note
      const scalePitches = scale.notes.map((n) => MIDI.toPitchClass(n));
      const notePitch = MIDI.toPitchClass(note);

      // Make sure the note is not already in the scale
      if (scalePitches.includes(notePitch)) return;

      // Add the note to the scale and sort the notes
      state.byId[id].notes = [...scale.notes, note].sort((a, b) => a - b);
    },
    removeNoteFromScale: (state, action: PayloadAction<ScaleNote>) => {
      const { id, note } = action.payload;
      const scale = state.byId[id];
      if (!scale) return;

      // Get the pitch classes of the scale and note
      const scalePitches = scale.notes.map((n) => MIDI.toPitchClass(n));
      const notePitch = MIDI.toPitchClass(note);

      // Make sure the note is in the scale
      if (!scalePitches.includes(notePitch)) return;

      // Remove the note from the scale by pitch
      state.byId[id].notes = scale.notes.filter(
        (n) => MIDI.toPitchClass(n) !== notePitch
      );
    },
    transposeScale: (state, action: PayloadAction<ScaleTranspose>) => {
      const { id, offset } = action.payload;
      const scale = state.byId[id];
      if (!scale) return;

      // Transpose the notes in the scale by the offset
      state.byId[id].notes = scale.notes.map((n) => n + offset);
    },
    rotateScale: (state, action: PayloadAction<ScaleTranspose>) => {
      const { id, offset } = action.payload;
      const scale = state.byId[id];
      if (!scale) return;

      // Invert the notes in the scale by the offset
      state.byId[id] = _rotateScale(scale, offset);
    },
    clearScale: (state, action: PayloadAction<ScaleId>) => {
      const id = action.payload;
      const scale = state.byId[id];
      if (!scale) return;

      state.byId[id].notes = [];
    },
    updateScale: (state, action: PayloadAction<Partial<Scale>>) => {
      const { id, ...rest } = action.payload;
      if (!id) return;
      state.byId[id] = { ...state.byId[id], ...rest };
    },
  },
});

export const {
  setScaleIds,
  addScale,
  removeScale,
  addNoteToScale,
  removeNoteFromScale,
  clearScale,
  updateScale,
  transposeScale,
  rotateScale,
} = scalesSlice.actions;

export const createScale =
  (scale: Partial<ScaleNoId> = defaultScale): AppThunk<Promise<ScaleId>> =>
  async (dispatch) => {
    return new Promise((resolve) => {
      const newScale = initializeScale(scale);
      dispatch(addScale(newScale));
      resolve(newScale.id);
    });
  };

export const deleteScale =
  (id: ScaleId): AppThunk<Promise<void>> =>
  async (dispatch) => {
    return new Promise((resolve) => {
      dispatch(removeScale(id));
      resolve();
    });
  };

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
      const duration = convertTimeToSeconds(transport, 2);
      const subdivision = beatsToSubdivision(2);
      const pitch = MIDI.toPitch(note);
      setTimeout(() => {
        if (!sampler) return;
        sampler.triggerAttackRelease([pitch], subdivision);
      }, time * 1000);
      time += duration;
    }
  };

export default scalesSlice.reducer;
