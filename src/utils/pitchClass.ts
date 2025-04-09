import { PitchClass } from "types/units";
import { capitalize } from "lodash";

/** A regex matching an initial pitch class and a following string. */
export const PITCH_CLASS_REGEX = /^([a-gA-G][#b]?)(.*)$/;

/** The list of possible spellings for each note of the chromatic scale. */
export const PITCH_CLASSES: PitchClass[][] = [
  ["C", "B#"],
  ["C#", "Db"],
  ["D"],
  ["D#", "Eb"],
  ["E", "Fb"],
  ["F", "E#"],
  ["F#", "Gb"],
  ["G"],
  ["G#", "Ab"],
  ["A"],
  ["A#", "Bb"],
  ["B", "Cb"],
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

/** Raise a pitch class by sharpening it.  */
export const getPitchClassUpperNeighbor = (pitchClass: PitchClass) => {
  if (pitchClass === "C") return "C#";
  if (pitchClass === "D") return "D#";
  if (pitchClass === "E") return "E#";
  if (pitchClass === "F") return "F#";
  if (pitchClass === "G") return "G#";
  if (pitchClass === "A") return "A#";
  if (pitchClass === "B") return "B#";

  if (pitchClass === "C#") return "C##";
  if (pitchClass === "D#") return "D##";
  if (pitchClass === "E#") return "E##";
  if (pitchClass === "F#") return "F##";
  if (pitchClass === "G#") return "G##";
  if (pitchClass === "A#") return "A##";
  if (pitchClass === "B#") return "B##";

  if (pitchClass === "Cb") return "C";
  if (pitchClass === "Db") return "D";
  if (pitchClass === "Eb") return "E";
  if (pitchClass === "Fb") return "F";
  if (pitchClass === "Gb") return "G";
  if (pitchClass === "Ab") return "A";
  if (pitchClass === "Bb") return "B";

  if (pitchClass === "C##") return "D#";
  if (pitchClass === "D##") return "E#";
  if (pitchClass === "E##") return "F##";
  if (pitchClass === "F##") return "G#";
  if (pitchClass === "G##") return "A#";
  if (pitchClass === "A##") return "B#";
  if (pitchClass === "B##") return "C##";

  if (pitchClass === "Cbb") return "Cb";
  if (pitchClass === "Dbb") return "Db";
  if (pitchClass === "Ebb") return "Eb";
  if (pitchClass === "Fbb") return "Fb";
  if (pitchClass === "Gbb") return "Gb";
  if (pitchClass === "Abb") return "Ab";
  if (pitchClass === "Bbb") return "Bb";

  throw new Error(`Invalid pitch class: ${pitchClass}`);
};

/** Lower a pitch class by flattening it. */
export const getPitchClassLowerNeighbor = (pitchClass: PitchClass) => {
  if (pitchClass === "C") return "Cb";
  if (pitchClass === "D") return "Db";
  if (pitchClass === "E") return "Eb";
  if (pitchClass === "F") return "Fb";
  if (pitchClass === "G") return "Gb";
  if (pitchClass === "A") return "Ab";
  if (pitchClass === "B") return "Bb";

  if (pitchClass === "C#") return "C";
  if (pitchClass === "D#") return "D";
  if (pitchClass === "E#") return "E";
  if (pitchClass === "F#") return "F";
  if (pitchClass === "G#") return "G";
  if (pitchClass === "A#") return "A";
  if (pitchClass === "B#") return "B";

  if (pitchClass === "Cb") return "Cbb";
  if (pitchClass === "Db") return "Dbb";
  if (pitchClass === "Eb") return "Ebb";
  if (pitchClass === "Fb") return "Fbb";
  if (pitchClass === "Gb") return "Gbb";
  if (pitchClass === "Ab") return "Abb";
  if (pitchClass === "Bb") return "Bbb";

  if (pitchClass === "C##") return "C#";
  if (pitchClass === "D##") return "D#";
  if (pitchClass === "E##") return "E#";
  if (pitchClass === "F##") return "F#";
  if (pitchClass === "G##") return "G#";
  if (pitchClass === "A##") return "A#";
  if (pitchClass === "B##") return "B#";

  if (pitchClass === "Cbb") return "Bbb";
  if (pitchClass === "Dbb") return "Db";
  if (pitchClass === "Ebb") return "Eb";
  if (pitchClass === "Fbb") return "Ebb";
  if (pitchClass === "Gbb") return "Gb";
  if (pitchClass === "Abb") return "Ab";
  if (pitchClass === "Bbb") return "Bb";

  throw new Error(`Invalid pitch class: ${pitchClass}`);
};
