import { Pattern } from "types/Pattern/PatternTypes";
import * as _ from "utils/duration";

export const Note: Pattern = {
  id: "pattern_preset_note",
  name: "Note",
  stream: [_.createQuarterNote(60)],
};

export const Unison: Pattern = {
  id: "pattern_preset_unison",
  name: "Unison",
  stream: [[_.createQuarterNote(60), _.createQuarterNote(60)]],
};

export const MinorSecond: Pattern = {
  id: "pattern_preset_minor-second",
  name: "Minor Second",
  aliases: ["minor 2nd", "minor second"],
  stream: [[_.createQuarterNote(60), _.createQuarterNote(61)]],
};

export const MajorSecond: Pattern = {
  id: "pattern_preset_major-second",
  name: "Major Second",
  aliases: ["major 2nd", "major second"],
  stream: [[_.createQuarterNote(60), _.createQuarterNote(62)]],
};

export const MinorThird: Pattern = {
  id: "pattern_preset_minor-third",
  name: "Minor Third",
  aliases: ["minor 3rd", "minor third"],
  stream: [[_.createQuarterNote(60), _.createQuarterNote(63)]],
};

export const MajorThird: Pattern = {
  id: "pattern_preset_major-third",
  name: "Major Third",
  aliases: ["major 3rd", "major third"],
  stream: [[_.createQuarterNote(60), _.createQuarterNote(64)]],
};

export const PerfectFourth: Pattern = {
  id: "pattern_preset_perfect-fourth",
  name: "Perfect Fourth",
  aliases: ["perfect 4th", "perfect fourth"],
  stream: [[_.createQuarterNote(60), _.createQuarterNote(65)]],
};

export const Tritone: Pattern = {
  id: "pattern_preset_tritone",
  name: "Tritone",
  aliases: ["augmented fourth", "diminished fifth"],
  stream: [[_.createQuarterNote(60), _.createQuarterNote(66)]],
};

export const PerfectFifth: Pattern = {
  id: "pattern_preset_perfect-fifth",
  name: "Perfect Fifth",
  aliases: ["perfect 5th", "perfect fifth"],
  stream: [[_.createQuarterNote(60), _.createQuarterNote(67)]],
};

export const MinorSixth: Pattern = {
  id: "pattern_preset_minor-sixth",
  name: "Minor Sixth",
  aliases: ["minor 6th", "minor sixth"],
  stream: [[_.createQuarterNote(60), _.createQuarterNote(68)]],
};

export const MajorSixth: Pattern = {
  id: "pattern_preset_major-sixth",
  name: "Major Sixth",
  aliases: ["M6", "major 6th", "major sixth"],
  stream: [[_.createQuarterNote(60), _.createQuarterNote(69)]],
};

export const MinorSeventh: Pattern = {
  id: "pattern_preset_minor-seventh",
  name: "Minor Seventh",
  aliases: ["minor 7th", "minor seventh"],
  stream: [[_.createQuarterNote(60), _.createQuarterNote(70)]],
};

export const MajorSeventh: Pattern = {
  id: "pattern_preset_major-seventh",
  name: "Major Seventh",
  aliases: ["major 7th", "major seventh"],
  stream: [[_.createQuarterNote(60), _.createQuarterNote(71)]],
};

export const Octave: Pattern = {
  id: "pattern_preset_octave",
  name: "Octave",
  aliases: ["perfect 8th", "perfect octave"],
  stream: [[_.createQuarterNote(60), _.createQuarterNote(72)]],
};

export default {
  Note,
  Unison,
  MinorSecond,
  MajorSecond,
  MinorThird,
  MajorThird,
  PerfectFourth,
  Tritone,
  PerfectFifth,
  MinorSixth,
  MajorSixth,
  MinorSeventh,
  MajorSeventh,
  Octave,
};
