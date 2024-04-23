import { Pattern } from "types/Pattern";
import * as _ from "utils/durations";

export const MajorChord: Pattern = {
  id: "preset-major-chord",
  name: "Major Chord",
  aliases: ["maj", "maj chord", "major", "major chord", "M", "M chord"],
  stream: [
    [_.createQuarterNote(60), _.createQuarterNote(64), _.createQuarterNote(67)],
  ],
};
export const MinorChord: Pattern = {
  id: "preset-minor-chord",
  name: "Minor Chord",
  aliases: ["min", "min chord", "minor", "minor chord", "m", "m chord"],
  stream: [
    [_.createQuarterNote(60), _.createQuarterNote(63), _.createQuarterNote(67)],
  ],
};
export const DiminishedChord: Pattern = {
  id: "preset-diminished-chord",
  name: "Diminished Chord",
  aliases: [
    "dim",
    "dim chord",
    "diminished",
    "diminished chord",
    "o",
    "o chord",
  ],
  stream: [
    [_.createQuarterNote(60), _.createQuarterNote(63), _.createQuarterNote(66)],
  ],
};
export const AugmentedChord: Pattern = {
  id: "preset-augmented-chord",
  name: "Augmented Chord",
  aliases: ["aug", "aug chord", "+", "+ chord"],
  stream: [
    [_.createQuarterNote(60), _.createQuarterNote(64), _.createQuarterNote(68)],
  ],
};
export const Sus2Chord: Pattern = {
  id: "preset-sus2-chord",
  name: "Sus2 Chord",
  aliases: ["sus2", "sus2 chord"],
  stream: [
    [_.createQuarterNote(60), _.createQuarterNote(62), _.createQuarterNote(67)],
  ],
};
export const Sus4Chord: Pattern = {
  id: "preset-sus4-chord",
  name: "Sus4 Chord",
  aliases: ["sus4", "sus4 chord"],
  stream: [
    [_.createQuarterNote(60), _.createQuarterNote(65), _.createQuarterNote(67)],
  ],
};
export const QuartalChord: Pattern = {
  id: "preset-quartal-chord",
  name: "Quartal Chord",
  aliases: ["quartal", "quartal chord", "q", "q chord"],
  stream: [
    [_.createQuarterNote(60), _.createQuarterNote(65), _.createQuarterNote(70)],
  ],
};
export const QuintalChord: Pattern = {
  id: "preset-quintal-chord",
  name: "Quintal Chord",
  aliases: ["quintal", "quintal chord"],
  stream: [
    [_.createQuarterNote(60), _.createQuarterNote(67), _.createQuarterNote(74)],
  ],
};

export const PowerChord: Pattern = {
  id: "preset-power-chord",
  name: "Power Chord",
  aliases: ["5", "5 chord"],
  stream: [
    [_.createQuarterNote(60), _.createQuarterNote(67), _.createQuarterNote(72)],
  ],
};

export default {
  MajorChord,
  MinorChord,
  DiminishedChord,
  AugmentedChord,
  Sus2Chord,
  Sus4Chord,
  QuartalChord,
  QuintalChord,
  PowerChord,
};
