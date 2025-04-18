import { Pattern } from "types/Pattern/PatternTypes";
import * as _ from "utils/duration";

export const MinorSeventhChord: Pattern = {
  id: "pattern_preset_minor-7th-chord",
  name: "Minor 7th Chord",
  aliases: ["m7", "min7", "min 7", "min7th", "min 7th", "minor 7", "minor 7th"],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(63),
      _.createQuarterNote(67),
      _.createQuarterNote(70),
    ],
  ],
};

export const MinorSeventhThirdShell: Pattern = {
  id: "pattern_preset_minor-7th-shell",
  name: "Minor 7th Third Shell",
  stream: [
    [_.createQuarterNote(60), _.createQuarterNote(63), _.createQuarterNote(70)],
  ],
};

export const MinorSeventhFifthShell: Pattern = {
  id: "pattern_preset_minor-7th-fifth-shell",
  name: "Minor 7th Fifth Shell",
  stream: [
    [_.createQuarterNote(60), _.createQuarterNote(67), _.createQuarterNote(70)],
  ],
};

export const MinorSeventhAddThirteen: Pattern = {
  id: "pattern_preset_minor-7th-add-13",
  name: "Minor 7th (Add 13)",
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(63),
      _.createQuarterNote(67),
      _.createQuarterNote(68),
      _.createQuarterNote(70),
    ],
  ],
};

export const MinorNinthChord: Pattern = {
  id: "pattern_preset_minor-9th-chord",
  name: "Minor 9th Chord",
  aliases: ["m9", "min9", "min 9", "min9th", "min 9th", "minor 9", "minor 9th"],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(63),
      _.createQuarterNote(67),
      _.createQuarterNote(70),
      _.createQuarterNote(74),
    ],
  ],
};

export const MinorFlatNinthChord: Pattern = {
  id: "pattern_preset_minor-b9th-chord",
  name: "Minor b9th Chord",
  aliases: [
    "mb9",
    "minb9",
    "min b9",
    "minb9th",
    "min b9th",
    "minor b9",
    "minor b9th",
  ],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(63),
      _.createQuarterNote(67),
      _.createQuarterNote(70),
      _.createQuarterNote(73),
    ],
  ],
};

export const MinorEleventhChord: Pattern = {
  id: "pattern_preset_minor-11th-chord",
  name: "Minor 11th Chord",
  aliases: [
    "m11",
    "min11",
    "min 11",
    "min11th",
    "min 11th",
    "minor 11",
    "minor 11th",
  ],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(63),
      _.createQuarterNote(67),
      _.createQuarterNote(70),
      _.createQuarterNote(74),
      _.createQuarterNote(77),
    ],
  ],
};

export const MinorEleventhFlatNinthChord: Pattern = {
  id: "pattern_preset_minor-11th-b9th-chord",
  name: "Minor 11th (b9) Chord",
  aliases: [
    "min11b9",
    "min 11 b9",
    "min11thb9th",
    "min 11th b9th",
    "minor 11 b9",
    "minor 11th b9th",
  ],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(63),
      _.createQuarterNote(67),
      _.createQuarterNote(70),
      _.createQuarterNote(73),
      _.createQuarterNote(77),
    ],
  ],
};

export const MinorThirteenthChord: Pattern = {
  id: "pattern_preset_minor-13th-chord",
  name: "Minor 13th Chord",
  aliases: [
    "m13",
    "min13",
    "min 13",
    "min13th",
    "min 13th",
    "minor 13",
    "minor 13th",
  ],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(63),
      _.createQuarterNote(67),
      _.createQuarterNote(70),
      _.createQuarterNote(74),
      _.createQuarterNote(77),
      _.createQuarterNote(81),
    ],
  ],
};

export const MinorThirteenthPhrygianChord: Pattern = {
  id: "pattern_preset_minor-13th-phrygian-chord",
  name: "Minor b13th (b9) Chord",
  aliases: [
    "m13b9",
    "m13b9th",
    "min13phryg",
    "min 13 phryg",
    "min13thphrygian",
    "min 13th phrygian",
    "minor 13 phryg",
    "minor 13th phrygian",
  ],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(63),
      _.createQuarterNote(67),
      _.createQuarterNote(70),
      _.createQuarterNote(73),
      _.createQuarterNote(77),
      _.createQuarterNote(80),
    ],
  ],
};

export default {
  MinorSeventhChord,
  MinorSeventhThirdShell,
  MinorSeventhFifthShell,
  MinorNinthChord,
  MinorFlatNinthChord,
  MinorEleventhChord,
  MinorEleventhFlatNinthChord,
  MinorThirteenthChord,
  MinorSeventhAddThirteen,
  MinorThirteenthPhrygianChord,
};
