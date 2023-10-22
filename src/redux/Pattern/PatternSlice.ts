import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  defaultPattern,
  Pattern,
  PatternChord,
  PatternId,
  PatternNote,
  PatternStream,
  isPattern,
  rotatePatternStream,
} from "types/Pattern";
import { MIDI } from "types/midi";
import { clamp, random, reverse, shuffle, union } from "lodash";
import { mod } from "utils";
import { PresetScaleGroupMap } from "presets/scales";
import { initializeState } from "types/util";

export const defaultPatternState = initializeState<PatternId, Pattern>([
  defaultPattern,
]);

/**
 * A `Pattern` can be added to the store.
 */
export type AddPatternPayload = Pattern;

/**
 * A `Pattern` can be removed from the store by ID.
 */
export type RemovePatternPayload = PatternId;

/**
 * A `Pattern` can be updated in the store.
 */
export type UpdatePatternPayload = Partial<Pattern>;

/**
 * A `PatternNote` can be added to a `Pattern` in the store.
 * @property `id` - The ID of the `Pattern`.
 * @property `patternNote` - The `PatternNote` to add.
 * @property `asChord` - Optional. If true, add the `PatternNote` to the end of the last `PatternChord`.
 */
export type AddPatternNotePayload = {
  id: PatternId;
  patternNote: PatternNote;
  asChord?: boolean;
};

/**
 * A `PatternNote` can be updated by index.
 * @property `id` - The ID of the `Pattern`.
 * @property `index` - The index of the `PatternNote` to update.
 * @property `patternNote` - The `PatternNote` to update.
 *
 */
export interface UpdatePatternNotePayload extends AddPatternNotePayload {
  index: number;
}

/**
 * A `PatternChord` can be added to a `Pattern` in the store.
 * @property `id` - The ID of the `Pattern`.
 * @property `patternChord` - The `PatternChord` to add.
 */
export type AddPatternChordPayload = {
  id: PatternId;
  patternChord: PatternChord;
};

/**
 * A `PatternChord` can be updated by index.
 * @property `id` - The ID of the `Pattern`.
 * @property `index` - The index of the `PatternChord` to update.
 * @property `patternChord` - The `PatternChord` to update.
 */
export interface UpdatePatternChordPayload extends AddPatternChordPayload {
  index: number;
}

/**
 * A `PatternNote` can be inserted at a specific index.
 */
export type InsertPatternNotePayload = UpdatePatternNotePayload;

/**
 * A `PatternNote` can be removed by index.
 */
export type RemovePatternNotePayload = { id: PatternId; index: number };

/**
 * A `Pattern` can be cleared of all notes.
 */
export type ClearPatternPayload = PatternId;

/**
 * A `Pattern` can be transposed by a number of semitones.
 */
export type TransposePatternPayload = { id: PatternId; transpose: number };

/**
 * A `Pattern` can be rotated by a number of semitones.
 */
export type RotatePatternPayload = { id: PatternId; transpose: number };

/**
 * A `Pattern` can be repeated a number of times.
 */
export type RepeatPatternPayload = { id: PatternId; repeat: number };

/**
 * A `Pattern` can be continued for a particular length.
 */
export type ContinuePatternPayload = { id: PatternId; length: number };

/**
 * A `Pattern` can be phased by a number of steps.
 */
export type PhasePatternPayload = { id: PatternId; phase: number };

/**
 * A `Pattern` can be diminished by a factor of 2.
 */
export type DiminishPatternPayload = PatternId;

/**
 * A `Pattern` can be augmented by a factor of 2.
 */
export type AugmentPatternPayload = PatternId;

/**
 * A `Pattern` can be reversed.
 */
export type ReversePatternPayload = PatternId;

/**
 * A `Pattern` can be shuffled.
 */
export type ShufflePatternPayload = PatternId;

/**
 * A `Pattern` can be harmonized with a particular interval.
 */
export type HarmonizePatternPayload = { id: PatternId; interval: number };

/**
 * A `Pattern` can be randomized with a particular length.
 */
export type RandomizePatternPayload = { id: PatternId; length: number };

/**
 * The `patternsSlice` contains all of the `Patterns` in the store.
 *
 * @property `setPatternIds` - Set the IDs of the `Patterns` in the store (used for dragging)
 * @property `addPattern` - Add a `Pattern` to the store.
 * @property `removePattern` - Remove a `Pattern` from the store.
 * @property `updatePattern` - Update a `Pattern` in the store.
 * @property `addPatternNote` - Add a `PatternNote` to a `Pattern` in the store.
 * @property `addPatternChord` - Add a `PatternChord` to a `Pattern` in the store.
 * @property `updatePatternNote` - Update a `PatternNote` in a `Pattern` in the store.
 * @property `updatePatternChord` - Update a `PatternChord` in a `Pattern` in the store.
 * @property `insertPatternNote` - Insert a `PatternNote` in a `Pattern` in the store.
 * @property `removePatternNote` - Remove a `PatternNote` from a `Pattern` in the store.
 * @property `transposePattern` - Transpose a `Pattern` in the store by a number of semitones.
 * @property `rotatePattern` - Rotate a `Pattern` in the store by a number of steps.
 * @property `invertPattern` - Invert a `Pattern` in the store.
 * @property `repeatPattern` - Repeat a `Pattern` in the store a number of times.
 * @property `continuePattern` - Continue a `Pattern` in the store for a particular length.
 * @property `augmentPattern` - Augment a `Pattern` in the store by a factor of 2.
 * @property `diminishPattern` - Diminish a `Pattern` in the store by a factor of 2.
 * @property `shufflePattern` - Shuffle a `Pattern` in the store.
 * @property `phasePattern` - Phase a `Pattern` in the store by a number of steps.
 * @property `reversePattern` - Reverse a `Pattern` in the store.
 * @property `harmonizePattern` - Harmonize a `Pattern` in the store with a particular interval.
 * @property `randomizePattern` - Randomize a `Pattern` in the store with a particular length.
 * @property `clearPattern` - Clear a `Pattern` in the store.
 *
 */
export const patternsSlice = createSlice({
  name: "patterns",
  initialState: defaultPatternState,
  reducers: {
    /**
     * Set the IDs of the `Patterns` in the store (used for dragging).
     * @param project The patterns state.
     * @param action The payload action containing the pattern IDs to set.
     */
    setPatternIds: (state, action: PayloadAction<PatternId[]>) => {
      const patternIds = action.payload;
      state.allIds = patternIds;
    },
    /**
     * Add a `Pattern` to the store.
     * @param project The patterns state.
     * @param action The payload action containing the patterns to add.
     */
    addPattern: (state, action: PayloadAction<AddPatternPayload>) => {
      const pattern = action.payload;
      state.allIds = union(state.allIds, [pattern.id]);
      state.byId[pattern.id] = pattern;
    },
    /**
     * Remove a `Pattern` from the store.
     * @param project The patterns state.
     * @param action The payload action containing the pattern IDs to remove.
     */
    removePattern: (state, action: PayloadAction<RemovePatternPayload>) => {
      const patternId = action.payload;
      delete state.byId[patternId];
      const index = state.allIds.findIndex((id) => id === patternId);
      if (index === -1) return;
      state.allIds.splice(index, 1);
    },
    /**
     * Update a `Pattern` in the store.
     * @param project The patterns state.
     * @param action The payload action containing the patterns to update.
     */
    updatePattern: (state, action: PayloadAction<UpdatePatternPayload>) => {
      const { id, ...rest } = action.payload;
      if (!id) return;
      state.byId[id] = { ...state.byId[id], ...rest };
    },
    /**
     * Add a `PatternNote` to a `Pattern` in the store.
     * @param project The patterns state.
     * @param action The payload action containing the `PatternNote` to add.
     */
    addPatternNote: (state, action: PayloadAction<AddPatternNotePayload>) => {
      const { id, patternNote, asChord } = action.payload;
      const pattern = state.byId[id];
      if (!pattern || !isPattern(pattern)) return;

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
    /**
     * Add a `PatternChord` to a `Pattern` in the store.
     * @param project The patterns state.
     * @param action The payload action containing the `PatternChord` to add.
     */
    addPatternChord: (state, action: PayloadAction<AddPatternChordPayload>) => {
      const { id, patternChord } = action.payload;
      const pattern = state.byId[id];
      if (!pattern || !isPattern(pattern)) return;

      // If the pattern is empty, add the chord as the first chord
      if (pattern.stream.length === 0) {
        state.byId[id].stream = [patternChord];
        return;
      }

      // If the chord is not a chord, add it to the end of the pattern
      state.byId[id].stream.push(patternChord);
    },
    /**
     * Update a `PatternNote` in a `Pattern` in the store.
     * @param project The patterns state.
     * @param action The payload action containing the `PatternNote` to update.
     */
    updatePatternNote: (
      state,
      action: PayloadAction<UpdatePatternNotePayload>
    ) => {
      const { id, patternNote, index, asChord } = action.payload;
      const pattern = state.byId[id];
      if (!pattern || !isPattern(pattern)) return;

      if (index < 0 || index > pattern.stream.length) return;

      if (MIDI.isRest(patternNote) || !asChord) {
        state.byId[id].stream[index] = [patternNote];
      } else {
        state.byId[id].stream[index].push(patternNote);
      }
    },
    /**
     * Update a `PatternChord` in a `Pattern` in the store.
     * @param project The patterns state.
     * @param action The payload action containing the `PatternChord` to update.
     */
    updatePatternChord: (
      state,
      action: PayloadAction<UpdatePatternChordPayload>
    ) => {
      const { id, patternChord, index } = action.payload;
      const pattern = state.byId[id];
      if (!pattern || !isPattern(pattern)) return;

      if (index < 0 || index > pattern.stream.length) return;
      state.byId[id].stream[index] = patternChord;
    },
    /**
     * Insert a `PatternNote` in a `Pattern` in the store.
     * @param project The patterns state.
     * @param action The payload action containing the `PatternNote` to insert.
     */
    insertPatternNote: (
      state,
      action: PayloadAction<InsertPatternNotePayload>
    ) => {
      const { id, patternNote, index } = action.payload;
      const pattern = state.byId[id];
      if (!pattern || !isPattern(pattern)) return;

      if (index < 0 || index > pattern.stream.length) return;

      const patternChord: PatternChord = [patternNote];
      state.byId[id].stream.splice(index + 1, 0, patternChord);
    },
    /**
     * Remove a `PatternNote` from a `Pattern` in the store.
     * @param project The patterns state.
     * @param action The payload action containing the `PatternNote` to remove.
     */
    removePatternNote: (
      state,
      action: PayloadAction<RemovePatternNotePayload>
    ) => {
      const { id, index } = action.payload;
      const pattern = state.byId[id];
      if (!pattern || !isPattern(pattern)) return;
      if (index < 0 || index > pattern.stream.length) return;
      state.byId[id].stream.splice(index, 1);
    },
    /**
     * Transpose a `Pattern` in the store by a number of semitones.
     * @param project The patterns state.
     * @param action The payload action containing the `Pattern` ID and transpose value.
     */
    transposePattern: (
      state,
      action: PayloadAction<TransposePatternPayload>
    ) => {
      const { id, transpose } = action.payload;
      if (transpose === 0) return; // Avoid unnecessary work
      const pattern = state.byId[id];
      if (!pattern || !isPattern(pattern)) return;

      pattern.stream = pattern.stream.map((chord) => {
        if (MIDI.isRest(chord)) return chord;
        return chord.map((note) => ({ ...note, MIDI: note.MIDI + transpose }));
      });
    },
    /**
     * Rotate a `Pattern` in the store by a number of steps.
     * @param project The patterns state.
     * @param action The payload action containing the `Pattern` ID and rotate value.
     */
    rotatePattern: (state, action: PayloadAction<TransposePatternPayload>) => {
      const { id, transpose } = action.payload;
      if (transpose === 0) return; // Avoid unnecessary work
      const pattern = state.byId[id];
      if (!pattern) return;

      pattern.stream = rotatePatternStream(pattern.stream, transpose);
    },
    /**
     * Invert a `Pattern` in the store.
     * @param project The patterns state.
     * @param action The payload action containing the `Pattern` ID.
     */
    invertPattern: (state, action: PayloadAction<PatternId>) => {
      const patternId = action.payload;
      const pattern = state.byId[patternId];
      if (!pattern) return;

      const baseChord = pattern.stream.find(
        (chord) => chord.length > 0 && MIDI.isNotRest(chord)
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
    /**
     * Repeat a `Pattern` in the store a number of times.
     * @param project The patterns state.
     * @param action The payload action containing the `Pattern` ID and repeat value.
     */
    repeatPattern: (state, action: PayloadAction<RepeatPatternPayload>) => {
      const { id, repeat } = action.payload;
      if (repeat === 0) return; // Avoid unnecessary work
      const pattern = state.byId[id];
      if (!pattern) return;

      state.byId[id].stream = new Array(repeat + 1).fill(pattern.stream).flat();
    },
    /**
     * Continue a `Pattern` in the store for a particular length.
     * @param project The patterns state.
     * @param action The payload action containing the `Pattern` ID and length value.
     */
    continuePattern: (state, action: PayloadAction<ContinuePatternPayload>) => {
      const { id, length } = action.payload;
      const pattern = state.byId[id];
      if (!pattern) return;

      state.byId[id].stream = new Array(length)
        .fill(0)
        .map((_, i) => pattern.stream[i % pattern.stream.length]);
    },
    /**
     * Phase a `Pattern` in the store by a number of steps.
     * @param project The patterns state.
     * @param action The payload action containing the `Pattern` ID and phase value.
     */
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
    /**
     * Augment a `Pattern` in the store by a factor of 2.
     * @param project The patterns state.
     * @param action The payload action containing the `Pattern` ID.
     */
    augmentPattern: (state, action: PayloadAction<AugmentPatternPayload>) => {
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
    /**
     * Diminish a `Pattern` in the store by a factor of 2.
     * @param project The patterns state.
     * @param action The payload action containing the `Pattern` ID.
     */
    diminishPattern: (state, action: PayloadAction<DiminishPatternPayload>) => {
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
    /**
     * Reverse a `Pattern` in the store.
     * @param project The patterns state.
     * @param action The payload action containing the `Pattern` ID.
     */
    reversePattern: (state, action: PayloadAction<ReversePatternPayload>) => {
      const patternId = action.payload;
      const pattern = state.byId[patternId];
      if (!pattern) return;

      state.byId[patternId].stream = reverse(pattern.stream);
    },
    /**
     * Shuffle a `Pattern` in the store.
     * @param project The patterns state.
     * @param action The payload action containing the `Pattern` ID.
     */
    shufflePattern: (state, action: PayloadAction<ShufflePatternPayload>) => {
      const patternId = action.payload;
      const pattern = state.byId[patternId];
      if (!pattern) return;

      state.byId[patternId].stream = shuffle(pattern.stream);
    },
    /**
     * Harmonize a `Pattern` in the store with a particular interval.
     * @param project The patterns state.
     * @param action The payload action containing the `Pattern` ID and interval value.
     */
    harmonizePattern: (
      state,
      action: PayloadAction<HarmonizePatternPayload>
    ) => {
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
    /**
     * Randomize a `Pattern` in the store with a particular length.
     * @param project The patterns state.
     * @param action The payload action containing the `Pattern` ID and length value.
     */
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
    /**
     * Clear a `Pattern` in the store.
     * @param project The patterns state.
     * @param action The payload action containing the `Pattern` ID.
     */
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
  addPatternChord,
  insertPatternNote,
  removePatternNote,
  updatePatternNote,
  updatePatternChord,
  transposePattern,
  rotatePattern,
  invertPattern,
  repeatPattern,
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

export default patternsSlice.reducer;
