import { Pattern } from "types/Pattern/PatternTypes";
import * as _ from "utils/duration";

export const MajorTriad: Pattern = {
  id: "pattern_preset_major_triad",
  name: "Major Chord",
  aliases: ["triad", "maj", "maj chord", "major chord", "M", "M chord"],
  stream: [
    [_.createQuarterNote(60), _.createQuarterNote(64), _.createQuarterNote(67)],
  ],
};
export const MinorTriad: Pattern = {
  id: "pattern_preset_minor_triad",
  name: "Minor Chord",
  aliases: ["min", "min chord", "minor chord", "m", "m chord"],
  stream: [
    [_.createQuarterNote(60), _.createQuarterNote(63), _.createQuarterNote(67)],
  ],
};
export const LydianTriad: Pattern = {
  id: "pattern_preset_lydian_triad",
  name: "Lydian Triad",
  aliases: ["lydian chord"],
  stream: [
    [_.createQuarterNote(60), _.createQuarterNote(64), _.createQuarterNote(66)],
  ],
};
export const DiminishedChord: Pattern = {
  id: "pattern_preset_diminished_chord",
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
  id: "pattern_preset_augmented_chord",
  name: "Augmented Chord",
  aliases: ["aug chord", "+", "+ chord"],
  stream: [
    [_.createQuarterNote(60), _.createQuarterNote(64), _.createQuarterNote(68)],
  ],
};
export const QuartalChord: Pattern = {
  id: "pattern_preset_quartal_chord",
  name: "Quartal Chord",
  aliases: ["quartal", "quartal chord", "q", "q chord"],
  stream: [
    [_.createQuarterNote(60), _.createQuarterNote(65), _.createQuarterNote(70)],
  ],
};
export const QuintalChord: Pattern = {
  id: "pattern_preset_quintal_chord",
  name: "Quintal Chord",
  aliases: ["quintal", "quintal chord"],
  stream: [
    [_.createQuarterNote(60), _.createQuarterNote(67), _.createQuarterNote(74)],
  ],
};

export const PowerChord: Pattern = {
  id: "pattern_preset_power_chord",
  name: "Power Chord",
  aliases: ["5", "5 chord"],
  stream: [
    [_.createQuarterNote(60), _.createQuarterNote(67), _.createQuarterNote(72)],
  ],
};

export default {
  MajorTriad,
  MinorTriad,
  LydianTriad,
  DiminishedChord,
  AugmentedChord,
  QuartalChord,
  QuintalChord,
  PowerChord,
};
