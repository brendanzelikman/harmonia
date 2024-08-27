import { Key, MIDI } from "types/units";
import MajorKeys from "./MajorKeys";
import MinorKeys from "./MinorKeys";
import { mod } from "utils/math";

export type ChromaticPitchClass =
  | "C"
  | "C#"
  | "D"
  | "Eb"
  | "E"
  | "F"
  | "F#"
  | "G"
  | "G#"
  | "A"
  | "Bb"
  | "B";

const ChromaticKey: ChromaticPitchClass[] = [
  "C",
  "C#",
  "D",
  "Eb",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "Bb",
  "B",
] as const;

const SharpKey: Key = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "E#",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
] as const;
const FlatKey: Key = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
] as const;
export { ChromaticKey, SharpKey, FlatKey, MajorKeys, MinorKeys };

export const getPreferredKey = (midi: MIDI, name?: string): Key => {
  if (!name) return ChromaticKey;
  const key = name.toLowerCase();
  const majorNames = ["major", "lydian", "mixolydian"];
  const minorNames = ["minor", "dorian", "phrygian", "aeolian", "locrian"];
  const isMajor = majorNames.some((n) => key.includes(n));
  const isMinor = minorNames.some((n) => key.includes(n));

  // Handle C# minor and Db major
  if (mod(midi, 12) === 1) {
    if (isMinor) return SharpKey;
    if (isMajor) return FlatKey;
  }

  // Handle G# minor and Ab major
  if (mod(midi, 12) === 8) {
    if (isMinor) return SharpKey;
    if (isMajor) return FlatKey;
  }

  return ChromaticKey;
};

// Return a map of preset group key to preset group
// e.g. { "Major Keys": [ ... ], "Minor Keys": [ ... ], ... }
export const PresetKeyGroupMap = {
  "Major Keys": Object.values(MajorKeys),
  "Minor Keys": Object.values(MinorKeys),
};

export type KeyGroupMap = typeof PresetKeyGroupMap;
export type KeyGroup = keyof KeyGroupMap;
export type KeyGroupList = KeyGroup[];

// Return a list of all preset groups
// e.g. [ "Major Keys", "Minor Keys", ... ]
export const PresetKeyGroupList = Object.keys(
  PresetKeyGroupMap
) as KeyGroupList;

// Return a list of all preset keys
// e.g. [ C Major Key, C# Major Key, ... ]
export const PresetKeyList = Object.values(PresetKeyGroupMap).flat();

// Return a map of preset scale id to preset scale
// e.g. { "c-major-key": C Major Key, "c-minor-key": C Minor Key, ... }
export const PresetKeyMap = { ...MajorKeys, ...MinorKeys };
