import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  Pattern,
  PatternChord,
  PatternId,
  PatternNote,
  PatternStream,
  isPattern,
  PatternUpdate,
  defaultPatternState,
  isPatternChord,
  isPatternMidiNote,
  isPatternRest,
  getPatternBlockDuration,
  PatternBlock,
} from "types/Pattern";
import { clamp, random, reverse, shuffle, union } from "lodash";
import { mod } from "utils/math";
import { isNestedNote, resolveScaleToMidi, sumScaleVectors } from "types/Scale";
import {
  DottedWholeNoteTicks,
  SixteenthNoteTicks,
  SixtyFourthNoteTicks,
  TripletSixtyFourthNoteTicks,
  WholeNoteTicks,
} from "utils/durations";
import { PresetScaleGroupMap } from "presets/scales";
import { DEFAULT_VELOCITY } from "utils/constants";

// ------------------------------------------------------------
// Pattern Payload Types
// ------------------------------------------------------------

/** A `Pattern` can be added to the store. */
export type AddPatternPayload = Pattern;

/** A `Pattern` can be removed from the store by ID. */
export type RemovePatternPayload = PatternId;

/** A `Pattern` can be updated in the store. */
export type UpdatePatternPayload = PatternUpdate;

/** A `PatternNote` can be added to a `Pattern` in the store. */
export type AddPatternNotePayload = {
  id: PatternId;
  note: PatternNote;
  asChord?: boolean;
};

/** A `PatternNote` can be updated by index. */
export interface UpdatePatternNotePayload extends AddPatternNotePayload {
  index: number;
}

/** A `PatternNote` can be inserted at a specific index. */
export type InsertPatternNotePayload = UpdatePatternNotePayload;

/** A `PatternBlock` can be added to a `Pattern` in the store. */
export type AddPatternBlockPayload = { id: PatternId; block: PatternBlock };

/** A `PatternBlock` can be inserted at a specific index. */
export interface InsertPatternBlockPayload {
  id: PatternId;
  block: PatternBlock;
  index: number;
}

/** A `PatternBlock` can be updated by index. */
export interface UpdatePatternBlockPayload {
  id: PatternId;
  block: PatternBlock;
  index: number;
}

/** A `PatternBlock` can be transposed with an index and offset. */
export type TransposePatternBlockPayload = {
  id: PatternId;
  index: number;
  transpose: number;
};

/** A `PatternBlock` can be removed by index. */
export type RemovePatternBlockPayload = { id: PatternId; index: number };

/** A `Pattern` can be cleared of all notes. */
export type ClearPatternPayload = PatternId;

/** A `Pattern` can be transposed by a number of semitones. */
export type TransposePatternPayload = { id: PatternId; transpose: number };

/** A `Pattern` can be rotated by a number of semitones. */
export type RotatePatternPayload = { id: PatternId; transpose: number };

/** A `Pattern` can be repeated a number of times. */
export type RepeatPatternPayload = { id: PatternId; repeat: number };

/** A `Pattern` can be continued for a particular length. */
export type ContinuePatternPayload = { id: PatternId; length: number };

/** A `Pattern` can be phased by a number of steps. */
export type PhasePatternPayload = { id: PatternId; phase: number };

/** A `Pattern` can be stretched by a scaling factor. */
export type StretchPatternPayload = { id: PatternId; factor: number };

/** A `Pattern` can be reversed. */
export type ReversePatternPayload = PatternId;

/** A `Pattern` can be shuffled. */
export type ShufflePatternPayload = PatternId;

/** A `Pattern` can be harmonized with a particular interval. */
export type HarmonizePatternPayload = { id: PatternId; interval: number };

/** A `Pattern` can be randomized with a particular length. */
export type RandomizePatternPayload = { id: PatternId; length: number };

// ------------------------------------------------------------
// Pattern Slice Definition
// ------------------------------------------------------------

export const patternsSlice = createSlice({
  name: "patterns",
  initialState: defaultPatternState,
  reducers: {
    /** Set the list of pattern IDs. */
    setPatternIds: (state, action: PayloadAction<PatternId[]>) => {
      const patternIds = action.payload;
      state.allIds = patternIds;
    },
    /** Add a pattern to the slice. */
    addPattern: (state, action: PayloadAction<AddPatternPayload>) => {
      const pattern = action.payload;
      state.allIds = union(state.allIds, [pattern.id]);
      state.byId[pattern.id] = pattern;
    },
    /** Remove a pattern from the slice. */
    removePattern: (state, action: PayloadAction<RemovePatternPayload>) => {
      const patternId = action.payload;
      delete state.byId[patternId];
      const index = state.allIds.findIndex((id) => id === patternId);
      if (index === -1) return;
      state.allIds.splice(index, 1);
    },
    /** Update a pattern in the slice. */
    updatePattern: (state, action: PayloadAction<UpdatePatternPayload>) => {
      const { id, ...rest } = action.payload;
      if (!id) return;
      state.byId[id] = { ...state.byId[id], ...rest };
    },
    /** Add a note to a pattern. */
    addPatternNote: (state, action: PayloadAction<AddPatternNotePayload>) => {
      const { id, note, asChord } = action.payload;
      const pattern = state.byId[id];
      if (!pattern || !isPattern(pattern)) return;

      // If the note is not a chord, add it to the end of the pattern
      if (!asChord) {
        state.byId[id].stream.push([note]);
      } else {
        // If the note is a chord, add it to the end of the last chord
        const length = pattern.stream.length;
        const lastBlock = pattern.stream[length - 1];
        if (isPatternRest(lastBlock)) {
          state.byId[id].stream.push([note]);
        } else {
          lastBlock.push(note);
        }
      }
    },
    /** Insert a note into a pattern. */
    insertPatternNote: (
      state,
      action: PayloadAction<InsertPatternNotePayload>
    ) => {
      const { id, note, index } = action.payload;
      const pattern = state.byId[id];
      if (!pattern || !isPattern(pattern)) return;

      if (index < 0 || index > pattern.stream.length) return;

      const patternChord: PatternChord = [note];
      state.byId[id].stream.splice(index + 1, 0, patternChord);
    },
    /** Update a note in a pattern. */
    updatePatternNote: (
      state,
      action: PayloadAction<UpdatePatternNotePayload>
    ) => {
      const { id, note, index, asChord } = action.payload;
      const pattern = state.byId[id];
      if (!pattern || !isPattern(pattern)) return;
      if (index < 0 || index > pattern.stream.length) return;
      if (!asChord) {
        state.byId[id].stream[index] = [note];
      } else {
        const block = pattern.stream[index];
        if (isPatternRest(block)) {
          state.byId[id].stream[index] = [note];
          return;
        } else {
          block.push(note);
        }
      }
    },
    /** Add a block to a pattern. */
    addPatternBlock: (state, action: PayloadAction<AddPatternBlockPayload>) => {
      const { id, block } = action.payload;
      const pattern = state.byId[id];
      if (!pattern) return;
      state.byId[id].stream.push(block);
    },
    /** Insert a block to a pattern. */
    insertPatternBlock: (
      state,
      action: PayloadAction<InsertPatternBlockPayload>
    ) => {
      const { id, block, index } = action.payload;
      const pattern = state.byId[id];
      if (!pattern) return;
      if (index < 0 || index > pattern.stream.length) return;
      state.byId[id].stream.splice(index, 0, block);
    },
    /** Update a block in a pattern. */
    updatePatternBlock: (
      state,
      action: PayloadAction<UpdatePatternBlockPayload>
    ) => {
      const { id, block, index } = action.payload;
      const pattern = state.byId[id];
      if (!pattern || index < 0 || index > pattern.stream.length) return;
      state.byId[id].stream[index] = block;
    },
    /** Transpose a block in a pattern chromatically if it not a rest. */
    transposePatternBlock: (
      state,
      action: PayloadAction<TransposePatternBlockPayload>
    ) => {
      const { id, index, transpose } = action.payload;
      const pattern = state.byId[id];
      if (!pattern || index < 0 || index > pattern.stream.length) return;
      const block = pattern.stream[index];
      if (!isPatternChord(block)) return;
      pattern.stream[index] = block.map((note) => {
        if (!isNestedNote(note)) {
          return { ...note, MIDI: note.MIDI + transpose };
        }
        const offset = sumScaleVectors([note.offset, { chromatic: transpose }]);
        return { ...note, offset };
      });
    },
    /** Remove a block from a pattern. */
    removePatternBlock: (
      state,
      action: PayloadAction<RemovePatternBlockPayload>
    ) => {
      const { id, index } = action.payload;
      const pattern = state.byId[id];
      if (!pattern) return;
      if (index < 0 || index > pattern.stream.length) return;
      state.byId[id].stream.splice(index, 1);
    },
    /** Transpose a pattern by a number of steps. */
    transposePattern: (
      state,
      action: PayloadAction<TransposePatternPayload>
    ) => {
      const { id, transpose } = action.payload;
      if (transpose === 0) return; // Avoid unnecessary work
      const pattern = state.byId[id];
      pattern.stream = pattern.stream.map((block) => {
        if (!isPatternChord(block)) return block;
        return block.map((note) => {
          if (isPatternMidiNote(note)) {
            return { ...note, MIDI: clamp(note.MIDI + transpose, 0, 127) };
          }
          return {
            ...note,
            offset: sumScaleVectors([note.offset, { chromatic: transpose }]),
          };
        });
      });
    },
    /** Repeat a pattern a certain number of times. */
    repeatPattern: (state, action: PayloadAction<RepeatPatternPayload>) => {
      const { id, repeat } = action.payload;
      if (repeat === 0) return; // Avoid unnecessary work
      const pattern = state.byId[id];
      if (!pattern) return;

      state.byId[id].stream = new Array(repeat + 1).fill(pattern.stream).flat();
    },
    /** Continue a pattern for a certain number of notes. */
    continuePattern: (state, action: PayloadAction<ContinuePatternPayload>) => {
      const { id, length } = action.payload;
      const pattern = state.byId[id];
      if (!pattern) return;

      state.byId[id].stream = new Array(length)
        .fill(0)
        .map((_, i) => pattern.stream[i % pattern.stream.length]);
    },
    /** Phase a pattern by a certain number of steps. */
    phasePattern: (state, action: PayloadAction<PhasePatternPayload>) => {
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
    /** Stretch a pattern by a scaling factor. */
    stretchPattern: (state, action: PayloadAction<StretchPatternPayload>) => {
      const { id, factor } = action.payload;
      const pattern = state.byId[id];
      if (!pattern) return;

      pattern.stream = pattern.stream.map((block) => {
        const duration = getPatternBlockDuration(block);
        const newDuration = clamp(
          duration * factor,
          SixtyFourthNoteTicks,
          WholeNoteTicks
        );
        if (isPatternRest(block)) return { duration: newDuration };
        return block.map((note) => ({ ...note, duration: newDuration }));
      });
    },
    /** Reverse the stream of a pattern. */
    reversePattern: (state, action: PayloadAction<ReversePatternPayload>) => {
      const patternId = action.payload;
      const pattern = state.byId[patternId];
      if (!pattern) return;

      state.byId[patternId].stream = reverse(pattern.stream);
    },
    /** Shuffle the stream of a pattern. */
    shufflePattern: (state, action: PayloadAction<ShufflePatternPayload>) => {
      const patternId = action.payload;
      const pattern = state.byId[patternId];
      if (!pattern) return;

      state.byId[patternId].stream = shuffle(pattern.stream);
    },
    /** Harmonize a pattern with a given interval. */
    harmonizePattern: (
      state,
      action: PayloadAction<HarmonizePatternPayload>
    ) => {
      const { id, interval } = action.payload;
      const pattern = state.byId[id];
      if (!pattern) return;

      const newStream: PatternStream = pattern.stream.map((block) => {
        if (isPatternRest(block)) return block;
        return [
          ...block,
          ...block.map((note) => {
            if (isNestedNote(note)) {
              return {
                ...note,
                offset: sumScaleVectors([note.offset, { chromatic: interval }]),
              };
            } else {
              return { ...note, MIDI: clamp(note.MIDI + interval, 0, 127) };
            }
          }),
        ];
      });

      pattern.stream = newStream;
    },
    /** Randomize a pattern in the store with a specific length. */
    randomizePattern: (
      state,
      action: PayloadAction<RandomizePatternPayload>
    ) => {
      const { id, length } = action.payload;
      const pattern = state.byId[id];
      if (!pattern) return;
      const noteCount = length;
      const stream: PatternStream = [];
      const restPercent = 0.1;
      for (let i = 0; i < noteCount; i++) {
        const seed = Math.random();
        if (seed < restPercent) {
          stream.push({ duration: SixteenthNoteTicks });
        } else {
          const noteCount = 1;
          const scales = PresetScaleGroupMap["Basic Scales"];
          const scale = scales[Math.floor(Math.random() * scales.length)];
          let midiNotes = resolveScaleToMidi(scale);
          const chord: PatternBlock = new Array(noteCount).fill(0).map((_) => {
            const index = random(0, midiNotes.length - 1);
            const midi = midiNotes[index];
            midiNotes = midiNotes.filter((note) => note !== midi);
            return {
              duration: SixteenthNoteTicks,
              velocity: DEFAULT_VELOCITY,
              MIDI: midi,
            };
          });
          stream.push(chord);
        }
      }
      state.byId[id].stream = stream;
    },
    /** Clear the notes of a pattern in the slice. */
    clearPattern: (state, action: PayloadAction<ClearPatternPayload>) => {
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
  updatePatternNote,
  addPatternBlock,
  insertPatternBlock,
  updatePatternBlock,
  transposePatternBlock,
  removePatternBlock,
  transposePattern,
  repeatPattern,
  continuePattern,
  stretchPattern,
  shufflePattern,
  phasePattern,
  reversePattern,
  harmonizePattern,
  randomizePattern,
  clearPattern,
} = patternsSlice.actions;

export default patternsSlice.reducer;
