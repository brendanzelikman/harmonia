import { Key, MIDI, Pitch, PitchClass } from "types/units";
import { CHROMATIC_SPELLINGS } from "./pitch";
import { mod } from "./math";
import { ChromaticKey } from "presets/keys";
import { isNumber } from "lodash";

// ------------------------------------------------------------
// MIDI Conversions
// ------------------------------------------------------------

/** Get the pitch class of a MIDI number using a key (e.g. 60 = C). */
export const getMidiPitchClass = (note: MIDI, key: Key = ChromaticKey) => {
  return key[mod(note, 12)];
};

/** Get the pitch of a MIDI number using a key (e.g. 60 = C4) */
export const getMidiPitch = (note: MIDI, key: Key = ChromaticKey) => {
  return `${getMidiPitchClass(note, key)}${getMidiOctaveNumber(note)}`;
};

/** Get the chromatic number of a MIDI note or pitch (e.g. 60/C4 = 0). */
export const getMidiChromaticNumber = (pitch?: MIDI | PitchClass) => {
  if (!pitch) return 0;
  if (isNumber(pitch)) pitch = getMidiPitchClass(pitch as MIDI);
  return CHROMATIC_SPELLINGS.findIndex((x) => x.includes(pitch as PitchClass));
};

/** Get the octave of a MIDI note (e.g. 60 = 4) */
export const getMidiOctaveNumber = (note: MIDI, key: Key = ChromaticKey) => {
  const octave = Math.floor((note - 12) / 12);
  const number = getMidiChromaticNumber(note);

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
export const getMidiOctaveDistance = (note1: MIDI, note2: MIDI) => {
  return getMidiOctaveNumber(note2) - getMidiOctaveNumber(note1);
};

/** Get the note letter of a MIDI number (used for MusicXML, e.g. 61 = C). */
export const getMidiNoteLetter = (note: MIDI, key: Key = ChromaticKey) => {
  const pitchClass = getMidiPitchClass(note, key);
  if (!pitchClass) return "C";
  return pitchClass.replace(/b|#|-/g, "");
};

/** Get the accidental offset of the note using the key (e.g. 61 = C#). */
export const getMidiAccidentalOffset = (
  note: MIDI,
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
  note: MIDI,
  key: Key = ChromaticKey
): string => {
  const offset = getMidiAccidentalOffset(note, key);
  if (offset === 1) return "sharp";
  if (offset === -1) return "flat";
  if (offset === 2) return "double-sharp";
  if (offset === -2) return "double-flat";
  return "natural";
};
