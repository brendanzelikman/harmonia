import { MIDI, Pattern } from "types";

export const Major7thChord: Pattern = {
  id: "major-7th-chord",
  name: "Major 7th Chord",
  aliases: [
    "maj7",
    "maj7 chord",
    "M7",
    "M7 chord",
    "major 7th",
    "major 7th chord",
  ],
  stream: [
    [
      MIDI.createQuarterNote(60),
      MIDI.createQuarterNote(64),
      MIDI.createQuarterNote(67),
      MIDI.createQuarterNote(71),
    ],
  ],
};
export const Major7thSus2Chord: Pattern = {
  id: "major-7th-sus2-chord",
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
      MIDI.createQuarterNote(60),
      MIDI.createQuarterNote(62),
      MIDI.createQuarterNote(67),
      MIDI.createQuarterNote(71),
    ],
  ],
};
export const Major7thSus4Chord: Pattern = {
  id: "major-7th-sus4-chord",
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
      MIDI.createQuarterNote(60),
      MIDI.createQuarterNote(65),
      MIDI.createQuarterNote(67),
      MIDI.createQuarterNote(71),
    ],
  ],
};
export const Major7thFlat5Chord: Pattern = {
  id: "major-7th-b5-chord",
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
      MIDI.createQuarterNote(60),
      MIDI.createQuarterNote(64),
      MIDI.createQuarterNote(66),
      MIDI.createQuarterNote(71),
    ],
  ],
};
export const Minor7thChord: Pattern = {
  id: "minor-7th-chord",
  name: "Minor 7th Chord",
  aliases: [
    "min7",
    "min7 chord",
    "m7",
    "m7 chord",
    "minor 7th",
    "minor 7th chord",
  ],
  stream: [
    [
      MIDI.createQuarterNote(60),
      MIDI.createQuarterNote(63),
      MIDI.createQuarterNote(67),
      MIDI.createQuarterNote(70),
    ],
  ],
};
export const Minor7thSus2Chord: Pattern = {
  id: "minor-7th-sus2-chord",
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
      MIDI.createQuarterNote(60),
      MIDI.createQuarterNote(62),
      MIDI.createQuarterNote(67),
      MIDI.createQuarterNote(70),
    ],
  ],
};
export const Minor7thSus4Chord: Pattern = {
  id: "minor-7th-sus4-chord",
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
      MIDI.createQuarterNote(60),
      MIDI.createQuarterNote(65),
      MIDI.createQuarterNote(67),
      MIDI.createQuarterNote(70),
    ],
  ],
};
export const Dominant7thChord: Pattern = {
  id: "dominant-7th-chord",
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
      MIDI.createQuarterNote(60),
      MIDI.createQuarterNote(64),
      MIDI.createQuarterNote(67),
      MIDI.createQuarterNote(70),
    ],
  ],
};

export const Dominant7thFlat5Chord: Pattern = {
  id: "dominant-7th-b5-chord",
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
      MIDI.createQuarterNote(60),
      MIDI.createQuarterNote(64),
      MIDI.createQuarterNote(66),
      MIDI.createQuarterNote(70),
    ],
  ],
};
export const Dominant7thSharp5Chord: Pattern = {
  id: "dominant-7th-#5-chord",
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
      MIDI.createQuarterNote(60),
      MIDI.createQuarterNote(64),
      MIDI.createQuarterNote(68),
      MIDI.createQuarterNote(70),
    ],
  ],
};
export const Minor7thFlat5Chord: Pattern = {
  id: "minor-7th-b5-chord",
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
      MIDI.createQuarterNote(60),
      MIDI.createQuarterNote(63),
      MIDI.createQuarterNote(66),
      MIDI.createQuarterNote(70),
    ],
  ],
};
export const MinorMajor7thChord: Pattern = {
  id: "minor-major-7th-chord",
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
      MIDI.createQuarterNote(60),
      MIDI.createQuarterNote(63),
      MIDI.createQuarterNote(67),
      MIDI.createQuarterNote(71),
    ],
  ],
};
export const Diminished7thChord: Pattern = {
  id: "diminished-7th-chord",
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
      MIDI.createQuarterNote(60),
      MIDI.createQuarterNote(63),
      MIDI.createQuarterNote(66),
      MIDI.createQuarterNote(69),
    ],
  ],
};

export const Augmented7thChord: Pattern = {
  id: "augmented-7th-chord",
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
      MIDI.createQuarterNote(60),
      MIDI.createQuarterNote(64),
      MIDI.createQuarterNote(68),
      MIDI.createQuarterNote(71),
    ],
  ],
};

export default {
  Major7thChord,
  Major7thSus2Chord,
  Major7thSus4Chord,
  Major7thFlat5Chord,
  Minor7thChord,
  Minor7thSus2Chord,
  Minor7thSus4Chord,
  Minor7thFlat5Chord,
  MinorMajor7thChord,
  Dominant7thChord,
  Dominant7thFlat5Chord,
  Dominant7thSharp5Chord,
  Diminished7thChord,
  Augmented7thChord,
};
