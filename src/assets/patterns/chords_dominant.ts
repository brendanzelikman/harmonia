import { Pattern } from "types/Pattern/PatternTypes";
import * as _ from "utils/duration";

export const Major7thFlat5Chord: Pattern = {
  id: "pattern_preset_major-7th-b5-chord",
  name: "Major 7b5 Chord",
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
  name: "Dominant 7b5 Chord",
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
  name: "Dominant 7#5 Chord",
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
export const Dominant9thChord: Pattern = {
  id: "pattern_preset_dominant-9th-chord",
  name: "Dominant 9th Chord",
  aliases: [
    "dom9",
    "dom9 chord",
    "9",
    "9 chord",
    "dominant 9th",
    "dominant 9th chord",
  ],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(64),
      _.createQuarterNote(67),
      _.createQuarterNote(70),
      _.createQuarterNote(74),
    ],
  ],
};
export const Dominant11thChord: Pattern = {
  id: "pattern_preset_dominant-11th-chord",
  name: "Dominant 11th Chord",
  aliases: [
    "dom11",
    "dom11 chord",
    "11",
    "11 chord",
    "dominant 11th",
    "dominant 11th chord",
  ],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(64),
      _.createQuarterNote(67),
      _.createQuarterNote(70),
      _.createQuarterNote(74),
      _.createQuarterNote(77),
    ],
  ],
};
export const Dominant7thFlat9Chord: Pattern = {
  id: "pattern_preset_dominant-7th-b9-chord",
  name: "Dominant 7b9 Chord",
  aliases: [
    "dom7b9",
    "dom7b9 chord",
    "7b9",
    "7b9 chord",
    "dominant 7th flat 9",
    "dominant 7th flat 9 chord",
    "dominant 7th b9",
    "dominant 7th b9 chord",
  ],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(63),
      _.createQuarterNote(67),
      _.createQuarterNote(70),
      _.createQuarterNote(72),
    ],
  ],
};
export const Dominant7thSharp9Chord: Pattern = {
  id: "pattern_preset_dominant-7th-#9-chord",
  name: "Dominant 7#9 Chord",
  aliases: [
    "dom7#9",
    "dom7#9 chord",
    "7#9",
    "7#9 chord",
    "dominant 7th sharp 9",
    "dominant 7th sharp 9 chord",
    "dominant 7th #9",
    "dominant 7th #9 chord",
  ],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(64),
      _.createQuarterNote(67),
      _.createQuarterNote(70),
      _.createQuarterNote(74),
    ],
  ],
};
export const Dominant7thFlat13Chord: Pattern = {
  id: "pattern_preset_dominant-7th-b13-chord",
  name: "Dominant 7b13 Chord",
  aliases: [
    "dom7b13",
    "dom7b13 chord",
    "7b13",
    "7b13 chord",
    "dominant 7th flat 13",
    "dominant 7th flat 13 chord",
    "dominant 7th b13",
    "dominant 7th b13 chord",
  ],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(64),
      _.createQuarterNote(67),
      _.createQuarterNote(70),
      _.createQuarterNote(73),
    ],
  ],
};
export const Dominant7thSharp11Chord: Pattern = {
  id: "pattern_preset_dominant-7th-sharp11-chord",
  name: "Dominant 7#11 Chord",
  aliases: [
    "dom7#11",
    "dom7#11 chord",
    "7#11",
    "7#11 chord",
    "dominant 7th sharp 11",
    "dominant 7th sharp 11 chord",
    "dominant 7th #11",
    "dominant 7th #11 chord",
  ],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(64),
      _.createQuarterNote(67),
      _.createQuarterNote(70),
      _.createQuarterNote(74),
      _.createQuarterNote(78),
    ],
  ],
};
export const Dominant13thChord: Pattern = {
  id: "pattern_preset_dominant-13th-chord",
  name: "Dominant 13th Chord",
  aliases: [
    "dom13",
    "dom13 chord",
    "13",
    "13 chord",
    "dominant 13th",
    "dominant 13th chord",
  ],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(64),
      _.createQuarterNote(67),
      _.createQuarterNote(70),
      _.createQuarterNote(74),
      _.createQuarterNote(77),
      _.createQuarterNote(81),
    ],
  ],
};

export const Minor7thFlat5Chord: Pattern = {
  id: "pattern_preset_minor-7th-b5-chord",
  name: "Half Diminished Chord",
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
export const MinorMajor9thChord: Pattern = {
  id: "pattern_preset_minor-major-9th-chord",
  name: "Minor Major 9th Chord",
  aliases: [
    "minmaj9",
    "minmaj9 chord",
    "mM9",
    "mM9 chord",
    "minor major 9th",
    "minor major 9th chord",
  ],
  stream: [
    [
      _.createQuarterNote(60),
      _.createQuarterNote(63),
      _.createQuarterNote(67),
      _.createQuarterNote(71),
      _.createQuarterNote(74),
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
  MinorMajor9thChord,
  Dominant7thChord,
  Dominant7thNo5Chord,
  Dominant7thFlat5Chord,
  Dominant7thSharp5Chord,
  Dominant7thFlat9Chord,
  Dominant7thSharp9Chord,
  Dominant7thFlat13Chord,
  Dominant7thSharp11Chord,
  Dominant9thChord,
  Dominant11thChord,
  Dominant13thChord,
  Diminished7thChord,
  Augmented7thChord,
  SevenSixChord,
  MinorSevenSixChord,
};
