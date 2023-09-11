import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  defaultPattern,
  initializePattern,
  rotatePatternStream,
  Pattern,
  PatternChord,
  PatternId,
  PatternNoId,
  PatternNote,
  PatternStream,
  isPatternValid,
} from "types/pattern";
import { initializeState } from "redux/util";
import { AppThunk } from "redux/store";
import { selectRoot } from "redux/selectors";

import { MIDI } from "types/midi";

import { setSelectedPattern } from "./root";
import { clamp, random, reverse, shuffle, union } from "lodash";
import { mod } from "utils";
import { PresetScaleGroupMap } from "types/presets/scales";

const initialState = initializeState<PatternId, Pattern>([defaultPattern]);

interface PatternAddNote {
  id: PatternId;
  patternNote: PatternNote;
  asChord?: boolean;
}

interface PatternAddChord {
  id: PatternId;
  patternChord: PatternChord;
}

interface PatternInsert {
  id: PatternId;
  patternNote: PatternNote;
  index: number;
}

interface PatternUpdateNote {
  id: PatternId;
  index: number;
  patternNote: PatternNote;
  asChord?: boolean;
}

interface PatternUpdateChord {
  id: PatternId;
  index: number;
  patternChord: PatternChord;
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
      state.allIds = union(state.allIds, [pattern.id]);
      state.byId[pattern.id] = pattern;
    },
    addPatterns: (state, action: PayloadAction<Pattern[]>) => {
      const patterns = action.payload;
      const patternIds = patterns.map((pattern) => pattern.id);
      state.allIds = union(state.allIds, patternIds);
      patterns.forEach((pattern) => {
        state.byId[pattern.id] = pattern;
      });
    },
    removePattern: (state, action: PayloadAction<PatternId>) => {
      const patternId = action.payload;
      const index = state.allIds.findIndex((id) => id === patternId);
      if (index === -1) return;
      state.allIds.splice(index, 1);
      delete state.byId[patternId];
    },
    removePatterns: (state, action: PayloadAction<PatternId[]>) => {
      const patternIds = action.payload;
      patternIds.forEach((patternId) => {
        const index = state.allIds.findIndex((id) => id === patternId);
        if (index === -1) return;
        state.allIds.splice(index, 1);
        delete state.byId[patternId];
      });
    },
    _updatePattern: (state, action: PayloadAction<Partial<Pattern>>) => {
      const { id, ...rest } = action.payload;
      if (!id) return;
      if (!state.byId[id]) return;
      state.byId[id] = { ...state.byId[id], ...rest };
    },
    _updatePatterns: (state, action: PayloadAction<Partial<Pattern>[]>) => {
      const patterns = action.payload;
      patterns.forEach((pattern) => {
        const { id, ...rest } = pattern;
        if (!id) return;
        state.byId[id] = { ...state.byId[id], ...rest };
      });
    },
    addPatternNote: (state, action: PayloadAction<PatternAddNote>) => {
      const { id, patternNote, asChord } = action.payload;
      const pattern = state.byId[id];
      if (!pattern || !isPatternValid(pattern)) return;

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
    addPatternChord: (state, action: PayloadAction<PatternAddChord>) => {
      const { id, patternChord } = action.payload;
      const pattern = state.byId[id];
      if (!pattern || !isPatternValid(pattern)) return;

      // If the pattern is empty, add the chord as the first chord
      if (pattern.stream.length === 0) {
        state.byId[id].stream = [patternChord];
        return;
      }

      // If the chord is not a chord, add it to the end of the pattern
      state.byId[id].stream.push(patternChord);
    },
    insertPatternNote: (state, action: PayloadAction<PatternInsert>) => {
      const { id, patternNote, index } = action.payload;
      const pattern = state.byId[id];
      if (!pattern || !isPatternValid(pattern)) return;

      if (index < 0 || index > pattern.stream.length) return;

      const patternChord: PatternChord = [patternNote];
      state.byId[id].stream.splice(index + 1, 0, patternChord);
    },
    updatePatternNote: (state, action: PayloadAction<PatternUpdateNote>) => {
      const { id, patternNote, index, asChord } = action.payload;
      const pattern = state.byId[id];
      if (!pattern || !isPatternValid(pattern)) return;

      if (index < 0 || index > pattern.stream.length) return;

      if (MIDI.isRest(patternNote) || !asChord) {
        state.byId[id].stream[index] = [patternNote];
      } else {
        state.byId[id].stream[index].push(patternNote);
      }
    },
    updatePatternChord: (state, action: PayloadAction<PatternUpdateChord>) => {
      const { id, patternChord, index } = action.payload;
      const pattern = state.byId[id];
      if (!pattern || !isPatternValid(pattern)) return;

      if (index < 0 || index > pattern.stream.length) return;
      state.byId[id].stream[index] = patternChord;
    },
    removePatternNote: (state, action) => {
      const { id, index } = action.payload;
      const pattern = state.byId[id];
      if (!pattern || !isPatternValid(pattern)) return;
      if (index < 0 || index > pattern.stream.length) return;
      state.byId[id].stream.splice(index, 1);
    },
    transposePattern: (state, action: PayloadAction<TransformPattern>) => {
      const { id, transpose } = action.payload;
      if (transpose === 0) return; // Avoid unnecessary work
      const pattern = state.byId[id];
      if (!pattern || !isPatternValid(pattern)) return;

      pattern.stream = pattern.stream.map((chord) => {
        if (MIDI.isRest(chord)) return chord;
        return chord.map((note) => ({ ...note, MIDI: note.MIDI + transpose }));
      });
    },
    rotatePattern: (state, action: PayloadAction<TransformPattern>) => {
      const { id, transpose } = action.payload;
      if (transpose === 0) return; // Avoid unnecessary work
      const pattern = state.byId[id];
      if (!pattern) return;

      pattern.stream = rotatePatternStream(pattern.stream, transpose);
    },
    invertPattern: (state, action: PayloadAction<PatternId>) => {
      const patternId = action.payload;
      const pattern = state.byId[patternId];
      if (!pattern) return;

      const baseChord = pattern.stream.find(
        (chord) => chord.length > 0 && !MIDI.isRest(chord)
      );
      if (!baseChord) return;

      const baseMIDI = baseChord[0].MIDI;
      pattern.stream = pattern.stream.map((chord) => {
        if (MIDI.isRest(chord)) return chord;

        return chord.map((note) => ({
          ...note,
          MIDI: baseMIDI - (note.MIDI - baseMIDI),
        }));
      });
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
    augmentPattern: (state, action: PayloadAction<PatternId>) => {
      const patternId = action.payload;
      const pattern = state.byId[patternId];
      if (!pattern) return;

      pattern.stream = pattern.stream.map((chord) => {
        return chord.map((note) => ({
          ...note,
          duration: clamp(
            note.duration * 2,
            MIDI.SixtyFourthNoteTicks,
            MIDI.WholeNoteTicks
          ),
        }));
      });
    },
    diminishPattern: (state, action: PayloadAction<PatternId>) => {
      const patternId = action.payload;
      const pattern = state.byId[patternId];
      if (!pattern) return;

      pattern.stream = pattern.stream.map((chord) => {
        return chord.map((note) => ({
          ...note,
          duration: clamp(
            note.duration / 2,
            MIDI.SixtyFourthNoteTicks,
            MIDI.WholeNoteTicks
          ),
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
    harmonizePattern: (state, action: PayloadAction<TransformPattern>) => {
      const { id, interval } = action.payload;
      const pattern = state.byId[id];
      if (!pattern) return;

      state.byId[id].stream = pattern.stream.map((chord) => {
        if (!chord.length) return chord;
        if (MIDI.isRest(chord)) return chord;
        return [
          ...chord,
          ...chord.map((note) => ({ ...note, MIDI: note.MIDI + interval })),
        ];
      });
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
          stream.push([
            {
              duration: MIDI.SixteenthNoteTicks,
              MIDI: MIDI.Rest,
              velocity: MIDI.DefaultVelocity,
            },
          ]);
        } else {
          const noteCount = 1;
          const scales = PresetScaleGroupMap["Basic Scales"];
          const scale = scales[Math.floor(Math.random() * scales.length)];
          let midiNotes = [...scale.notes.map((n) => n - 7), ...scale.notes];
          const chord: PatternChord = new Array(noteCount)
            .fill(0)
            .map((_, i) => {
              const index = random(0, midiNotes.length - 1);
              const midi = midiNotes[index];
              midiNotes = midiNotes.filter((note) => note !== midi);
              return {
                duration: MIDI.SixteenthNoteTicks,
                velocity: MIDI.DefaultVelocity,
                MIDI: midi,
              };
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
  addPatterns,
  removePattern,
  removePatterns,
  _updatePattern,
  _updatePatterns,
  addPatternNote,
  addPatternChord,
  insertPatternNote,
  removePatternNote,
  updatePatternNote,
  updatePatternChord,
  transposePattern,
  rotatePattern,
  invertPattern,
  repeatPattern,
  halvePattern,
  lengthenPattern,
  augmentPattern,
  diminishPattern,
  shufflePattern,
  phasePattern,
  reversePattern,
  harmonizePattern,
  randomizePattern,
  clearPattern,
} = patternsSlice.actions;

export const updatePattern =
  (pattern: Partial<Pattern> = defaultPattern): AppThunk =>
  (dispatch) => {
    if (!pattern.id) return;
    // Don't update the pattern if it's invalid
    if (pattern.stream && !isPatternValid(pattern as Pattern)) return;
    dispatch(_updatePattern(pattern));
  };

export const updatePatterns =
  (patterns: Partial<Pattern>[] = []): AppThunk =>
  (dispatch) => {
    // Don't update the patterns if they're invalid
    if (patterns.some((p) => p.stream && !isPatternValid(p as Pattern))) return;
    dispatch(_updatePatterns(patterns));
  };

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

export const createPatterns =
  (patterns: Partial<PatternNoId>[] = []): AppThunk =>
  (dispatch) => {
    const newPatterns = patterns.map((pattern) => initializePattern(pattern));
    dispatch(addPatterns(newPatterns));
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
