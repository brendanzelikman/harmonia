import { mod } from "utils/math";
import { getMidiNoteValue, getScaleNotes } from "./ScaleFunctions";
import {
  MidiNote,
  isMidiObject,
  ScaleNote,
  isNestedNote,
  Scale,
  ScaleArray,
  ScaleVectorId,
  ScaleVector,
  isScaleArray,
  isMidiNote,
  isScaleObject,
} from "./ScaleTypes";
import { sumVectors } from "utils/objects";

// ------------------------------------------------------------
// Get Transformed Scale Notes
// ------------------------------------------------------------

/** Update a `Scale` with new offsets. */
export const getScaleNoteWithNewOffset = <T = ScaleNote>(
  note: T,
  offset: ScaleVector
): T => {
  if (!isNestedNote(note)) return note as T;
  return { ...note, offset };
};

/* Sum a `MidiNote` with a number or array of numbers */
export const getTransposedMidiNote = (
  note: MidiNote,
  ...offsets: (number | undefined)[]
): MidiNote => {
  if (!offsets.length) return note;
  const sum = offsets
    .flat()
    .filter((n) => n !== undefined)
    .reduce((acc, cur) => acc + cur, 0);
  const value = getMidiNoteValue(note);
  const midi = value + sum;
  return isMidiObject(note) ? { ...note, MIDI: midi } : midi;
};

/** If the `ScaleNote` is a `MidiNote`, sum the note with the steps.
 * Otherwise, insert a scale vector into the offsets of a scale note. */
export const getTransposedScaleNote = (
  note: ScaleNote,
  steps = 0,
  id = "chromatic"
): ScaleNote => {
  if (steps === 0) return note;
  if (!isNestedNote(note)) return getTransposedMidiNote(note, steps);
  const vector: ScaleVector = { [id]: steps };
  const offset = sumVectors(note.offset, vector);
  return { ...note, offset };
};

// ------------------------------------------------------------
// Get Transformed Scales
// ------------------------------------------------------------

/** Update a `Scale` with new notes. */
export const getScaleWithNewNotes = <T extends Scale>(
  scale: T,
  notes: ScaleArray
): T => {
  if (isScaleArray(scale)) return notes as T;
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
  return getScaleWithNewNotes(scale, newNotes);
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
    const note = getTransposedScaleNote(newNote, wrap * 12, "chromatic");
    newNotes.push(note);
  }

  // Return the updated scale
  return getScaleWithNewNotes(scale, newNotes);
};

// ------------------------------------------------------------
// Transpose Notes Through Scales
// ------------------------------------------------------------

/** Get the parent note of a `ScaleNote` within a `Scale`, applying any relevant offsets. */
export const transposeNoteThroughScale = (
  note?: ScaleNote,
  scale?: Scale
): ScaleNote => {
  if (!note) return -1;
  if (!scale || isMidiNote(note)) return note;

  // Get the parent notes
  const parentNotes = getScaleNotes(scale);
  const modulus = parentNotes.length;

  // Determine if the note has an offset for this scale
  const { degree, offset } = note;
  const shouldOffset = !!offset && isScaleObject(scale);
  const degreeOffset = shouldOffset ? offset?.[scale.id] ?? 0 : 0;

  // Get the parent note using the new degree (+ offset)
  const newDegree = degree + degreeOffset;
  const parentNote = parentNotes[mod(newDegree, modulus)];
  if (!parentNote) return -1;

  // Adjust the octave displacement accordingly
  const newOctave = Math.floor(newDegree / modulus);

  // If the parent note is a MIDI note, add all displacements and return
  if (!isNestedNote(parentNote)) {
    const T = offset?.chromatic ?? 0;
    const O = offset?.octave ?? 0;
    return getTransposedMidiNote(parentNote, T, O * 12, newOctave * 12);
  }

  // If the parent note is a NestedNote, sum the parent + child + octave offsets
  const childOffset = note.offset;
  const parentOffset = parentNote.offset;
  const octaveOffset = { octave: newOctave };
  const newOffset = sumVectors(childOffset, parentOffset, octaveOffset);
  return getScaleNoteWithNewOffset(parentNote, newOffset);
};

/** Chain a `ScaleNote` through the `Scales` provided, applying any relevant offsets. */
export const transposeNoteThroughScales = (
  note: ScaleNote,
  scales: Scale[]
): ScaleNote => {
  const scaleCount = scales.length;
  if (!scaleCount) return note;
  let chainedNote = note;
  for (let i = scaleCount - 1; i >= 0; i--) {
    const scale = scales[i];
    chainedNote = transposeNoteThroughScale(chainedNote, scale);
  }
  return chainedNote;
};
