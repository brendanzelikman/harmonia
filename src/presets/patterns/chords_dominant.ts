import { Pattern } from "types/Pattern/PatternTypes";
import * as _ from "utils/durations";

export const Major7thFlat5Chord: Pattern = {
  id: "pattern_preset_major-7th-b5-chord",
  name: "Major 7th (b5) Chord",
  aliases: [
    "maj7b5",
    "maj7b5 chord",
    "M7b5",
    "M7b5 chord",
    "major 7th flat 5",
    "major 7th flat 5 chord",
    "major 7th b5",
    "major 7th b5 chord",
  ],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(64),
      _.createQuarterNote(66),
      _.createQuarterNote(71),
    ],
  ],
};
export const Dominant7thChord: Pattern = {
  id: "pattern_preset_dominant-7th-chord",
  name: "Dominant 7th Chord",
  aliases: [
    "dom7",
    "dom7 chord",
    "7",
    "7 chord",
    "dominant 7th",
    "dominant 7th chord",
  ],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(64),
      _.createQuarterNote(67),
      _.createQuarterNote(70),
    ],
  ],
};

export const Dominant7thNo5Chord: Pattern = {
  id: "pattern_preset_dominant-7th-no-5-chord",
  name: "Dominant 7th (No 5) Chord",
  aliases: [
    "dom7no5",
    "dom7no5 chord",
    "7no5",
    "7no5 chord",
    "dominant 7th no 5",
    "dominant 7th no 5 chord",
    "dominant 7th no5",
    "dominant 7th no5 chord",
  ],
  stream: [
    [_.createQuarterNote(60), _.createQuarterNote(64), _.createQuarterNote(70)],
  ],
};

export const Dominant7thFlat5Chord: Pattern = {
  id: "pattern_preset_dominant-7th-b5-chord",
  name: "Dominant 7th (b5) Chord",
  aliases: [
    "dom7b5",
    "dom7b5 chord",
    "7b5",
    "7b5 chord",
    "dominant 7th flat 5",
    "dominant 7th flat 5 chord",
    "dominant 7th b5",
    "dominant 7th b5 chord",
  ],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(64),
      _.createQuarterNote(66),
      _.createQuarterNote(70),
    ],
  ],
};
export const Dominant7thSharp5Chord: Pattern = {
  id: "pattern_preset_dominant-7th-#5-chord",
  name: "Dominant 7th (#5) Chord",
  aliases: [
    "dom7#5",
    "dom7#5 chord",
    "7#5",
    "7#5 chord",
    "dominant 7th sharp 5",
    "dominant 7th sharp 5 chord",
    "dominant 7th #5",
    "dominant 7th #5 chord",
  ],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(64),
      _.createQuarterNote(68),
      _.createQuarterNote(70),
    ],
  ],
};
export const Minor7thFlat5Chord: Pattern = {
  id: "pattern_preset_minor-7th-b5-chord",
  name: "Minor 7th (b5) Chord",
  aliases: [
    "min7b5",
    "min7b5 chord",
    "m7b5",
    "m7b5 chord",
    "minor 7th flat 5",
    "minor 7th flat 5 chord",
    "minor 7th b5",
    "minor 7th b5 chord",
  ],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(63),
      _.createQuarterNote(66),
      _.createQuarterNote(70),
    ],
  ],
};
export const MinorMajor7thChord: Pattern = {
  id: "pattern_preset_minor-major-7th-chord",
  name: "Minor Major 7th Chord",
  aliases: [
    "minmaj7",
    "minmaj7 chord",
    "mM7",
    "mM7 chord",
    "minor major 7th",
    "minor major 7th chord",
  ],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(63),
      _.createQuarterNote(67),
      _.createQuarterNote(71),
    ],
  ],
};
export const Diminished7thChord: Pattern = {
  id: "pattern_preset_diminished-7th-chord",
  name: "Diminished 7th Chord",
  aliases: [
    "dim7",
    "dim7 chord",
    "o7",
    "o7 chord",
    "diminished 7th",
    "diminished 7th chord",
  ],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(63),
      _.createQuarterNote(66),
      _.createQuarterNote(69),
    ],
  ],
};

export const Augmented7thChord: Pattern = {
  id: "pattern_preset_augmented-7th-chord",
  name: "Augmented 7th Chord",
  aliases: [
    "aug7",
    "aug7 chord",
    "+7",
    "+7 chord",
    "augmented 7th",
    "augmented 7th chord",
    "maj7#5",
    "maj7#5 chord",
    "M7#5",
    "M7#5 chord",
    "major 7th sharp 5",
    "major 7th sharp 5 chord",
  ],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(64),
      _.createQuarterNote(68),
      _.createQuarterNote(71),
    ],
  ],
};

export const MinorSevenSixChord: Pattern = {
  id: "pattern_preset_minor7-6-chord",
  name: "Minor 7-6 Chord",
  aliases: ["m7-6", "m7-6 chord"],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(63),
      _.createQuarterNote(67),
      _.createQuarterNote(69),
      _.createQuarterNote(70),
    ],
  ],
};

export const SevenSixChord: Pattern = {
  id: "pattern_preset_7-6-chord",
  name: "7-6 Chord",
  aliases: ["7-6", "7-6 chord"],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(64),
      _.createQuarterNote(67),
      _.createQuarterNote(69),
      _.createQuarterNote(70),
    ],
  ],
};

export default {
  Major7thFlat5Chord,
  Minor7thFlat5Chord,
  MinorMajor7thChord,
  Dominant7thChord,
  Dominant7thNo5Chord,
  Dominant7thFlat5Chord,
  Dominant7thSharp5Chord,
  Diminished7thChord,
  Augmented7thChord,
  SevenSixChord,
  MinorSevenSixChord,
};
