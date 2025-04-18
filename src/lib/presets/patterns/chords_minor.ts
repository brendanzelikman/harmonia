import { Pattern } from "types/Pattern/PatternTypes";
import * as _ from "utils/duration";

export const MinorChord: Pattern = {
  id: "pattern_preset_minor-chord",
  name: "Minor Chord",
  aliases: ["min", "min chord", "minor chord", "m", "m chord"],
  stream: [
    [_.createQuarterNote(60), _.createQuarterNote(63), _.createQuarterNote(67)],
  ],
};

export const MinorTrichord: Pattern = {
  id: "pattern_preset_minor-trichord",
  name: "Minor Trichord",
  aliases: ["minor-trichord"],
  stream: [
    [_.createQuarterNote(60), _.createQuarterNote(62), _.createQuarterNote(63)],
  ],
};

export const MinorTetrachord: Pattern = {
  id: "pattern_preset_minor-tetrachord",
  name: "Minor Tetrachord",
  aliases: ["minor-tetrachord"],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(62),
      _.createQuarterNote(63),
      _.createQuarterNote(65),
    ],
  ],
};

export const MinorPentachord: Pattern = {
  id: "pattern_preset_minor-pentachord",
  name: "Minor Pentachord",
  aliases: ["minor-pentachord"],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(62),
      _.createQuarterNote(63),
      _.createQuarterNote(65),
      _.createQuarterNote(67),
    ],
  ],
};

export const MinorHexachord: Pattern = {
  id: "pattern_preset_minor_hexachord",
  name: "Minor Hexachord",
  aliases: ["minor-hexachord"],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(62),
      _.createQuarterNote(63),
      _.createQuarterNote(65),
      _.createQuarterNote(67),
      _.createQuarterNote(68),
    ],
  ],
};

export const MinorHeptachord: Pattern = {
  id: "pattern_preset_minor_heptachord",
  name: "Minor Heptachord",
  aliases: ["minor-heptachord"],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(62),
      _.createQuarterNote(63),
      _.createQuarterNote(65),
      _.createQuarterNote(67),
      _.createQuarterNote(68),
      _.createQuarterNote(70),
    ],
  ],
};

export const MinorAddFlat2Chord: Pattern = {
  id: "pattern_preset_minor-addb2-chord",
  name: "Minor Add b2 Chord",
  aliases: ["minaddb2", "min addb2", "minor addb2"],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(61),
      _.createQuarterNote(63),
      _.createQuarterNote(67),
    ],
  ],
};

export const MinorAdd2Chord: Pattern = {
  id: "pattern_preset_minor-add2-chord",
  name: "Minor Add 2 Chord",
  aliases: ["minadd2", "min add2", "minor add2"],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(62),
      _.createQuarterNote(63),
      _.createQuarterNote(67),
    ],
  ],
};

export const MinorAdd4Chord: Pattern = {
  id: "pattern_preset_minor-add4-chord",
  name: "Minor Add 4 Chord",
  aliases: ["minadd4", "min add4", "minor add4"],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(63),
      _.createQuarterNote(65),
      _.createQuarterNote(67),
    ],
  ],
};

export const MinorAddSharp4Chord: Pattern = {
  id: "pattern_preset_minor-add#4-chord",
  name: "Minor Add #4 Chord",
  aliases: ["minadd#4", "min add#4", "minor add#4"],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(63),
      _.createQuarterNote(66),
      _.createQuarterNote(67),
    ],
  ],
};

export default {
  MinorChord,
  MinorAddFlat2Chord,
  MinorAdd2Chord,
  MinorAdd4Chord,
  MinorAddSharp4Chord,
  MinorTrichord,
  MinorTetrachord,
  MinorPentachord,
  MinorHexachord,
  MinorHeptachord,
};
