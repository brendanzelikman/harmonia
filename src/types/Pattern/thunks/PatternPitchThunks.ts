import { clamp, shuffle } from "lodash";
import { Thunk } from "types/Project/ProjectTypes";
import { sumVectors } from "utils/objects";
import { selectPatternById } from "../PatternSelectors";
import { updatePattern } from "../PatternSlice";
import {
  isPatternChord,
  isPatternMidiNote,
  PatternId,
  PatternNote,
} from "../PatternTypes";
import {
  getPatternChordNotes,
  getPatternChordWithNewNotes,
} from "../PatternUtils";
import { Payload } from "lib/redux";
import { isNestedNote } from "types/Scale/ScaleTypes";
import { Frequency } from "tone";

/** Transpose a pattern by a number of steps. */
export const transposePattern =
  ({
    data,
  }: Payload<{
    id: PatternId;
    transpose: number;
  }>): Thunk =>
  (dispatch, getProject) => {
    const { id, transpose } = data;
    const project = getProject();
    const pattern = selectPatternById(project, id);
    if (!pattern) return;

    const stream = pattern.stream.map((block) => {
      if (!isPatternChord(block)) return block;
      const notes = getPatternChordNotes(block);
      return notes.map((note) => {
        if (isPatternMidiNote(note)) {
          return { ...note, MIDI: clamp(note.MIDI + transpose, 0, 127) };
        }
        return {
          ...note,
          offset: sumVectors(note.offset, { chromatic: transpose }),
        };
      });
    });

    dispatch(updatePattern({ data: { id, stream } }));
  };

/** Harmonize a pattern with a given interval. */
export const harmonizePattern =
  ({ data }: Payload<{ id: PatternId; interval: number }>): Thunk =>
  (dispatch, getProject) => {
    const { id, interval } = data;
    const project = getProject();
    const pattern = selectPatternById(project, id);
    if (!pattern) return;

    const stream = pattern.stream.map((block) => {
      if (!isPatternChord(block)) return block;
      const notes = getPatternChordNotes(block);
      return [
        ...notes,
        ...notes.map((note) => {
          if (isNestedNote(note)) {
            return {
              ...note,
              offset: sumVectors(note.offset, { chromatic: interval }),
            };
          } else {
            return { ...note, MIDI: clamp(note.MIDI + interval, 0, 127) };
          }
        }),
      ];
    });

    dispatch(updatePattern({ data: { id, stream } }));
  };

/** Shuffle the pitches of a pattern. */
export const shufflePatternPitches =
  ({ data }: Payload<{ id: PatternId }>): Thunk =>
  (dispatch, getProject) => {
    const { id } = data;
    const project = getProject();
    const pattern = selectPatternById(project, id);
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
      const updatedChord = getPatternChordWithNewNotes(block, sampledNotes);
      shuffledStream.push(updatedChord);
    }

    dispatch(updatePattern({ data: { id, stream: shuffledStream } }));
  };

/** Set the pitches of the stream of a pattern. */
export const setPatternPitches =
  ({ data }: Payload<{ id: PatternId; pitch: string }>): Thunk =>
  (dispatch, getProject) => {
    const { id, pitch } = data;
    const project = getProject();
    const pattern = selectPatternById(project, id);
    if (!pattern) return;

    const MIDI = Frequency(pitch).toMidi();
    if (isNaN(MIDI)) return;

    const stream = pattern.stream.map((block) => {
      if (!isPatternChord(block)) return block;
      return getPatternChordWithNewNotes(block, (notes) =>
        notes.map((note) => ({ ...note, MIDI }))
      );
    });

    dispatch(updatePattern({ data: { id, stream } }));
  };
