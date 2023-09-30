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
import { selectPatterns, selectRoot } from "redux/selectors";
import { MIDI } from "types/midi";
import { setSelectedPattern } from "./root";
import { clamp, random, reverse, shuffle, union } from "lodash";
import { mod } from "utils";
import { PresetScaleGroupMap } from "types/presets/scales";

const initialState = initializeState<PatternId, Pattern>([defaultPattern]);

export type AddPatterns = Pattern[];
export type RemovePatterns = PatternId[];
export type UpdatePatterns = Partial<Pattern>[];

export type AddPatternNote = {
  id: PatternId;
  patternNote: PatternNote;
  asChord?: boolean;
};

export interface AddPatternChord {
  id: PatternId;
  patternChord: PatternChord;
}

export interface InsertPatternNote {
  id: PatternId;
  patternNote: PatternNote;
  index: number;
}

export interface UpdatePatternNote {
  id: PatternId;
  index: number;
  patternNote: PatternNote;
  asChord?: boolean;
}
export interface RemovePatternNote {
  id: PatternId;
  index: number;
}

export interface UpdatePatternChord {
  id: PatternId;
  index: number;
  patternChord: PatternChord;
}

export interface TransposePattern {
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
    addPatterns: (state, action: PayloadAction<AddPatterns>) => {
      const patterns = action.payload;
      const patternIds = patterns.map((pattern) => pattern.id);
      state.allIds = union(state.allIds, patternIds);
      patterns.forEach((pattern) => {
        state.byId[pattern.id] = pattern;
      });
    },
    removePatterns: (state, action: PayloadAction<RemovePatterns>) => {
      const patternIds = action.payload;
      patternIds.forEach((patternId) => {
        const index = state.allIds.findIndex((id) => id === patternId);
        if (index === -1) return;
        state.allIds.splice(index, 1);
        delete state.byId[patternId];
      });
    },
    updatePatterns: (state, action: PayloadAction<UpdatePatterns>) => {
      const patterns = action.payload;
      patterns.forEach((pattern) => {
        const { id, ...rest } = pattern;
        if (!id) return;
        state.byId[id] = { ...state.byId[id], ...rest };
      });
    },
    addPatternNote: (state, action: PayloadAction<AddPatternNote>) => {
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
    addPatternChord: (state, action: PayloadAction<AddPatternChord>) => {
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
    insertPatternNote: (state, action: PayloadAction<InsertPatternNote>) => {
      const { id, patternNote, index } = action.payload;
      const pattern = state.byId[id];
      if (!pattern || !isPatternValid(pattern)) return;

      if (index < 0 || index > pattern.stream.length) return;

      const patternChord: PatternChord = [patternNote];
      state.byId[id].stream.splice(index + 1, 0, patternChord);
    },
    updatePatternNote: (state, action: PayloadAction<UpdatePatternNote>) => {
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
    updatePatternChord: (state, action: PayloadAction<UpdatePatternChord>) => {
      const { id, patternChord, index } = action.payload;
      const pattern = state.byId[id];
      if (!pattern || !isPatternValid(pattern)) return;

      if (index < 0 || index > pattern.stream.length) return;
      state.byId[id].stream[index] = patternChord;
    },
    removePatternNote: (state, action: PayloadAction<RemovePatternNote>) => {
      const { id, index } = action.payload;
      const pattern = state.byId[id];
      if (!pattern || !isPatternValid(pattern)) return;
      if (index < 0 || index > pattern.stream.length) return;
      state.byId[id].stream.splice(index, 1);
    },
    transposePattern: (state, action: PayloadAction<TransposePattern>) => {
      const { id, transpose } = action.payload;
      if (transpose === 0) return; // Avoid unnecessary work
      const pattern = state.byId[id];
      if (!pattern || !isPatternValid(pattern)) return;

      pattern.stream = pattern.stream.map((chord) => {
        if (MIDI.isRest(chord)) return chord;
        return chord.map((note) => ({ ...note, MIDI: note.MIDI + transpose }));
      });
    },
    rotatePattern: (state, action: PayloadAction<TransposePattern>) => {
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
    repeatPattern: (state, action: PayloadAction<TransposePattern>) => {
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
    continuePattern: (state, action: PayloadAction<TransposePattern>) => {
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
    phasePattern: (state, action: PayloadAction<TransposePattern>) => {
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
    harmonizePattern: (state, action: PayloadAction<TransposePattern>) => {
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
    randomizePattern: (state, action: PayloadAction<TransposePattern>) => {
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
  addPatterns,
  removePatterns,
  updatePatterns,
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
  continuePattern,
  augmentPattern,
  diminishPattern,
  shufflePattern,
  phasePattern,
  reversePattern,
  harmonizePattern,
  randomizePattern,
  clearPattern,
} = patternsSlice.actions;

export const createPattern =
  (pattern: Partial<PatternNoId> = {}): AppThunk<Promise<PatternId>> =>
  async (dispatch) => {
    return new Promise((resolve) => {
      const newPattern = initializePattern(pattern);
      dispatch(addPatterns([newPattern]));
      resolve(newPattern.id);
    });
  };

export const createPatterns =
  (patterns: Partial<PatternNoId>[] = []): AppThunk<Promise<PatternId[]>> =>
  async (dispatch) => {
    return new Promise((resolve) => {
      const newPatterns = patterns.map((pattern) => initializePattern(pattern));
      dispatch(addPatterns(newPatterns));
      resolve(newPatterns.map((pattern) => pattern.id));
    });
  };

export const deletePattern =
  (id: PatternId): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const { selectedPatternId } = selectRoot(state);
    const patterns = selectPatterns(state);
    const index = patterns.findIndex((pattern) => pattern.id === id);
    if (index === -1) return;
    if (selectedPatternId === id) {
      const nextId = patterns?.[index - 1]?.id || patterns?.[index + 1]?.id;
      if (nextId) dispatch(setSelectedPattern(nextId));
    }
    dispatch(removePatterns([id]));
  };

export const deletePatterns =
  (ids: PatternId[]): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const patterns = state.patterns.present.allIds;
    ids.forEach((id) => {
      const index = patterns.findIndex((patternId) => patternId === id);
      if (index === -1) return;
      const { selectedPatternId } = selectRoot(state);
      if (selectedPatternId === id) {
        const nextId = patterns?.[index - 1] || patterns?.[index + 1];
        if (nextId) dispatch(setSelectedPattern(nextId));
      }
      dispatch(removePatterns([id]));
    });
  };

export default patternsSlice.reducer;
