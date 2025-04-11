import { PitchClass } from "types/units";
import { capitalize } from "lodash";

/** A regex matching an initial pitch class and a following string. */
export const PITCH_CLASS_REGEX = /^([a-gA-G][#b]?[#b]?)(.*)$/;

/** The list of possible spellings for each note of the chromatic scale. */
export const PITCH_CLASSES: PitchClass[][] = [
  ["C", "B#", "Dbb"],
  ["C#", "Db", "B##"],
  ["D", "C##", "Ebb"],
  ["D#", "Eb", "Fbb"],
  ["E", "Fb", "D##"],
  ["F", "E#", "Gbb"],
  ["F#", "Gb", "E##"],
  ["G", "Abb", "F##"],
  ["G#", "Ab"],
  ["A", "G##", "Bbb"],
  ["A#", "Bb", "Cbb"],
  ["B", "Cb", "A##"],
] as const;
export const pitchClassSet = new Set(PITCH_CLASSES.flat());

/** Returns true if an object is a pitch class. */
export const isPitchClass = (value: any): value is PitchClass =>
  pitchClassSet.has(value);

// ------------------------------------------------------------
// Pitch Class Helpers
// ------------------------------------------------------------

/** Unpack the pitch class and scale name from a string. */
export const unpackScaleName = (
  name: string
): { scaleName: string; pitchClass: PitchClass | undefined } | undefined => {
  const match = name.match(PITCH_CLASS_REGEX);
  if (!match) return { scaleName: name, pitchClass: undefined };
  const [_, _pitchClass, scaleName] = match;
  const pitchClass = capitalize(_pitchClass);
  if (!isPitchClass(pitchClass) || !scaleName) return undefined;
  return { pitchClass, scaleName };
};

/** A record of pitch classes to their lower and upper neighbors */
const pitchClassNeighbors: Record<PitchClass, [PitchClass, PitchClass]> = {
  C: ["Cb", "C#"],
  D: ["Db", "D#"],
  E: ["Eb", "E#"],
  F: ["Fb", "F#"],
  G: ["Gb", "G#"],
  A: ["Ab", "A#"],
  B: ["Bb", "B#"],
  "C#": ["C", "C##"],
  "D#": ["D", "D##"],
  "E#": ["E", "E##"],
  "F#": ["F", "F##"],
  "G#": ["G", "G##"],
  "A#": ["A", "A##"],
  "B#": ["B", "B##"],
  Cb: ["Cbb", "C"],
  Db: ["Dbb", "D"],
  Eb: ["Ebb", "E"],
  Fb: ["Fbb", "F"],
  Gb: ["Gbb", "G"],
  Ab: ["Abb", "A"],
  Bb: ["Bbb", "B"],
  "C##": ["C#", "D#"],
  "D##": ["D#", "E#"],
  "E##": ["E#", "F##"],
  "F##": ["F#", "G#"],
  "G##": ["G#", "A#"],
  "A##": ["A#", "B#"],
  "B##": ["B#", "C##"],
  Cbb: ["Bbb", "Cb"],
  Dbb: ["Cb", "Db"],
  Ebb: ["Db", "Eb"],
  Fbb: ["Ebb", "Fb"],
  Gbb: ["Fb", "Gb"],
  Abb: ["Gb", "Ab"],
  Bbb: ["Ab", "Bb"],
};

export const getPitchClassLowerNeighbor = (pc: PitchClass) => {
  const tuple = pitchClassNeighbors[pc];
  if (!tuple) throw new Error(`Invalid pitch class: ${pc}`);
  return tuple[0];
};

export const getPitchClassUpperNeighbor = (pc: PitchClass) => {
  const tuple = pitchClassNeighbors[pc];
  if (!tuple) throw new Error(`Invalid pitch class: ${pc}`);
  return tuple[1];
};
