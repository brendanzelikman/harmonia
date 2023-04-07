import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  defaultPattern,
  initializePattern,
  invertPatternStream,
  isRest,
  Pattern,
  PatternChord,
  PatternId,
  PatternNoId,
  PatternNote,
  PatternStream,
  realizePattern,
} from "types/patterns";
import { initializeState } from "redux/util";
import { AppThunk } from "redux/store";
import { selectPattern, selectRoot, selectTransport } from "redux/selectors";
import { getGlobalSampler } from "types/instrument";
import { defaultScale } from "types/scales";
import { MIDI } from "types/midi";
import { convertTimeToSeconds } from "./transport";
import { beatsToSubdivision } from "appUtil";
import { setActivePattern } from "./root";
import { clamp, random, shuffle } from "lodash";
import { MAX_SUBDIVISION } from "appConstants";
import { MajorScale } from "types/presets/scales";

const initialState = initializeState<PatternId, Pattern>([defaultPattern]);

interface PatternAdd {
  id: PatternId;
  patternNote: PatternNote;
  asChord?: boolean;
}

interface PatternInsert {
  id: PatternId;
  patternNote: PatternNote;
  index: number;
}

interface PatternUpdate {
  id: PatternId;
  index: number;
  patternNote: PatternNote;
  asChord?: boolean;
}

interface TransposePattern {
  id: PatternId;
  transpose: number;
}

export const patternsSlice = createSlice({
  name: "patterns",
  initialState,
  reducers: {
    setPatternIds: (state, action: PayloadAction<PatternId[]>) => {
      const patternIds = action.payload;
      state.allIds = patternIds;
    },
    addPattern: (state, action: PayloadAction<Pattern>) => {
      const pattern = action.payload;
      state.allIds.push(pattern.id);
      state.byId[pattern.id] = pattern;
    },
    removePattern: (state, action: PayloadAction<PatternId>) => {
      const patternId = action.payload;
      const index = state.allIds.findIndex((id) => id === patternId);
      if (index === -1) return;
      state.allIds.splice(index, 1);
      delete state.byId[patternId];
    },
    updatePattern: (state, action: PayloadAction<Partial<Pattern>>) => {
      const { id, ...rest } = action.payload;
      if (!id) return;
      if (!state.byId[id]) return;
      state.byId[id] = { ...state.byId[id], ...rest };
    },
    addPatternNote: (state, action: PayloadAction<PatternAdd>) => {
      const { id, patternNote, asChord } = action.payload;
      const pattern = state.byId[id];
      if (!pattern) return;

      // If the pattern is empty, add the note as the first chord
      if (pattern.stream.length === 0) {
        const chord: PatternChord = [patternNote];
        state.byId[id].stream = [chord];
        return;
      }
      // If the note is not a chord, add it to the end of the pattern
      if (!asChord) {
        const patternChord: PatternChord = [patternNote];
        state.byId[id].stream.push(patternChord);
      } else {
        // If the note is a chord, add it to the end of the last chord
        const length = pattern.stream.length;
        state.byId[id].stream[length - 1].push(patternNote);
      }
    },
    insertPatternNote: (state, action: PayloadAction<PatternInsert>) => {
      const { id, patternNote, index } = action.payload;
      const pattern = state.byId[id];
      if (!pattern) return;

      if (index < 0 || index > pattern.stream.length) return;

      const patternChord: PatternChord = [patternNote];
      state.byId[id].stream.splice(index + 1, 0, patternChord);
    },
    updatePatternNote: (state, action: PayloadAction<PatternUpdate>) => {
      const { id, patternNote, index, asChord } = action.payload;
      const pattern = state.byId[id];
      if (!pattern) return;

      if (index < 0 || index > pattern.stream.length) return;

      if (isRest(patternNote) || !asChord) {
        state.byId[id].stream[index] = [patternNote];
      } else {
        state.byId[id].stream[index].push(patternNote);
      }
    },
    removePatternNote: (state, action) => {
      const { id, index } = action.payload;
      const pattern = state.byId[id];
      if (!pattern) return;
      if (index < 0 || index > pattern.stream.length) return;
      state.byId[id].stream.splice(index, 1);
    },
    transposePattern: (state, action: PayloadAction<TransposePattern>) => {
      const { id, transpose } = action.payload;
      if (transpose === 0) return; // Avoid unnecessary work
      const pattern = state.byId[id];
      if (!pattern) return;

      pattern.stream = pattern.stream.map((chord) => {
        return chord.map((note) => {
          if (isRest(note)) return note; // Don't transpose rests
          return { ...note, MIDI: note.MIDI + transpose };
        });
      });
    },
    invertPattern: (state, action: PayloadAction<TransposePattern>) => {
      const { id, transpose } = action.payload;
      if (transpose === 0) return; // Avoid unnecessary work
      const pattern = state.byId[id];
      if (!pattern) return;

      pattern.stream = invertPatternStream(pattern.stream, transpose);
    },

    repeatPattern: (state, action: PayloadAction<PatternId>) => {
      const patternId = action.payload;
      const pattern = state.byId[patternId];
      if (!pattern) return;

      state.byId[patternId].stream = [...pattern.stream, ...pattern.stream];
    },
    halvePattern: (state, action: PayloadAction<PatternId>) => {
      const patternId = action.payload;
      const pattern = state.byId[patternId];
      if (!pattern) return;

      state.byId[patternId].stream = pattern.stream.slice(
        0,
        pattern.stream.length / 2
      );
    },
    stretchPattern: (state, action: PayloadAction<PatternId>) => {
      const patternId = action.payload;
      const pattern = state.byId[patternId];
      if (!pattern) return;

      pattern.stream = pattern.stream.map((chord) => {
        return chord.map((note) => ({
          ...note,
          duration: clamp(note.duration * 2, 1, MAX_SUBDIVISION),
        }));
      });
    },
    shrinkPattern: (state, action: PayloadAction<PatternId>) => {
      const patternId = action.payload;
      const pattern = state.byId[patternId];
      if (!pattern) return;

      pattern.stream = pattern.stream.map((chord) => {
        return chord.map((note) => ({
          ...note,
          duration: clamp(note.duration / 2, 1, MAX_SUBDIVISION),
        }));
      });
    },
    shufflePattern: (state, action: PayloadAction<PatternId>) => {
      const patternId = action.payload;
      const pattern = state.byId[patternId];
      if (!pattern) return;

      state.byId[patternId].stream = shuffle(pattern.stream);
    },
    randomizePattern: (state, action: PayloadAction<PatternId>) => {
      const patternId = action.payload;
      const pattern = state.byId[patternId];
      if (!pattern) return;

      const noteCount = random(1, 4);
      const stream: PatternStream = [];
      const restPercent = 0.2;
      for (let i = 0; i < noteCount; i++) {
        const seed = Math.random();

        if (seed < restPercent) {
          const duration = random(1, Math.log2(MAX_SUBDIVISION));
          const chord: PatternChord = [
            { duration: Math.pow(2, duration), MIDI: MIDI.Rest },
          ];
          stream.push(chord);
        } else {
          const noteCount = random(1, 4);
          let midiNotes = MajorScale.notes;
          const chord: PatternChord = new Array(noteCount)
            .fill(0)
            .map((_, i) => {
              const index = random(0, midiNotes.length - 1);
              const MIDI = midiNotes[index];
              midiNotes = midiNotes.filter((note) => note !== MIDI);
              const duration = random(1, Math.log2(MAX_SUBDIVISION));
              return { duration: Math.pow(2, duration), MIDI };
            });
          stream.push(chord);
        }
      }

      state.byId[patternId].stream = stream;
    },
    clearPattern: (state, action: PayloadAction<PatternId>) => {
      const patternId = action.payload;
      const pattern = state.byId[patternId];
      if (!pattern) return;

      state.byId[patternId].stream = [];
    },
  },
});

export const {
  setPatternIds,
  addPattern,
  removePattern,
  updatePattern,
  addPatternNote,
  insertPatternNote,
  removePatternNote,
  updatePatternNote,
  transposePattern,
  invertPattern,
  repeatPattern,
  halvePattern,
  stretchPattern,
  shrinkPattern,
  shufflePattern,
  randomizePattern,
  clearPattern,
} = patternsSlice.actions;

export const createPattern =
  (
    pattern: Partial<PatternNoId> = defaultPattern
  ): AppThunk<Promise<PatternId>> =>
  async (dispatch) => {
    return new Promise((resolve) => {
      const newPattern = initializePattern(pattern);
      dispatch(addPattern(newPattern));
      resolve(newPattern.id);
    });
  };

export const deletePattern =
  (id: PatternId): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const patterns = state.patterns.present.allIds;
    const index = patterns.findIndex((patternId) => patternId === id);
    if (index === -1) return;
    const { activePatternId } = selectRoot(state);
    if (activePatternId === id) {
      const nextId = patterns?.[index - 1] || patterns?.[index + 1];
      if (nextId) dispatch(setActivePattern(nextId));
    }
    dispatch(removePattern(id));
  };

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

export default patternsSlice.reducer;
