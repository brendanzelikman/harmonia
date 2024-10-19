import { Key, PitchClass } from "types/units";
import { PITCH_CLASSES } from "./pitchClass";
import { mod } from "./math";
import { ChromaticKey } from "assets/keys";
import { isNumber } from "lodash";
import { chromaticNotes } from "types/Scale/ScaleTypes";

// ------------------------------------------------------------
// MIDI Units
// ------------------------------------------------------------

export type MidiValue = number;
export type MidiScale = MidiValue[];
export type MidiObject = { MIDI: MidiValue };
export type MidiNote = MidiObject | MidiValue;

/** Get a `MidiNote` as a number. */
export const getMidiNoteValue = (note?: MidiNote) => {
  return isNumber(note) ? note : note?.MIDI ?? 0;
};

/** Get the chromatic degree of a MIDI note or pitch (e.g. 60/C4 = 0). */
export const getMidiDegree = (note?: MidiNote) => {
  const midi = getMidiNoteValue(note);
  return mod(midi, 12);
};

/** Return the index of a MIDI note within a scale. */
export const getMidiScaleDegree = (midi: MidiNote, scale: MidiScale) => {
  const degree = getMidiDegree(midi);
  return scale.findIndex((note) => getMidiDegree(note) === degree);
};

/** Returns true if a MIDI falls within a scale. */
export const isMidiInScale = (midi: MidiNote, scale: MidiScale) => {
  return getMidiScaleDegree(midi, scale) !== -1;
};

/** Get a degree number as a chromatic note. */
export const getMidiChromaticNote = (note?: MidiNote) => {
  const degree = getMidiDegree(note);
  return chromaticNotes[degree];
};

// ------------------------------------------------------------
// Pitches
// ------------------------------------------------------------

/** Get the pitch class of a MIDI number using a key (e.g. 60 = C). */
export const getMidiPitchClass = (note: MidiNote, key: Key = ChromaticKey) => {
  const degree = getMidiDegree(note);
  return key[degree];
};

/** Get the pitch letter of a MIDI number (used for MusicXML, e.g. 61 = C). */
export const getMidiPitchLetter = (note: MidiNote, key: Key = ChromaticKey) => {
  const pitchClass = getMidiPitchClass(note, key);
  if (!pitchClass) return "C";
  return pitchClass.replace(/b|#|-/g, "");
};

/** Get the pitch of a MIDI number using a key (e.g. 60 = C4) */
export const getMidiPitch = (note: MidiNote, key: Key = ChromaticKey) => {
  return `${getMidiPitchClass(note, key)}${getMidiOctaveNumber(note)}`;
};

/** Get the chromatic number of a MIDI note or pitch (e.g. 60/C4 = 0). */
export const getPitchClassNumber = (note?: PitchClass) => {
  if (note === undefined) return 0;
  return PITCH_CLASSES.findIndex((x) => x.includes(note));
};

/** Get the MIDI number of a pitch class. */
export const getMidiFromPitch = (note: string) => {
  const pitchRegex = /([A-G]#?\d?)/g;
  const match = pitchRegex.exec(note);
  if (!match) return 0;
  const pitch = match[1];
  const hasNumber = pitch.match(/\d/);
  const octave = hasNumber ? parseInt(pitch.replace(/[^0-9]/g, "")) : 4;
  const pitchClass = pitch.replace(/[0-9]/g, "") as PitchClass;
  const degree = getPitchClassNumber(pitchClass);
  return (octave + 1) * 12 + degree;
};

// ------------------------------------------------------------
// Octaves
// ------------------------------------------------------------

/** Get the octave of a MIDI note (e.g. 60 = 4) */
export const getMidiOctaveNumber = (note: MidiNote, key?: Key) => {
  const midi = getMidiNoteValue(note);
  const octave = Math.floor((midi - 12) / 12);
  if (!key) return octave;

  // If there is a key, check for edge cases
  const number = getMidiDegree(note);

  // Handle lower edge cases
  if (number === 0 && key[0] === "B#") return octave - 1;
  if (number === 1 && key[1] === "B##") return octave - 1;

  // Handle upper edge cases
  if (number === 10 && key[10] === "Cbb") return octave + 1;
  if (number === 11 && key[11] === "Cb") return octave + 1;

  // Return the octave
  return octave;
};

/** Get the octave distance of two MIDI notes. */
export const getMidiOctaveDistance = (note1: MidiNote, note2: MidiNote) => {
  return getMidiOctaveNumber(note2) - getMidiOctaveNumber(note1);
};

// ------------------------------------------------------------
// Accidentals
// ------------------------------------------------------------

/** Get the accidental offset of the note using the key (e.g. 61 = C#). */
export const getMidiAccidentalNumber = (
  note: MidiNote,
  key: Key = ChromaticKey
): number => {
  const pitch = getMidiPitch(note, key);
  const accidentalMatch = pitch.match(/bb|##|b|#/g);
  if (accidentalMatch) {
    const accidental = accidentalMatch[0];
    if (accidental === "#") return 1;
    if (accidental === "b") return -1;
    if (accidental === "##") return 2;
    if (accidental === "bb") return -2;
  }
  return 0;
};

/** Get the accidental of a MIDI note (used for MusicXML, e.g. 61 = "sharp")/ */
export const getMidiAccidental = (
  note: MidiNote,
  key: Key = ChromaticKey
): string => {
  const offset = getMidiAccidentalNumber(note, key);
  if (offset === 1) return "sharp";
  if (offset === -1) return "flat";
  if (offset === 2) return "double-sharp";
  if (offset === -2) return "double-flat";
  return "natural";
};
