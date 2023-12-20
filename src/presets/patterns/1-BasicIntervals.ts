import { Pattern } from "types/Pattern";
import * as _ from "utils/durations";

export const Note: Pattern = {
  id: "note",
  name: "Note",
  stream: [_.createQuarterNote(60)],
};

export const Unison: Pattern = {
  id: "unison",
  name: "Unison",
  stream: [[_.createQuarterNote(60), _.createQuarterNote(60)]],
};

export const MinorSecond: Pattern = {
  id: "minor-second",
  name: "Minor Second",
  aliases: ["m2", "minor 2nd", "minor second"],
  stream: [[_.createQuarterNote(60), _.createQuarterNote(61)]],
};

export const MajorSecond: Pattern = {
  id: "major-second",
  name: "Major Second",
  aliases: ["M2", "major 2nd", "major second"],
  stream: [[_.createQuarterNote(60), _.createQuarterNote(62)]],
};

export const MinorThird: Pattern = {
  id: "minor-third",
  name: "Minor Third",
  aliases: ["m3", "minor 3rd", "minor third"],
  stream: [[_.createQuarterNote(60), _.createQuarterNote(63)]],
};

export const MajorThird: Pattern = {
  id: "major-third",
  name: "Major Third",
  aliases: ["M3", "major 3rd", "major third"],
  stream: [[_.createQuarterNote(60), _.createQuarterNote(64)]],
};

export const PerfectFourth: Pattern = {
  id: "perfect-fourth",
  name: "Perfect Fourth",
  aliases: ["P4", "perfect 4th", "perfect fourth"],
  stream: [[_.createQuarterNote(60), _.createQuarterNote(65)]],
};

export const Tritone: Pattern = {
  id: "tritone",
  name: "Tritone",
  aliases: ["augmented fourth", "diminished fifth"],
  stream: [[_.createQuarterNote(60), _.createQuarterNote(66)]],
};

export const PerfectFifth: Pattern = {
  id: "perfect-fifth",
  name: "Perfect Fifth",
  aliases: ["P5", "perfect 5th", "perfect fifth"],
  stream: [[_.createQuarterNote(60), _.createQuarterNote(67)]],
};

export const MinorSixth: Pattern = {
  id: "minor-sixth",
  name: "Minor Sixth",
  aliases: ["m6", "minor 6th", "minor sixth"],
  stream: [[_.createQuarterNote(60), _.createQuarterNote(68)]],
};

export const MajorSixth: Pattern = {
  id: "major-sixth",
  name: "Major Sixth",
  aliases: ["M6", "major 6th", "major sixth"],
  stream: [[_.createQuarterNote(60), _.createQuarterNote(69)]],
};

export const MinorSeventh: Pattern = {
  id: "minor-seventh",
  name: "Minor Seventh",
  aliases: ["m7", "minor 7th", "minor seventh"],
  stream: [[_.createQuarterNote(60), _.createQuarterNote(70)]],
};

export const MajorSeventh: Pattern = {
  id: "major-seventh",
  name: "Major Seventh",
  aliases: ["M7", "major 7th", "major seventh"],
  stream: [[_.createQuarterNote(60), _.createQuarterNote(71)]],
};

export const Octave: Pattern = {
  id: "octave",
  name: "Octave",
  aliases: ["P8", "perfect 8th", "perfect octave"],
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
