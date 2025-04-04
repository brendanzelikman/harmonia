import { mod } from "utils/math";
import { getScaleNotes } from "./ScaleFunctions";
import { getMidiNoteValue } from "utils/midi";
import {
  isMidiObject,
  ScaleNote,
  Scale,
  ScaleArray,
  ScaleVectorId,
  isMidiNote,
  isNestedNote,
} from "./ScaleTypes";
import { MidiNote } from "utils/midi";
import { sumVectors } from "utils/vector";
import { isArray, isNumber } from "lodash";

// ------------------------------------------------------------
// Get Transformed Scale Notes
// ------------------------------------------------------------

/* Sum a `MidiNote` with a number or array of numbers */
export const getTransposedMidiNote = (
  note: MidiNote,
  ...offsets: (number | undefined)[]
): MidiNote => {
  if (!offsets.length) return note;
  const sum = offsets
    .filter((n) => n !== undefined)
    .reduce((acc, cur) => acc + cur, 0);
  const value = getMidiNoteValue(note);
  const MIDI = value + sum;
  return isMidiObject(note) ? { ...note, MIDI } : MIDI;
};

/** If the `ScaleNote` is a `MidiNote`, sum the note with the steps.
 * Otherwise, insert a scale vector into the offsets of a scale note. */
export const getTransposedScaleNote = (
  note: ScaleNote,
  steps = 0,
  id = "chromatic"
): ScaleNote => {
  if (isMidiNote(note)) return getTransposedMidiNote(note, steps);
  return { ...note, offset: sumVectors(note.offset, { [id]: steps }) };
};

// ------------------------------------------------------------
// Get Transformed Scales
// ------------------------------------------------------------

/** Update a `Scale` with new notes. */
export const getNewScale = <T extends Scale>(
  scale: T,
  notes: ScaleArray
): T => {
  if (isArray(scale)) return [...notes] as T;
  return { ...scale, notes };
};

/** Get a `Scale` tranposed by the given number of steps chromatically or by ID. */
export const getTransposedScale = <T extends Scale>(
  scale: T,
  steps = 0,
  id?: ScaleVectorId
): T => {
  if (steps === 0) return scale;
  const notes = getScaleNotes(scale);
  const newNotes = notes.map((n) => getTransposedScaleNote(n, steps, id));
  return getNewScale(scale, newNotes);
};

/** Get a `Scale` rotated by a given number of steps along itself. */
export const getRotatedScale = <T extends Scale>(scale: T, steps = 0) => {
  if (steps === 0) return scale;
  const notes = getScaleNotes(scale);
  const modulus = notes.length;
  const newNotes: ScaleArray = [];

  // Iterate through each note
  for (let i = 0; i < notes.length; i++) {
    // Compute the new index and wrap around the modulus
    const summedIndex = i + steps;
    const moddedIndex = mod(summedIndex, modulus);

    // Get the new note and determine the octave wrap
    const newNote = notes[moddedIndex];
    const wrap = Math.floor(summedIndex / modulus);

    // Push the new note to the array
    const note = getTransposedScaleNote(newNote, wrap * 12);
    newNotes.push(note);
  }

  // Return the updated scale
  return getNewScale(scale, newNotes);
};

// ------------------------------------------------------------
// Transpose Notes Through Scales
// ------------------------------------------------------------

/** Get the parent note of a `ScaleNote` within a `Scale`, applying any relevant offsets. */
export const transposeNoteThroughScale = (
  note: ScaleNote,
  scale: Scale = []
): ScaleNote => {
  if (isMidiNote(note)) return note;

  // Get the parent notes
  const parentNotes = getScaleNotes(scale);
  const modulus = parentNotes.length;

  // Determine if the note has an offset for this scale
  const { degree, offset } = note;
  const shouldOffset = !!offset && !isArray(scale);
  const degreeOffset = shouldOffset ? offset?.[scale.id] ?? 0 : 0;

  // Get the parent note using the new degree (+ offset)
  const newDegree = degree + degreeOffset;
  const parentNote = parentNotes[mod(newDegree, modulus)];
  if (!parentNote) return -1;

  // Adjust the octave displacement accordingly
  const newOctave = Math.floor(newDegree / modulus);

  // If the parent note is a MIDI note, add all displacements and return
  if (isNumber(parentNote) || !isNestedNote(parentNote)) {
    const T = offset?.chromatic ?? 0;
    const O = offset?.octave ?? 0;
    return getTransposedMidiNote(parentNote, T, O * 12, newOctave * 12);
  }

  // If the parent note is a NestedNote, sum the parent + child + octave offsets
  const childOffset = { ...(offset ?? {}) };
  if (shouldOffset && degreeOffset) delete childOffset[scale.id];
  const parentOffset = parentNote.offset ?? {};
  const octaveOffset = newOctave ? { octave: newOctave } : {};
  const newOffset = sumVectors(childOffset, parentOffset, octaveOffset);
  return { ...parentNote, offset: newOffset };
};

/** Chain a `ScaleNote` through the `Scales` provided, applying any relevant offsets. */
export const transposeNoteThroughScales = (
  note: ScaleNote,
  scales: Scale[]
): ScaleNote => {
  const scaleCount = scales.length;
  let chainedNote = note;
  for (let i = scaleCount - 1; i >= 0; i--) {
    chainedNote = transposeNoteThroughScale(chainedNote, scales[i]);
  }
  return chainedNote;
};
