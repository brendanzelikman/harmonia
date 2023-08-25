import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  defaultPattern,
  initializePattern,
  rotatePatternStream,
  isRest,
  Pattern,
  PatternChord,
  PatternId,
  PatternNoId,
  PatternNote,
  PatternStream,
} from "types/patterns";
import { initializeState } from "redux/util";
import { AppThunk } from "redux/store";
import { selectRoot } from "redux/selectors";

import Scales from "types/scales";
import { MIDI } from "types/midi";

import { setSelectedPattern } from "./root";
import { clamp, random, reverse, shuffle } from "lodash";
import { MAX_SUBDIVISION } from "appConstants";
import { mod } from "appUtil";

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

interface TransformPattern {
  id: PatternId;
  [key: string]: any;
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
    transposePattern: (state, action: PayloadAction<TransformPattern>) => {
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
    rotatePattern: (state, action: PayloadAction<TransformPattern>) => {
      const { id, transpose } = action.payload;
      if (transpose === 0) return; // Avoid unnecessary work
      const pattern = state.byId[id];
      if (!pattern) return;

      pattern.stream = rotatePatternStream(pattern.stream, transpose);
    },

    repeatPattern: (state, action: PayloadAction<TransformPattern>) => {
      const { id, repeat } = action.payload;
      if (repeat === 0) return; // Avoid unnecessary work
      const pattern = state.byId[id];
      if (!pattern) return;

      state.byId[id].stream = new Array(repeat + 1).fill(pattern.stream).flat();
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
    lengthenPattern: (state, action: PayloadAction<TransformPattern>) => {
      const { id, length } = action.payload;
      const pattern = state.byId[id];
      if (!pattern) return;

      state.byId[id].stream = new Array(length)
        .fill(0)
        .map((_, i) => pattern.stream[i % pattern.stream.length]);
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
    phasePattern: (state, action: PayloadAction<TransformPattern>) => {
      const { id, phase } = action.payload;
      const pattern = state.byId[id];
      if (!pattern) return;

      const length = pattern.stream.length;
      const stream: PatternStream = [];
      for (let i = 0; i < length; i++) {
        const index = mod(i + phase, length);
        stream.push(pattern.stream[index]);
      }
      state.byId[id].stream = stream;
    },
    reversePattern: (state, action: PayloadAction<PatternId>) => {
      const patternId = action.payload;
      const pattern = state.byId[patternId];
      if (!pattern) return;

      state.byId[patternId].stream = reverse(pattern.stream);
    },
    shufflePattern: (state, action: PayloadAction<PatternId>) => {
      const patternId = action.payload;
      const pattern = state.byId[patternId];
      if (!pattern) return;

      state.byId[patternId].stream = shuffle(pattern.stream);
    },
    randomizePattern: (state, action: PayloadAction<TransformPattern>) => {
      const { id, length } = action.payload;
      const pattern = state.byId[id];
      if (!pattern) return;

      const noteCount = length;
      const stream: PatternStream = [];
      const restPercent = 0.1;
      for (let i = 0; i < noteCount; i++) {
        const seed = Math.random();

        if (seed < restPercent) {
          stream.push([{ duration: MIDI.SixteenthNote, MIDI: MIDI.Rest }]);
        } else {
          const noteCount = 1;
          const scales = Scales.PresetGroups["Basic Scales"];
          const scale = scales[Math.floor(Math.random() * scales.length)];
          let midiNotes = [...scale.notes.map((n) => n - 7), ...scale.notes];
          const chord: PatternChord = new Array(noteCount)
            .fill(0)
            .map((_, i) => {
              const index = random(0, midiNotes.length - 1);
              const midi = midiNotes[index];
              midiNotes = midiNotes.filter((note) => note !== midi);
              return { duration: MIDI.SixteenthNote, MIDI: midi };
            });
          stream.push(chord);
        }
      }

      state.byId[id].stream = stream;
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
  rotatePattern,
  repeatPattern,
  halvePattern,
  lengthenPattern,
  stretchPattern,
  shrinkPattern,
  shufflePattern,
  phasePattern,
  reversePattern,
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
    const { selectedPatternId } = selectRoot(state);
    if (selectedPatternId === id) {
      const nextId = patterns?.[index - 1] || patterns?.[index + 1];
      if (nextId) dispatch(setSelectedPattern(nextId));
    }
    dispatch(removePattern(id));
  };

export default patternsSlice.reducer;
