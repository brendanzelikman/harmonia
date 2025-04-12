import { createEntityAdapter, PayloadAction } from "@reduxjs/toolkit";
import { isNestedNote, ScaleId } from "types/Scale/ScaleTypes";
import {
  getPatternBlockWithNewNotes,
  getPatternChordNotes,
} from "./PatternUtils";
import { getPatternChordWithNewNotes } from "./PatternUtils";
import {
  PatternId,
  PatternNote,
  PatternBlock,
  isPatternChord,
  PatternChord,
  Pattern,
} from "./PatternTypes";
import { sumVectors } from "utils/vector";
import { Action, createNormalSlice, unpackAction } from "types/redux";
import { mod } from "utils/math";

// ------------------------------------------------------------
// Pattern Payload Types
// ------------------------------------------------------------

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
  scaleId?: ScaleId;
};

/** A `PatternBlock` can be removed by index. */
export type RemovePatternBlockPayload = { id: PatternId; index: number };

export const patternAdapter = createEntityAdapter<Pattern>();
export const defaultPatternState = patternAdapter.getInitialState();

export const patternsSlice = createNormalSlice({
  name: "patterns",
  adapter: patternAdapter,
  reducers: {
    /** Add a note to a pattern. */
    addPatternNote: (state, action: Action<AddPatternNotePayload>) => {
      const { id, note, asChord } = unpackAction(action);
      const pattern = state.entities[id];
      if (pattern === undefined) return;

      // If the note is not a chord, add it to the end of the pattern
      if (!asChord) {
        pattern.stream.push([note]);
      } else {
        // If the note is a chord, add it to the end of the last chord
        const length = pattern.stream.length;
        const lastBlock = pattern.stream[length - 1];
        if (isPatternChord(lastBlock)) {
          const notes = getPatternChordNotes(lastBlock);
          pattern.stream[length - 1] = getPatternChordWithNewNotes(lastBlock, [
            ...notes,
            note,
          ]);
        } else {
          pattern.stream.push([note]);
        }
      }
    },
    /** Insert a note into a pattern. */
    insertPatternNote: (state, action: Action<InsertPatternNotePayload>) => {
      const { id, note, index } = unpackAction(action);
      const pattern = state.entities[id];
      if (!pattern) return;
      if (index < 0 || index > pattern.stream.length) return;

      const patternChord: PatternChord = [note];
      pattern.stream.splice(index + 1, 0, patternChord);
    },
    /** Update a note in a pattern. */
    updatePatternNote: (state, action: Action<UpdatePatternNotePayload>) => {
      const { id, note, index, asChord } = unpackAction(action);
      const pattern = state.entities[id];
      if (!pattern) return;
      if (index < 0 || index > pattern.stream.length) return;
      if (!asChord) {
        pattern.stream[index] = note;
      } else {
        const block = pattern.stream[index];
        if (isPatternChord(block)) {
          const notes = getPatternChordNotes(block);
          pattern.stream[index] = getPatternChordWithNewNotes(block, [
            ...notes,
            note,
          ]);
        } else {
          pattern.stream[index] = note;
        }
      }
    },
    /** Add a block to a pattern. */
    addPatternBlock: (state, action: Action<AddPatternBlockPayload>) => {
      const { id, block } = unpackAction(action);
      const pattern = state.entities[id];
      if (!pattern) return;
      pattern.stream.push(block);
    },
    /** Insert a block to a pattern. */
    insertPatternBlock: (state, action: Action<InsertPatternBlockPayload>) => {
      const { id, block, index } = unpackAction(action);
      const pattern = state.entities[id];
      if (!pattern) return;
      if (index < 0 || index > pattern.stream.length) return;
      pattern.stream.splice(index, 0, block);
    },
    /** Update a block in a pattern. */
    updatePatternBlock: (state, action: Action<UpdatePatternBlockPayload>) => {
      const { id, block, index } = unpackAction(action);
      const pattern = state.entities[id];
      if (!pattern || index < 0 || index > pattern.stream.length) return;
      pattern.stream[index] = block;
    },
    /** Update the duration of a block in a pattern. */
    updatePatternBlockDuration: (
      state,
      action: Action<{ id: PatternId; index: number; duration: number }>
    ) => {
      const { id, index, duration } = unpackAction(action);
      const pattern = state.entities[id];
      if (!pattern || index < 0 || index > pattern.stream.length) return;
      pattern.stream[index] = getPatternBlockWithNewNotes(
        pattern.stream[index],
        (notes) => notes.map((note) => ({ ...note, duration })),
        (rest) => ({ ...rest, duration })
      );
    },
    /** Transpose a block in a pattern chromatically if it is not a rest. */
    transposePatternBlock: (
      state,
      action: PayloadAction<TransposePatternBlockPayload>
    ) => {
      const { id, index, transpose, scaleId } = action.payload;
      const pattern = state.entities[id];
      if (!pattern || index < 0 || index > pattern.stream.length) return;
      const block = pattern.stream[index];
      if (!isPatternChord(block)) return;
      const notes = getPatternChordNotes(block);
      pattern.stream[index] = notes.map((note) => {
        if (!isNestedNote(note)) {
          return { ...note, MIDI: note.MIDI + transpose };
        }
        const offset = sumVectors(note.offset, {
          [scaleId ?? "chromatic"]: transpose,
        });
        return { ...note, offset };
      });
    },
    /** Remove a block from a pattern. */
    removePatternBlock: (state, action: Action<RemovePatternBlockPayload>) => {
      const { id, index } = unpackAction(action);
      const pattern = state.entities[id];
      if (!pattern) return;
      let spliceIndex = index;
      if (index > pattern.stream.length - 1) {
        spliceIndex = mod(index, pattern.stream.length);
        spliceIndex = Math.min(spliceIndex, pattern.stream.length - 1);
      } else if (index < 0 && index > -pattern.stream.length) {
        spliceIndex = pattern.stream.length + index;
      }
      pattern.stream.splice(spliceIndex, 1);
    },
  },
});

export const {
  addOne: addPattern,
  addMany: addPatterns,
  setOne: setPattern,
  setMany: setPatterns,
  setAll: setAllPatterns,
  setIds: setPatternIds,
  removeOne: removePattern,
  removeMany: removePatterns,
  removeAll: removeAllPatterns,
  updateOne: updatePattern,
  updateMany: updatePatterns,
  upsertOne: upsertPattern,
  upsertMany: upsertPatterns,
  addPatternNote,
  insertPatternNote,
  updatePatternNote,
  addPatternBlock,
  insertPatternBlock,
  updatePatternBlock,
  updatePatternBlockDuration,
  removePatternBlock,
  transposePatternBlock,
} = patternsSlice.actions;

export default patternsSlice.reducer;
