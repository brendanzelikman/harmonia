import { ChromaticKey } from "lib/presets/keys";
import { Key, PitchClass } from "types/units";
import { PITCH_CLASSES } from "./pitch";
import { mod } from "./math";
import { isNumber } from "types/utils";

// ------------------------------------------------------------
// MIDI Types
// ------------------------------------------------------------

export type MidiValue = number;
export type MidiScale = MidiValue[];
export type MidiObject = { MIDI: MidiValue };
export type MidiNote = MidiObject | MidiValue;

// ------------------------------------------------------------
// MIDI Numbers
// ------------------------------------------------------------

/** Get a `MidiNote` as a number. */
export const getMidiValue = (note?: MidiNote) => {
  return isNumber(note) ? note : note?.MIDI ?? 0;
};

/** Get the chromatic degree of a MIDI note or pitch (e.g. 60/C4 = 0). */
export const getMidiDegree = (note?: MidiNote) => {
  return mod(getMidiValue(note), 12);
};

// ------------------------------------------------------------
// Midi Frequency
// ------------------------------------------------------------

/** Get the frequency of a MIDI note (e.g. 60 = 261.63). */
export const getMidiFrequency = (note: MidiNote) => {
  const midi = getMidiValue(note);
  return Math.pow(2, (midi - 69) / 12) * 440;
};

/** Get the MIDI value of a frequency (e.g. 261.63 = 60) */
export const getFrequencyMidi = (frequency: number) => {
  return 69 + 12 * Math.log2(frequency / 440);
};

// ------------------------------------------------------------
// Midi Octaves
// ------------------------------------------------------------

/** Get the octave of a MIDI note (e.g. 60 = 4) */
export const getMidiOctaveNumber = (note: MidiNote, key?: Key) => {
  const midi = getMidiValue(note);
  const octave = Math.floor((midi - 12) / 12);
  if (!key) return octave;

  // If there is a key, check for edge cases
  const number = mod(midi, 12);
  if (number === 0 && key[0] === "B#") return octave - 1;
  if (number === 1 && key[1] === "B##") return octave - 1;
  if (number === 10 && key[10] === "Cbb") return octave + 1;
  if (number === 11 && key[11] === "Cb") return octave + 1;
  return octave;
};

/** Get the octave distance of two MIDI notes. */
export const getMidiOctaveDistance = (note1: MidiNote, note2: MidiNote) => {
  return getMidiOctaveNumber(note2) - getMidiOctaveNumber(note1);
};

// ------------------------------------------------------------
// MIDI Pitch Classes
// ------------------------------------------------------------

/** Get the pitch class of a MIDI number using a key (e.g. 60 = C). */
export const getMidiPitchClass = (note: MidiNote, key: Key = ChromaticKey) => {
  return key[getMidiDegree(note)] ?? "C";
};

/** Get the pitch letter of a MIDI number (used for MusicXML, e.g. 61 = C). */
export const getMidiPitchLetter = (note: MidiNote, key: Key = ChromaticKey) => {
  const pitchClass = getMidiPitchClass(note, key);
  return pitchClass.replace(/b|#|-/g, "");
};

/** Get the chromatic number of a MIDI note or pitch (e.g. 60/C4 = 0). */
export const getPitchClassDegree = (note: PitchClass) => {
  return PITCH_CLASSES.findIndex((x) => x.includes(note));
};

// ------------------------------------------------------------
// MIDI Pitches
// ------------------------------------------------------------

/** Get the pitch of a MIDI number using a key (e.g. 60 = C4) */
export const getMidiPitch = (note: MidiNote, key: Key = ChromaticKey) => {
  return `${getMidiPitchClass(note, key)}${getMidiOctaveNumber(note)}`;
};

/** Get the MIDI number of a pitch class. */
export const getMidiFromPitch = (note: string) => {
  const pitchRegex = /([a-gA-G][#b]?[#b]?\d?)/g;
  const match = pitchRegex.exec(note);
  if (!match) return parseFloat(note);
  const pitch = match[1];
  const hasNumber = pitch.match(/\d/);
  const octave = hasNumber ? parseInt(pitch.replace(/[^0-9]/g, "")) : 4;
  const pitchClass = pitch.replace(/[0-9]/g, "") as PitchClass;
  const degree = getPitchClassDegree(pitchClass);
  return (octave + 1) * 12 + degree;
};

// ------------------------------------------------------------
// MIDI Accidentals
// ------------------------------------------------------------

const accidentalNumbers: Record<string, number> = {
  "#": 1,
  b: -1,
  "##": 2,
  bb: -2,
};

/** Get the accidental offset of the note using the key (e.g. 61 = C#). */
export const getMidiAccidentalNumber = (
  note: MidiNote,
  key: Key = ChromaticKey
): number => {
  const pitch = getMidiPitch(note, key);
  const accidentalMatch = pitch.match(/bb|##|b|#/g);
  return accidentalNumbers[accidentalMatch?.[0] ?? ""] ?? 0;
};

const accidentalTypes: Record<number, string> = {
  1: "sharp",
  "-1": "flat",
  2: "double-sharp",
  "-2": "double-flat",
};

/** Get the accidental of a MIDI note (used for MusicXML, e.g. 61 = "sharp")/ */
export const getMidiAccidental = (
  note: MidiNote,
  key: Key = ChromaticKey
): string => {
  const offset = getMidiAccidentalNumber(note, key);
  return accidentalTypes[offset] ?? "natural";
};
