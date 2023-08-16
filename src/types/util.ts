import { MIDI } from "./midi";
import { Pattern, isRest } from "./patterns";
import Scales from "./scales";

export const rotate = (arr: any[], n: number) => {
  return arr.slice(n, arr.length).concat(arr.slice(0, n));
};
// Key profiles for the Krumhansl-Schmuckler algorithm
export const MAJOR_KEY_PROFILE = [
  6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88,
];
export const MINOR_KEY_PROFILE = [
  6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17,
];
type Key =
  | "C"
  | "C#"
  | "D"
  | "D#"
  | "E"
  | "F"
  | "F#"
  | "G"
  | "G#"
  | "A"
  | "A#"
  | "B";
type KeyMap<T> = {
  [key in Key]: T;
};

// Map of major profiles
export const MAJOR_KEY_PROFILES: KeyMap<number[]> = {
  C: MAJOR_KEY_PROFILE,
  "C#": rotate(MAJOR_KEY_PROFILE, 1),
  D: rotate(MAJOR_KEY_PROFILE, 2),
  "D#": rotate(MAJOR_KEY_PROFILE, 3),
  E: rotate(MAJOR_KEY_PROFILE, 4),
  F: rotate(MAJOR_KEY_PROFILE, 5),
  "F#": rotate(MAJOR_KEY_PROFILE, 6),
  G: rotate(MAJOR_KEY_PROFILE, 7),
  "G#": rotate(MAJOR_KEY_PROFILE, 8),
  A: rotate(MAJOR_KEY_PROFILE, 9),
  "A#": rotate(MAJOR_KEY_PROFILE, 10),
  B: rotate(MAJOR_KEY_PROFILE, 11),
};
// Map of minor profiles
export const MINOR_KEY_PROFILES: KeyMap<number[]> = {
  C: MINOR_KEY_PROFILE,
  "C#": rotate(MINOR_KEY_PROFILE, 1),
  D: rotate(MINOR_KEY_PROFILE, 2),
  "D#": rotate(MINOR_KEY_PROFILE, 3),
  E: rotate(MINOR_KEY_PROFILE, 4),
  F: rotate(MINOR_KEY_PROFILE, 5),
  "F#": rotate(MINOR_KEY_PROFILE, 6),
  G: rotate(MINOR_KEY_PROFILE, 7),
  "G#": rotate(MINOR_KEY_PROFILE, 8),
  A: rotate(MINOR_KEY_PROFILE, 9),
  "A#": rotate(MINOR_KEY_PROFILE, 10),
  B: rotate(MINOR_KEY_PROFILE, 11),
};

export const getPatternDurations = (pattern: Pattern): KeyMap<number> => {
  const notes = pattern.stream.flat().filter((note) => !isRest(note));
  const profile = notes.reduce((acc, note) => {
    const pitch = MIDI.toPitch(note.MIDI) as Key;
    if (!acc[pitch]) {
      acc[pitch] = note.duration;
    } else {
      acc[pitch] += note.duration;
    }
    return acc;
  }, {} as KeyMap<number>);
  return profile;
};

// export const getPatternKeys = (pattern: Pattern) => {
//   const notes = pattern.stream.flat().filter((note) => !isRest(note));

//   const scale = { id: -1, name: "", notes: notes.map};
//   const profile = Scales.areRelated(pitches, MAJOR_KEY_PROFILE)
//     ? MAJOR_KEY_PROFILES
//     : MINOR_KEY_PROFILES;
// };
