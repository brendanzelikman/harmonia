import { Pattern } from "types/Pattern/PatternTypes";
import * as _ from "utils/duration";

export const MajorSeventhChord: Pattern = {
  id: "pattern_preset_major_7th",
  name: "Major 7th Chord",
  aliases: ["M7", "maj7", "maj 7", "maj7th", "maj 7th", "major 7", "major 7th"],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(64),
      _.createQuarterNote(67),
      _.createQuarterNote(71),
    ],
  ],
};

export const MajorSeventhShell: Pattern = {
  id: "pattern_preset_major_7th_shell",
  name: "Major 7th Third Shell",
  stream: [
    [_.createQuarterNote(60), _.createQuarterNote(64), _.createQuarterNote(71)],
  ],
};

export const MajorSeventhFifthShell: Pattern = {
  id: "pattern_preset_major_7th_fifth_shell",
  name: "Major 7th Fifth Shell",
  stream: [
    [_.createQuarterNote(60), _.createQuarterNote(67), _.createQuarterNote(71)],
  ],
};

export const MajorSeventhLydianShell: Pattern = {
  id: "pattern_preset_major_7th_lydian_shell",
  name: "Major 7th Lydian Shell",
  stream: [
    [_.createQuarterNote(60), _.createQuarterNote(66), _.createQuarterNote(71)],
  ],
};

export const MajorSeventhAddThirteenChord: Pattern = {
  id: "pattern_preset_major_7th_add_13_chord",
  name: "Major 7th (Add 13) Chord",
  aliases: ["maj7add13", "maj7 add13", "major 7th add13", "major 7th add 13"],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(64),
      _.createQuarterNote(67),
      _.createQuarterNote(69),
      _.createQuarterNote(71),
    ],
  ],
};

export const MajorNinthChord: Pattern = {
  id: "pattern_preset_major_9th_chord",
  name: "Major 9th Chord",
  aliases: ["M9", "maj9", "maj 9", "maj9th", "maj 9th", "major 9", "major 9th"],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(64),
      _.createQuarterNote(67),
      _.createQuarterNote(71),
      _.createQuarterNote(74),
    ],
  ],
};

export const MajorEleventhChord: Pattern = {
  id: "pattern_preset_major_11th_chord",
  name: "Major 11th Chord",
  aliases: [
    "M11",
    "maj11",
    "maj 11",
    "maj11th",
    "maj 11th",
    "major 11",
    "major 11th",
  ],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(64),
      _.createQuarterNote(67),
      _.createQuarterNote(71),
      _.createQuarterNote(74),
      _.createQuarterNote(77),
    ],
  ],
};

export const MajorSharpEleventhChord: Pattern = {
  id: "pattern_preset_major_#11th_chord",
  name: "Major #11th Chord",
  aliases: [
    "M#11",
    "maj#11",
    "maj #11",
    "maj#11th",
    "maj #11th",
    "major #11",
    "major #11th",
  ],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(64),
      _.createQuarterNote(67),
      _.createQuarterNote(71),
      _.createQuarterNote(74),
      _.createQuarterNote(78),
    ],
  ],
};

export const MajorThirteenthChord: Pattern = {
  id: "pattern_preset_major_13th_chord",
  name: "Major 13th Chord",
  aliases: [
    "M13",
    "maj13",
    "maj 13",
    "maj13th",
    "maj 13th",
    "major 13",
    "major 13th",
  ],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(64),
      _.createQuarterNote(67),
      _.createQuarterNote(71),
      _.createQuarterNote(74),
      _.createQuarterNote(77),
      _.createQuarterNote(81),
    ],
  ],
};

export const MajorThirteenthSharpEleventhChord: Pattern = {
  id: "pattern_preset_major_13th_#11th_chord",
  name: "Major 13th (#11) Chord",
  aliases: [
    "M13#11",
    "maj13#11",
    "maj 13#11",
    "maj13#11th",
    "maj 13#11th",
    "major 13#11",
    "major 13#11th",
    "major 13 #11",
    "major 13 # 11",
    "major 13 #11th",
    "major 13th #11",
    "major 13th #11th",
  ],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(64),
      _.createQuarterNote(67),
      _.createQuarterNote(71),
      _.createQuarterNote(74),
      _.createQuarterNote(78),
      _.createQuarterNote(81),
    ],
  ],
};

export default {
  MajorSeventhChord,
  MajorSeventhShell,
  MajorSeventhLydianShell,
  MajorSeventhFifthShell,
  MajorSeventhAddThirteenChord,
  MajorNinthChord,
  MajorEleventhChord,
  MajorSharpEleventhChord,
  MajorThirteenthChord,
  MajorThirteenthSharpEleventhChord,
};
