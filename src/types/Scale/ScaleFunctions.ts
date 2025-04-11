import { Key, PitchClass } from "types/units";
import {
  getMidiValue,
  getMidiOctaveDistance,
  getMidiPitchClass,
  MidiValue,
} from "utils/midi";
import {
  ScaleNote,
  ScaleArray,
  isMidiNote,
  chromaticNotes,
  ScaleChain,
  Scale,
  ScaleObject,
} from "./ScaleTypes";
import { resolveScaleToMidi, resolveScaleChainToMidi } from "./ScaleResolvers";
import { ChromaticKey } from "assets/keys";
import { getVectorMidiOffset } from "utils/vector";
import { isNumber } from "types/utils";

// ------------------------------------------------------------
// Scale Notes
// ------------------------------------------------------------

/** Get a `Scale` as an array of notes. */
export const getScaleNotes = (scale: Scale): ScaleArray => {
  return "notes" in scale ? scale.notes : scale;
};

/** Get the degree of a `ScaleNote` or chromatic number */
export const getScaleNoteDegree = (note: ScaleNote) => {
  if (!isNumber(note) && "degree" in note) return note.degree;
  return getMidiValue(note) % 12;
};

/** Get the octave offset of a `ScaleNote` relative to MIDI = 60. */
export const getScaleNoteOctave = (note: ScaleNote) => {
  if (!isNumber(note) && "degree" in note) return note.offset?.octave ?? 0;
  return Math.floor((getMidiValue(note) - 60) / 12);
};

/** Get a `ScaleNote` as a `MidiValue`, assuming the chromatic scale as a parent. */
export const getScaleNoteMidiValue = (note: ScaleNote): MidiValue => {
  if (isMidiNote(note)) return getMidiValue(note);
  const base = chromaticNotes[note.degree];
  const offset = getVectorMidiOffset(note.offset);
  return base + offset;
};

// ------------------------------------------------------------
// Scale Pitch Class Functions
// ------------------------------------------------------------

/** Get a `ScaleNote` as a pitch class (e.g. C#) */
export const getScaleNotePitchClass = (
  note: ScaleNote,
  key: Key = ChromaticKey
): PitchClass => {
  const midi = getScaleNoteMidiValue(note);
  return getMidiPitchClass(midi, key);
};

/** Get a `Scale` as a list of pitch classes. */
export const getScalePitchClasses = (scale: Scale): Key => {
  const notes = getScaleNotes(scale);
  return notes.map((note) => getScaleNotePitchClass(note));
};

/** Gets the tonic note as a pitch class. */
export const getTonicPitchClass = (
  notes: ScaleArray,
  key: Key = ChromaticKey
): PitchClass => {
  return getScaleNotePitchClass(notes[0], key);
};

/** Convert the notes of a scale to degrees of a scale chain. */
export const getParentAsNewScale = (chain: ScaleChain, scale?: ScaleObject) => {
  const midiChain = resolveScaleChainToMidi(chain);
  if (!scale) return midiChain ?? chromaticNotes;

  // Get the notes of the scale and the parent chain
  const notes = resolveScaleToMidi(scale).map((n) => n % 12);
  const baseParent = midiChain.length ? midiChain : chromaticNotes;

  // Get the offset based on the distance to the parent tonic
  const parentTonic = baseParent[0];
  const givenTonic = notes[0];
  const tonicOffset = parentTonic - givenTonic;
  const parent = baseParent.map((n) => (n - tonicOffset) % 12);

  // Get the degrees of the notes
  return notes
    .map((note) => {
      const midi = getMidiValue(note);
      const degree = parent.findIndex((n) => n === midi);
      if (degree === -1) return undefined;
      const octave = getMidiOctaveDistance(parent[degree], midi);
      return { degree, offset: { octave }, scaleId: scale.id };
    })
    .filter(Boolean) as ScaleArray;
};
