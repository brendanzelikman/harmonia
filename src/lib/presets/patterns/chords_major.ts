import { Pattern } from "types/Pattern/PatternTypes";
import * as _ from "utils/duration";

export const MajorChord: Pattern = {
  id: "pattern_preset_major-chord",
  name: "Major Chord",
  aliases: ["maj", "maj chord", "major chord", "M", "M chord"],
  stream: [
    [_.createQuarterNote(60), _.createQuarterNote(64), _.createQuarterNote(67)],
  ],
};

export const MajorTrichord: Pattern = {
  id: "pattern_preset_major-trichord",
  name: "Major Trichord",
  aliases: ["major-trichord"],
  stream: [
    [_.createQuarterNote(60), _.createQuarterNote(62), _.createQuarterNote(64)],
  ],
};

export const MajorTetrachord: Pattern = {
  id: "pattern_preset_major-tetrachord",
  name: "Major Tetrachord",
  aliases: ["major-tetrachord"],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(62),
      _.createQuarterNote(64),
      _.createQuarterNote(65),
    ],
  ],
};

export const MajorPentachord: Pattern = {
  id: "pattern_preset_major-pentachord",
  name: "Major Pentachord",
  aliases: ["major-pentachord"],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(62),
      _.createQuarterNote(64),
      _.createQuarterNote(65),
      _.createQuarterNote(67),
    ],
  ],
};

export const MajorHexachord: Pattern = {
  id: "pattern_preset_major-hexachord",
  name: "Major Hexachord",
  aliases: ["major-hexachord"],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(62),
      _.createQuarterNote(64),
      _.createQuarterNote(65),
      _.createQuarterNote(67),
      _.createQuarterNote(69),
    ],
  ],
};

export const MajorHeptachord: Pattern = {
  id: "pattern_preset_major_heptachord",
  name: "Major Heptachord",
  aliases: ["major-heptachord"],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(62),
      _.createQuarterNote(64),
      _.createQuarterNote(65),
      _.createQuarterNote(67),
      _.createQuarterNote(69),
      _.createQuarterNote(71),
    ],
  ],
};

export const MajorAdd2Chord: Pattern = {
  id: "pattern_preset_major-add2-chord",
  name: "Major Add 2 Chord",
  aliases: ["majadd2", "maj add2", "major add2"],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(62),
      _.createQuarterNote(64),
      _.createQuarterNote(67),
    ],
  ],
};

export const MajorAddFlat2Chord: Pattern = {
  id: "pattern_preset_major-add-b2-chord",
  name: "Major Add b2 Chord",
  aliases: ["majaddb2", "maj addb2", "major addb2"],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(61),
      _.createQuarterNote(64),
      _.createQuarterNote(67),
    ],
  ],
};

export const MajorAddFlat3Chord: Pattern = {
  id: "pattern_preset_major-add-b3-chord",
  name: "Major Add b3 Chord",
  aliases: ["majaddb3", "maj addb3", "major addb3"],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(63),
      _.createQuarterNote(64),
      _.createQuarterNote(67),
    ],
  ],
};

export const MajorAdd4Chord: Pattern = {
  id: "pattern_preset_major-add-4-chord",
  name: "Major Add 4 Chord",
  aliases: ["majadd4", "maj add4", "major add4"],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(64),
      _.createQuarterNote(65),
      _.createQuarterNote(67),
    ],
  ],
};

export const MajorAddSharp4Chord: Pattern = {
  id: "pattern_preset_major-add-#4-chord",
  name: "Major Add #4 Chord",
  aliases: ["majadd#4", "maj add#4", "major add#4"],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(64),
      _.createQuarterNote(66),
      _.createQuarterNote(67),
    ],
  ],
};

export default {
  MajorChord,
  MajorAddFlat2Chord,
  MajorAdd2Chord,
  MajorAddFlat3Chord,
  MajorAdd4Chord,
  MajorAddSharp4Chord,
  MajorTrichord,
  MajorTetrachord,
  MajorPentachord,
  MajorHexachord,
  MajorHeptachord,
};
