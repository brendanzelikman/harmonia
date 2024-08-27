import { Key, MIDI, PitchClass } from "types/units";
import { getMidiChromaticNumber } from "./midi";
import { ChromaticKey } from "presets/keys";

/** The list of possible spellings for each note of the chromatic scale. */
export const CHROMATIC_SPELLINGS: PitchClass[][] = [
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

// ------------------------------------------------------------
// Pitch Class Helpers
// ------------------------------------------------------------

/** Sort the list of pitch classes by chromatic number. */
export const getSortedPitchClasses = (pitches: PitchClass[]) => {
  return [...new Set(pitches)].sort(
    (a, b) => getMidiChromaticNumber(a) - getMidiChromaticNumber(b)
  );
};

/** Raise a pitch class by sharpening it.  */
export const getRaisedPitchClass = (pitchClass: PitchClass) => {
  if (pitchClass === "C") return "C#";
  if (pitchClass === "D") return "D#";
  if (pitchClass === "E") return "E#";
  if (pitchClass === "F") return "F#";
  if (pitchClass === "G") return "G#";
  if (pitchClass === "A") return "A#";
  if (pitchClass === "B") return "B#";

  if (pitchClass === "C#") return "C##";
  if (pitchClass === "D#") return "D##";
  if (pitchClass === "E#") return "E";
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
export const getLoweredPitchClass = (pitchClass: PitchClass) => {
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

/** Get the pitch of the note that is the closest to the given note in the array. */
export const getClosestPitchClass = (arr: MIDI[], midi: MIDI, key?: Key) => {
  const note = midi % 12;
  const notes = arr.map((n) => getMidiChromaticNumber(n));

  // Get the closest chromatic number
  const index = notes.reduce((prev, curr) => {
    // Check the distance to the note
    const currDiff = Math.abs(curr - note);
    const prevDiff = Math.abs(prev - note);
    const isEqual = currDiff === prevDiff;
    if (!isEqual) return currDiff < prevDiff ? curr : prev;

    // If the difference is equal, prefer the note not in the given pitches
    const currInPitches = key?.includes(ChromaticKey[curr]);
    const prevInPitches = key?.includes(ChromaticKey[prev]);
    if (currInPitches && !prevInPitches) return prev;
    if (!currInPitches && prevInPitches) return curr;

    // If both are in the pitches, prefer the note that is closer to the pitches
    const currDiffToPitches = key?.reduce((prev, currPitch) => {
      const currDiff = Math.abs(curr - getMidiChromaticNumber(currPitch));
      return currDiff < prev ? currDiff : prev;
    }, Infinity);
    const prevDiffToPitches = key?.reduce((prev, currPitch) => {
      const currDiff = Math.abs(prev - getMidiChromaticNumber(currPitch));
      return currDiff < prev ? currDiff : prev;
    }, Infinity);
    if (currDiffToPitches && !prevDiffToPitches) return prev;
    if (!currDiffToPitches && prevDiffToPitches) return curr;

    // If both are the same distance to the pitches, choose a random note
    return Math.random() < 0.5 ? curr : prev;
  }, -1);

  // Find the closest pitch class
  const pitchClass = ChromaticKey[index];
  if (!pitchClass) throw new Error("Pitch class not found");

  // Return the pitch class
  return pitchClass;
};
