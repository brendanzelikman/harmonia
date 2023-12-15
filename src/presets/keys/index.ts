import MajorKeys from "./MajorKeys";
import MinorKeys from "./MinorKeys";

const ChromaticKey = [
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
  "A#",
  "B",
];
const SharpKey = [
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
];
const FlatKey = [
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
];
export { ChromaticKey, SharpKey, FlatKey, MajorKeys, MinorKeys };

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
