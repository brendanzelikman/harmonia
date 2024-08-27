import { Pattern } from "types/Pattern/PatternTypes";
import * as _ from "utils/durations";

export const Sus2Chord: Pattern = {
  id: "pattern_preset_sus2-chord",
  name: "Sus2 Chord",
  aliases: ["sus2", "sus2 chord"],
  stream: [
    [_.createQuarterNote(60), _.createQuarterNote(62), _.createQuarterNote(67)],
  ],
};
export const Major7thSus2Chord: Pattern = {
  id: "pattern_preset_major-7th-sus2-chord",
  name: "Major 7th (Sus2) Chord",
  aliases: [
    "maj7sus2",
    "maj7sus2 chord",
    "M7sus2",
    "M7sus2 chord",
    "major 7th sus2",
    "major 7th sus2 chord",
  ],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(62),
      _.createQuarterNote(67),
      _.createQuarterNote(71),
    ],
  ],
};
export const Minor7thSus2Chord: Pattern = {
  id: "pattern_preset_minor-7th-sus2-chord",
  name: "Minor 7th (Sus2) Chord",
  aliases: [
    "min7sus2",
    "min7sus2 chord",
    "m7sus2",
    "m7sus2 chord",
    "minor 7th sus2",
    "minor 7th sus2 chord",
  ],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(62),
      _.createQuarterNote(67),
      _.createQuarterNote(70),
    ],
  ],
};
export const Major6thSus2Chord: Pattern = {
  id: "pattern_preset_major-6th-sus2-chord",
  name: "Major 6th (Sus2) Chord",
  aliases: [
    "maj6sus2",
    "maj6sus2 chord",
    "M6sus2",
    "M6sus2 chord",
    "major 6th sus2",
    "major 6th sus2 chord",
  ],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(62),
      _.createQuarterNote(67),
      _.createQuarterNote(69),
    ],
  ],
};
export const Minor6thSus2Chord: Pattern = {
  id: "pattern_preset_minor-6th-sus2-chord",
  name: "Minor 6th (Sus2) Chord",
  aliases: [
    "min6sus2",
    "min6sus2 chord",
    "m6sus2",
    "m6sus2 chord",
    "minor 6th sus2",
    "minor 6th sus2 chord",
  ],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(62),
      _.createQuarterNote(67),
      _.createQuarterNote(69),
    ],
  ],
};
export const Sus4Chord: Pattern = {
  id: "pattern_preset_sus4-chord",
  name: "Sus4 Chord",
  aliases: ["sus4", "sus4 chord"],
  stream: [
    [_.createQuarterNote(60), _.createQuarterNote(65), _.createQuarterNote(67)],
  ],
};
export const Major7thSus4Chord: Pattern = {
  id: "pattern_preset_major-7th-sus4-chord",
  name: "Major 7th (Sus4) Chord",
  aliases: [
    "maj7sus4",
    "maj7sus4 chord",
    "M7sus4",
    "M7sus4 chord",
    "major 7th sus4",
    "major 7th sus4 chord",
  ],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(65),
      _.createQuarterNote(67),
      _.createQuarterNote(71),
    ],
  ],
};
export const Minor7thSus4Chord: Pattern = {
  id: "pattern_preset_minor-7th-sus4-chord",
  name: "Minor 7th (Sus4) Chord",
  aliases: [
    "min7sus4",
    "min7sus4 chord",
    "m7sus4",
    "m7sus4 chord",
    "minor 7th sus4",
    "minor 7th sus4 chord",
  ],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(65),
      _.createQuarterNote(67),
      _.createQuarterNote(70),
    ],
  ],
};
export const Major6thSus4Chord: Pattern = {
  id: "pattern_preset_major-6th-sus4-chord",
  name: "Major 6th (Sus4) Chord",
  aliases: [
    "maj6sus4",
    "maj6sus4 chord",
    "M6sus4",
    "M6sus4 chord",
    "major 6th sus4",
    "major 6th sus4 chord",
  ],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(65),
      _.createQuarterNote(67),
      _.createQuarterNote(69),
    ],
  ],
};
export const Minor6thSus4Chord: Pattern = {
  id: "pattern_preset_minor-6th-sus4-chord",
  name: "Minor 6th (Sus4) Chord",
  aliases: [
    "min6sus4",
    "min6sus4 chord",
    "m6sus4",
    "m6sus4 chord",
    "minor 6th sus4",
    "minor 6th sus4 chord",
  ],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(65),
      _.createQuarterNote(67),
      _.createQuarterNote(69),
    ],
  ],
};

export default {
  Sus2Chord,
  Sus4Chord,
  Major7thSus2Chord,
  Major7thSus4Chord,
  Minor7thSus2Chord,
  Minor7thSus4Chord,
  Major6thSus2Chord,
  Major6thSus4Chord,
  Minor6thSus2Chord,
  Minor6thSus4Chord,
};
