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
  isPatternMidiNote,
  getPatternBlockDuration,
  PatternBlock,
  getPatternChordNotes,
  isPatternChord,
  updatePatternChordNotes,
} from "types/Pattern";
import {
  clamp,
  inRange,
  isArray,
  reverse,
  shuffle,
  union,
  uniqBy,
} from "lodash";
import { mod } from "utils/math";
import { isNestedNote, sumScaleVectors } from "types/Scale";
import {
  getDurationTicks,
  SixtyFourthNoteTicks,
  StraightDurationType,
} from "utils/durations";
import { Frequency } from "tone";

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

/** A `Pattern` can have all of its notes set to a pitch. */
export type SetPatternPitchesPayload = { id: PatternId; pitch: string };

/** A `Pattern` can have all of its notes set to a pitch. */
export type SetPatternDurationsPayload = { id: PatternId; duration: number };

/** A `Pattern` can have all of its notes set to a velocity. */
export type SetPatternVelocitiesPayload = { id: PatternId; velocity: number };

/** A `Pattern` can have its notes graduated within a range of indices. */
export type GraduatePatternVelocitiesPayload = {
  id: PatternId;
  startIndex: number;
  endIndex: number;
  startVelocity: number;
  endVelocity: number;
};

/** A `Pattern` can have its notes interpolated. */
export type InterpolatePatternPayload = {
  id: PatternId;
  fillCount: number;
};

/** A `Pattern` can have its notes flattened. */
export type FlattenPatternPayload = PatternId;

/** A `Pattern` can have its notes subdivided. */
export type SubdividePatternPayload = PatternId;

/** A `Pattern` can have its notes arpeggiated. */
export type MergePatternPayload = PatternId;

/** A `Pattern` can have its notes randomized. */
export type RandomizePatternPayload = PatternId;

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
    /** Clear the notes of a pattern in the slice. */
    clearPattern: (state, action: PayloadAction<ClearPatternPayload>) => {
      const patternId = action.payload;
      const pattern = state.byId[patternId];
      if (!pattern) return;
      state.byId[patternId].stream = [];
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
        if (isPatternChord(lastBlock)) {
          const notes = getPatternChordNotes(lastBlock);
          state.byId[id].stream[length - 1] = updatePatternChordNotes(
            lastBlock,
            [...notes, note]
          );
        } else {
          state.byId[id].stream.push([note]);
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
        if (isPatternChord(block)) {
          const notes = getPatternChordNotes(block);
          pattern.stream[index] = updatePatternChordNotes(block, [
            ...notes,
            note,
          ]);
        } else {
          pattern.stream[index] = [note];
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
    /** Transpose a block in a pattern chromatically if it is not a rest. */
    transposePatternBlock: (
      state,
      action: PayloadAction<TransposePatternBlockPayload>
    ) => {
      const { id, index, transpose } = action.payload;
      const pattern = state.byId[id];
      if (!pattern || index < 0 || index > pattern.stream.length) return;
      const block = pattern.stream[index];
      if (!isPatternChord(block)) return;
      const notes = getPatternChordNotes(block);
      pattern.stream[index] = notes.map((note) => {
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
        const notes = getPatternChordNotes(block);
        return notes.map((note) => {
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

      state.byId[id].stream = new Array(repeat).fill(pattern.stream).flat();
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
          Infinity
        );
        if (!isPatternChord(block)) return { duration: newDuration };
        const notes = getPatternChordNotes(block);
        return notes.map((note) => ({ ...note, duration: newDuration }));
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
    shufflePatternStream: (
      state,
      action: PayloadAction<ShufflePatternPayload>
    ) => {
      const patternId = action.payload;
      const pattern = state.byId[patternId];
      if (!pattern) return;
      state.byId[patternId].stream = shuffle(pattern.stream);
    },
    /** Shuffle the pitches of a pattern. */
    shufflePatternPitches: (
      state,
      action: PayloadAction<ShufflePatternPayload>
    ) => {
      const patternId = action.payload;
      const pattern = state.byId[patternId];
      if (!pattern) return;

      // Get all notes in the pattern
      const notes = pattern.stream
        .filter(isPatternChord)
        .map(getPatternChordNotes)
        .flat();
      const shuffledNotes = shuffle(notes);
      const shuffledStream = [];

      // Iterate over the pattern
      for (const block of pattern.stream) {
        // Push the rests as is
        if (!isPatternChord(block)) {
          shuffledStream.push(block);
          continue;
        }

        // Sample the notes by popping them off the array
        const notes = getPatternChordNotes(block);
        const sampledNotes = notes
          .map((note) => {
            const shuffledNote = shuffledNotes.pop();
            if (!shuffledNote) return undefined;
            return {
              ...shuffledNote,
              duration: note.duration,
              velocity: note.velocity,
            };
          })
          .filter(Boolean) as PatternNote[];

        // Return the updated chord
        const updatedChord = updatePatternChordNotes(block, sampledNotes);
        shuffledStream.push(updatedChord);
      }

      state.byId[patternId].stream = shuffledStream;
    },

    /** Subdivide the stream of a pattern. */
    subdividePattern: (
      state,
      action: PayloadAction<SubdividePatternPayload>
    ) => {
      const id = action.payload;
      const pattern = state.byId[id];
      if (!pattern) return;

      const newStream = [];
      for (const block of pattern.stream) {
        if (!isPatternChord(block)) {
          newStream.push(block);
          continue;
        }

        const notes = getPatternChordNotes(block);
        const newChord = notes.map((note) => {
          const duration = note.duration / 2;
          return { ...note, duration };
        });

        newStream.push(newChord);
        newStream.push(newChord);
      }

      state.byId[id].stream = newStream;
    },
    /** Merge the stream of a pattern. */
    mergePattern: (state, action: PayloadAction<MergePatternPayload>) => {
      const id = action.payload;
      const pattern = state.byId[id];
      if (!pattern) return;

      const allNotes = pattern.stream
        .filter(isPatternChord)
        .map(getPatternChordNotes)
        .flat();
      const uniqueNotes = uniqBy(allNotes, (note) =>
        isNestedNote(note) ? note.degree : note.MIDI
      );

      const newChord = new Array(uniqueNotes.length).fill(0).map((_, i) => {
        return uniqueNotes[i];
      });

      state.byId[id].stream = [newChord];
    },
    /** Interpolate the stream of a pattern. */
    flattenPattern: (state, action: PayloadAction<FlattenPatternPayload>) => {
      const patternId = action.payload;
      const pattern = state.byId[patternId];
      if (!pattern) return;

      state.byId[patternId].stream = pattern.stream.flatMap((block) => {
        if (!isPatternChord(block)) return block;
        const notes = getPatternChordNotes(block);
        return notes;
      });
    },
    /** Flatten the stream of a pattern. */
    interpolatePattern: (
      state,
      action: PayloadAction<InterpolatePatternPayload>
    ) => {
      const { id, fillCount } = action.payload;
      if (fillCount < 1) return;
      const pattern = state.byId[id];
      if (!pattern) return;
      const streamLength = pattern.stream.length;

      const newStream = [];
      for (let i = 0; i < streamLength; i++) {
        const block = pattern.stream[i];

        if (!isPatternChord(block)) {
          newStream.push(block);
          continue;
        }

        newStream.push(block);
        if (i === streamLength - 1) continue;

        const nextBlock = pattern.stream[i + 1];
        if (!isPatternChord(nextBlock)) continue;

        const blockNotes = getPatternChordNotes(block);
        const blockRoot = blockNotes.find(isPatternMidiNote);
        const blockDuration = getPatternBlockDuration(block);
        const blockVelocity = blockNotes[0].velocity;

        const nextBlockNotes = getPatternChordNotes(nextBlock);
        const nextBlockRoot = nextBlockNotes.find(isPatternMidiNote);
        const nextBlockVelocity = nextBlockNotes[0].velocity;

        if (!blockRoot || !nextBlockRoot) continue;

        const rootDistance = nextBlockRoot.MIDI - blockRoot.MIDI;
        const velocityDistance = nextBlockVelocity - blockVelocity;

        const rootStepSize = rootDistance / (fillCount + 1);
        const velocityStepSize = velocityDistance / fillCount;

        const interpolatedChords = new Array(fillCount).fill(0).map((_, i) => {
          const newRoot = blockRoot.MIDI + Math.round(rootStepSize * (i + 1));
          const newVelocity = blockVelocity + Math.round(velocityStepSize * i);
          return {
            duration: blockDuration,
            velocity: newVelocity,
            MIDI: newRoot,
          };
        });

        newStream.push(...interpolatedChords);
      }

      state.byId[id].stream = newStream;
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
        if (!isPatternChord(block)) return block;
        const notes = getPatternChordNotes(block);
        return [
          ...notes,
          ...notes.map((note) => {
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

    /** Set the pitches of the stream of a pattern. */
    setPatternPitches: (
      state,
      action: PayloadAction<SetPatternPitchesPayload>
    ) => {
      const { id, pitch } = action.payload;
      const pattern = state.byId[id];
      if (!pattern) return;

      const MIDI = Frequency(pitch).toMidi();

      state.byId[id].stream = pattern.stream.map((block) => {
        if (!isPatternChord(block)) return block;
        const notes = getPatternChordNotes(block);
        const updatedNotes = notes.map((note) => ({ ...note, MIDI }));
        return updatePatternChordNotes(block, updatedNotes);
      });
    },

    /** Set the durations of the stream of a pattern. */
    setPatternDurations: (
      state,
      action: PayloadAction<SetPatternDurationsPayload>
    ) => {
      const { id, duration } = action.payload;
      const pattern = state.byId[id];
      if (!pattern) return;

      state.byId[id].stream = pattern.stream.map((block) => {
        if (!isPatternChord(block)) return block;
        const notes = getPatternChordNotes(block);
        const updatedNotes = notes.map((note) => ({ ...note, duration }));
        return updatePatternChordNotes(block, updatedNotes);
      });
    },

    /** Set the velocities of the stream of a pattern. */
    setPatternVelocities: (
      state,
      action: PayloadAction<SetPatternVelocitiesPayload>
    ) => {
      const { id, velocity } = action.payload;
      const pattern = state.byId[id];
      if (!pattern) return;

      state.byId[id].stream = pattern.stream.map((block) => {
        if (!isPatternChord(block)) return block;
        const notes = getPatternChordNotes(block);
        const updatedNotes = notes.map((note) => ({ ...note, velocity }));
        return updatePatternChordNotes(block, updatedNotes);
      });
    },

    /** Graduate the velocities of the stream of a pattern. */
    graduatePatternVelocities: (
      state,
      action: PayloadAction<GraduatePatternVelocitiesPayload>
    ) => {
      const { id, startIndex, endIndex, startVelocity, endVelocity } =
        action.payload;
      const pattern = state.byId[id];
      if (!pattern) return;

      const velocityRange = endVelocity - startVelocity;
      const stepCount = endIndex - startIndex + 1;
      const stepSize = velocityRange / Math.max(stepCount - 1, 1);

      state.byId[id].stream = pattern.stream.map((block, i) => {
        if (!inRange(i, startIndex, endIndex + 1)) return block;
        if (!isPatternChord(block)) return block;
        const offset = i - startIndex;
        const velocity = startVelocity + Math.round(offset * stepSize);
        const notes = getPatternChordNotes(block);
        const updatedNotes = notes.map((note) => ({ ...note, velocity }));
        return updatePatternChordNotes(block, updatedNotes);
      });
    },

    /** Shuffle the velocities of a pattern. */
    shufflePatternVelocities: (
      state,
      action: PayloadAction<ShufflePatternPayload>
    ) => {
      const patternId = action.payload;
      const pattern = state.byId[patternId];
      if (!pattern) return;

      // Get all notes in the pattern
      const notes = pattern.stream
        .filter(isPatternChord)
        .map(getPatternChordNotes)
        .flat();
      const shuffledNotes = shuffle(notes);
      const shuffledStream = [];

      // Iterate over the pattern
      for (const block of pattern.stream) {
        // Push the rests as is
        if (!isPatternChord(block)) {
          shuffledStream.push(block);
          continue;
        }

        // Sample the notes by popping them off the array
        const notes = getPatternChordNotes(block);
        const sampledNotes = notes
          .map((note) => {
            const shuffledNote = shuffledNotes.pop();
            if (!shuffledNote) return undefined;
            return { ...note, velocity: shuffledNote.velocity };
          })
          .filter(Boolean) as PatternNote[];

        // Return the updated chord
        const updatedChord = updatePatternChordNotes(block, sampledNotes);
        shuffledStream.push(updatedChord);
      }

      state.byId[patternId].stream = shuffledStream;
    },

    /** Randomize the velocities of each note */
    randomizePatternVelocities: (state, action: PayloadAction<PatternId>) => {
      const patternId = action.payload;
      const pattern = state.byId[patternId];
      if (!pattern) return;

      // Iterate over the pattern
      const newStream = pattern.stream.map((block) => {
        if (!isPatternChord(block)) return block;

        // Create a new chord with random velocities
        const notes = getPatternChordNotes(block);
        const updatedNotes = notes.map((note) => ({
          ...note,
          velocity: Math.round(Math.random() * 127),
        }));

        const updatedChord = updatePatternChordNotes(block, updatedNotes);
        return updatedChord;
      });

      state.byId[patternId].stream = newStream;
    },

    /** Randomize the durations of each note */
    randomizePatternDurations: (state, action: PayloadAction<PatternId>) => {
      const patternId = action.payload;
      const pattern = state.byId[patternId];
      if (!pattern) return;

      // Create a seeded duration record
      const durationSeeds: Record<StraightDurationType, number> = {
        "64th": 0.025,
        "32nd": 0.1,
        "16th": 0.2,
        eighth: 0.3,
        quarter: 0.2,
        half: 0.1,
        whole: 0.025,
      };

      const sampleDuration = () => {
        let sum = 0;
        let r = Math.random();
        for (const duration in durationSeeds) {
          const type = duration as StraightDurationType;
          sum += durationSeeds[type];
          if (r <= sum) return getDurationTicks(type);
        }
      };

      // Iterate over the pattern
      const newStream = pattern.stream.map((block) => {
        if (!isPatternChord(block)) return block;

        // Create a new chord with random velocities
        const notes = getPatternChordNotes(block);
        const sampledDuration = sampleDuration();

        const updatedNotes = notes.map((note) => {
          return {
            ...note,
            duration: sampledDuration ?? note.duration,
          };
        });

        const updatedChord = updatePatternChordNotes(block, updatedNotes);
        return updatedChord;
      });

      state.byId[patternId].stream = newStream;
    },
  },
});

export const {
  setPatternIds,
  addPattern,
  removePattern,
  updatePattern,
  clearPattern,

  addPatternNote,
  insertPatternNote,
  updatePatternNote,

  addPatternBlock,
  insertPatternBlock,
  updatePatternBlock,
  removePatternBlock,

  setPatternDurations,
  repeatPattern,
  continuePattern,
  stretchPattern,

  subdividePattern,
  mergePattern,
  flattenPattern,
  interpolatePattern,

  phasePattern,
  reversePattern,
  shufflePatternStream,

  setPatternPitches,
  transposePattern,
  transposePatternBlock,
  harmonizePattern,
  shufflePatternPitches,

  setPatternVelocities,
  graduatePatternVelocities,
  shufflePatternVelocities,

  randomizePatternVelocities,
  randomizePatternDurations,
} = patternsSlice.actions;

export default patternsSlice.reducer;
