import { Key, PitchClass } from "types/units";
import { PresetScaleGroupList, PresetScaleGroupMap } from "presets/scales";
import { getMidiOctaveDistance, getMidiPitchClass } from "utils/midi";
import { areScalesRelated } from "./ScaleUtils";
import {
  ScaleNote,
  isNestedNote,
  ScaleArray,
  isMidiNote,
  isMidiValue,
  chromaticNotes,
  isScaleArray,
  isScale,
  ScaleChain,
  Scale,
} from "./ScaleTypes";
import { MidiNote, MidiValue } from "types/units";
import { resolveScaleToMidi, resolveScaleChainToMidi } from "./ScaleResolvers";
import { ChromaticKey } from "presets/keys";

// ------------------------------------------------------------
// Scale Aggregate Functions
// ------------------------------------------------------------

/** Get a `Scale` as an array of notes. */
export const getScaleNotes = (scale?: Scale): ScaleArray => {
  if (!scale) return [];
  return isScaleArray(scale) ? scale : scale.notes ?? [];
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
export const getParentAsNewScale = (chain: ScaleChain, scale?: Scale) => {
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
      const midi = getMidiNoteValue(note);
      const degree = parent.findIndex((n) => n === midi);
      if (degree === -1) return undefined;
      const octave = getMidiOctaveDistance(parent[degree], midi);
      return { degree, offset: { octave } };
    })
    .filter(Boolean) as ScaleArray;
};

// ------------------------------------------------------------
// Scale Note Properties and Functions
// ------------------------------------------------------------

/** Get a `MidiNote` as a number. */
export const getMidiNoteValue = (note?: MidiNote) => {
  if (!isMidiNote(note)) return 0;
  return isMidiValue(note) ? note : note.MIDI ?? 0;
};

/** Get the degree of a `ScaleNote` or chromatic number */
export const getScaleNoteDegree = (note?: ScaleNote) => {
  if (!note) return -1;
  if (isNestedNote(note)) return note.degree;
  return getMidiNoteValue(note) % 12;
};

/** Get the octave offset of a `ScaleNote` relative to MIDI = 60. */
export const getScaleNoteOctave = (note?: ScaleNote) => {
  if (!note) return 0;
  if (isNestedNote(note)) return note.offset?.octave ?? 0;
  return Math.floor((getMidiNoteValue(note) - 60) / 12);
};

/** Get a `ScaleNote` as a `MidiValue`, assuming the chromatic scale as a parent. */
export const getScaleNoteMidiValue = (note?: ScaleNote): MidiValue => {
  if (!note) return 0;
  if (isMidiNote(note)) return getMidiNoteValue(note);
  const { degree, offset } = note;
  const chromatic = offset?.chromatic || 0;
  const octave = offset?.octave || 0;
  return chromaticNotes[degree] + chromatic + octave * 12;
};

/** Get a `ScaleNote` as a pitch class (e.g. C#) */
export const getScaleNotePitchClass = (
  note: ScaleNote,
  key: Key = ChromaticKey
): PitchClass => {
  const midi = getScaleNoteMidiValue(note);
  return getMidiPitchClass(midi, key);
};

// ------------------------------------------------------------
// Scale Name and Category
// ------------------------------------------------------------

/** Gets the category of a preset scale matching the given scale. */
export const getScaleCategory = (scale?: Scale) => {
  if (!isScale(scale)) return "No Category";

  // Try to find a matching preset scale in each group
  for (const group of PresetScaleGroupList) {
    const scales = PresetScaleGroupMap[group];

    // Return the group if the scale is related to any of the scales
    if (scales.some((m) => areScalesRelated(m, scale))) {
      return group;
    }
  }

  // Return "Custom Scales" if no matches are found
  return "Custom Scales";
};
