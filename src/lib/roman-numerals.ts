import { VoiceLeading } from "types/Pose/PoseTypes";
import { dist } from "utils/array";
import { getRotatedScale } from "types/Scale/ScaleTransformers";
import { getMidiPitchClass, MidiValue } from "utils/midi";
import { ChromaticPitchClass } from "assets/keys";
import {
  createMajorNotes,
  createMinorNotes,
  majorNotes,
} from "types/Scale/ScaleTypes";

/** Roman numerals are based on scale degrees 1 to 7 */
export const ROMAN_NUMERALS = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5,
  VI: 6,
  VII: 7,
} as const;
export type RomanNumeral = keyof typeof ROMAN_NUMERALS;
export const isRomanNumeral = (value: string): value is RomanNumeral =>
  value in ROMAN_NUMERALS;

/** Roman numerals can be one of four chord types. */
export type RomanTonality = "major" | "minor" | "diminished" | "augmented";

/** Roman numerals are inputted by string */
export type RomanInput = string;

/** Get the degree of a roman numeral. */
export const getRomanDegree = (n: RomanNumeral) => ROMAN_NUMERALS[n] - 1;

/** Convert a roman numeral into an array of MIDI notes */
export const getRomanMidiValues = (
  input: RomanInput,
  scale = majorNotes
): MidiValue[] => {
  // Check for major chords
  if (isRomanNumeral(input)) {
    const degree = getRomanDegree(input);
    const base = scale[degree] % 12;
    return [base, base + 4, base + 7];
  }

  // Check for minor chords
  const upperValue = input.toUpperCase();
  if (isRomanNumeral(upperValue)) {
    const degree = getRomanDegree(upperValue);
    const base = scale[degree] % 12;
    return [base, base + 3, base + 7];
  }

  // Check for augmented chords (based on major)
  const string = input.slice(0, -1);
  const lastChar = input.slice(-1);
  if (isRomanNumeral(string) && lastChar === "+") {
    const degree = getRomanDegree(string);
    const base = scale[degree] % 12;
    return [base, base + 4, base + 8];
  }

  // Check for diminished chords (based on minor)
  const upperString = string.toUpperCase();
  if (isRomanNumeral(upperString) && lastChar === "o") {
    const degree = getRomanDegree(upperString);
    const base = scale[degree] % 12;
    return [base, base + 3, base + 6];
  }

  // Check for secondary chords
  const slashIndex = input.indexOf("/");
  if (slashIndex !== -1) {
    const secondary = input.slice(0, slashIndex);
    const primary = input.slice(slashIndex + 1);

    // Get a new scale based on the primary notes
    const primaryNotes = getRomanMidiValues(primary, scale);
    const isMinor = primaryNotes[1] - primaryNotes[0] === 3;
    const primaryScale = isMinor
      ? createMinorNotes(primaryNotes[0])
      : createMajorNotes(primaryNotes[0]);

    // Go to the secondary chord with the primary scale
    return getRomanMidiValues(secondary, primaryScale);
  }

  // Check for flattened chords
  if (input.startsWith("b")) {
    const notes = getRomanMidiValues(input.slice(1), scale);
    return notes.map((n) => n - 1);
  }

  // Check for sharpened chords
  if (input.startsWith("#")) {
    const notes = getRomanMidiValues(input.slice(1), scale);
    return notes.map((n) => n + 1);
  }

  // Check for major seventh chords
  if (input.endsWith("maj7")) {
    const notes = getRomanMidiValues(input.slice(0, -4), scale);
    const root = notes[0];
    return [root, root + 4, root + 7, root + 11];
  } else if (input.endsWith("M7")) {
    const notes = getRomanMidiValues(input.slice(0, -2), scale);
    const root = notes[0];
    return [root, root + 4, root + 7, root + 11];
  }

  // Check for minor seventh chords
  if (input.endsWith("m7")) {
    const notes = getRomanMidiValues(input.slice(0, -2), scale);
    const root = notes[0];
    return [root, root + 3, root + 7, root + 10];
  }

  // Check for seventh chords (minor or dominant)
  if (input.endsWith("7")) {
    const notes = getRomanMidiValues(input.slice(0, -1), scale);
    const root = notes[0];
    const isMinor = notes[1] - notes[0] === 3;
    const third = isMinor ? root + 3 : root + 4;
    return [root, third, root + 7, root + 10];
  }

  // Check for half diminished sevenths
  if (input.endsWith("7b5")) {
    const notes = getRomanMidiValues(input.slice(0, -2), scale);
    return [notes[0], notes[1], notes[2] - 1, notes[3]];
  }

  // Return an empty array if no match is found
  return [];
};

// Get the voice leading between two sets of roman numerals
export const getVoiceLeadingBetweenRomanNotes = (
  from: number[],
  to: number[]
): VoiceLeading => {
  if (from.length !== to.length) {
    return {} as VoiceLeading;
  }
  // Find the closest inversion
  let bestDist = dist(from, to);
  let bestScale = to;

  for (let i = -3; i <= 3; i++) {
    if (i === 0) continue;
    const rotated = getRotatedScale(to, i);
    const distance = dist(from, rotated);
    if (distance < bestDist) {
      bestDist = distance;
      bestScale = rotated;
    }
  }

  const classes = from.map((n) =>
    getMidiPitchClass(n)
  ) as ChromaticPitchClass[];
  const offsets = from.map((n, i) => bestScale[i] - n);
  return classes.reduce((acc, c, i) => {
    acc[c] = offsets[i];
    return acc;
  }, {} as VoiceLeading);
};

// Convert a string of roman numerals into a set of voice leadings
export const inputRomanNumerals = (input: string): VoiceLeading[] => {
  const values = input.split("-").map((v) => v.trim());
  let numerals = values.map((n) => getRomanMidiValues(n));
  const voiceLeadings = [];
  for (let i = 0; i < numerals.length - 1; i++) {
    const cur = numerals[i];
    const next = numerals[i + 1];
    const curLength = cur.length;
    const nextLength = next.length;
    // If going from triad to seventh, pop the fifth
    if (curLength === 3 && nextLength === 4) {
      numerals[i + 1] = [next[0], next[1], next[3]];
    }
    // If going from seventh to triad, add the seventh
    else if (curLength === 4 && nextLength === 3) {
      const isMajor = next[1] - next[0] === 4;
      numerals[i + 1] = [
        next[0],
        next[1],
        next[2],
        next[2] + (isMajor ? 4 : 3),
      ];
    }
    voiceLeadings.push(
      getVoiceLeadingBetweenRomanNotes(numerals[i], numerals[i + 1])
    );
  }
  return voiceLeadings;
};

// --------------------------------
// Probability Functions
// --------------------------------

export type RomanKey = `${RomanNumeral} ${RomanTonality}`;
export type RomanMap = { [key in RomanKey]?: number };
export type RomanMatrix = { [key in RomanKey]?: RomanMap };

export const ROMAN_MATRIX: RomanMatrix = {
  "I major": {
    "IV major": 0.5,
    "V major": 0.5,
  },
  "II major": {
    "V major": 1,
  },
  "IV major": {
    "V major": 0.6,
    "II major": 0.4,
  },
  "V major": {
    "I major": 0.5,
    "VI minor": 0.25,
    "V major": 0.25,
  },
  "VI minor": {
    "II minor": 0.3,
    "IV major": 0.4,
    "II major": 0.3,
  },
};
