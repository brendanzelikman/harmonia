import { Pattern } from "types/Pattern";
import { MIDI } from "types/midi";

export const Major9thChord: Pattern = {
  id: "major-9th-chord",
  name: "Major 9 Chord",
  aliases: [
    "maj9",
    "maj9 chord",
    "M9",
    "M9 chord",
    "major 9th",
    "major 9th chord",
  ],
  stream: [
    [
      MIDI.createQuarterNote(60),
      MIDI.createQuarterNote(64),
      MIDI.createQuarterNote(67),
      MIDI.createQuarterNote(71),
      MIDI.createQuarterNote(74),
    ],
  ],
};
export const Major11thChord: Pattern = {
  id: "major-11th-chord",
  name: "Major 11 Chord",
  aliases: [
    "maj11",
    "maj11 chord",
    "M11",
    "M11 chord",
    "major 11th",
    "major 11th chord",
  ],
  stream: [
    [
      MIDI.createQuarterNote(60),
      MIDI.createQuarterNote(64),
      MIDI.createQuarterNote(67),
      MIDI.createQuarterNote(71),
      MIDI.createQuarterNote(74),
      MIDI.createQuarterNote(77),
    ],
  ],
};
export const MajorSharp11thChord: Pattern = {
  id: "major-#11th-chord",
  name: "Major #11 Chord",
  aliases: [
    "maj#11",
    "maj#11 chord",
    "M#11",
    "M#11 chord",
    "major sharp 11",
    "major sharp 11 chord",
    "major sharp 11th",
    "major sharp 11th chord",
    "major #11",
    "major #11 chord",
    "major #11th",
    "major #11th chord",
  ],
  stream: [
    [
      MIDI.createQuarterNote(60),
      MIDI.createQuarterNote(64),
      MIDI.createQuarterNote(67),
      MIDI.createQuarterNote(71),
      MIDI.createQuarterNote(74),
      MIDI.createQuarterNote(78),
    ],
  ],
};
export const Major13thChord: Pattern = {
  id: "major-13th-chord",
  name: "Major 13 Chord",
  aliases: [
    "maj13#11",
    "maj13#11 chord",
    "M13#11",
    "M13#11 chord",
    "major 13th sharp 11",
    "major 13th sharp 11 chord",
    "major 13th sharp 11th",
    "major 13th sharp 11th chord",
    "major 13th #11",
    "major 13th #11 chord",
    "major 13th #11th",
    "major 13th #11th chord",
  ],
  stream: [
    [
      MIDI.createQuarterNote(60),
      MIDI.createQuarterNote(64),
      MIDI.createQuarterNote(67),
      MIDI.createQuarterNote(71),
      MIDI.createQuarterNote(74),
      MIDI.createQuarterNote(78),
      MIDI.createQuarterNote(81),
    ],
  ],
};
export const Minor9thChord: Pattern = {
  id: "minor-9th-chord",
  name: "Minor 9th Chord",
  aliases: [
    "min9",
    "min9 chord",
    "m9",
    "m9 chord",
    "minor 9th",
    "minor 9th chord",
  ],

  stream: [
    [
      MIDI.createQuarterNote(60),
      MIDI.createQuarterNote(63),
      MIDI.createQuarterNote(67),
      MIDI.createQuarterNote(70),
      MIDI.createQuarterNote(74),
    ],
  ],
};
export const Minor11thChord: Pattern = {
  id: "minor-11th-chord",
  name: "Minor 11th Chord",
  aliases: [
    "min11",
    "min11 chord",
    "m11",
    "m11 chord",
    "minor 11th",
    "minor 11th chord",
  ],
  stream: [
    [
      MIDI.createQuarterNote(60),
      MIDI.createQuarterNote(63),
      MIDI.createQuarterNote(67),
      MIDI.createQuarterNote(70),
      MIDI.createQuarterNote(74),
      MIDI.createQuarterNote(77),
    ],
  ],
};
export const MinorSharp11thChord: Pattern = {
  id: "minor-#11th-chord",
  name: "Minor #11 Chord",
  aliases: [
    "min#11",
    "min#11 chord",
    "m#11",
    "m#11 chord",
    "minor sharp 11",
    "minor sharp 11 chord",
    "minor sharp 11th",
    "minor sharp 11th chord",
    "minor #11",
    "minor #11 chord",
    "minor #11th",
    "minor #11th chord",
  ],
  stream: [
    [
      MIDI.createQuarterNote(60),
      MIDI.createQuarterNote(63),
      MIDI.createQuarterNote(67),
      MIDI.createQuarterNote(70),
      MIDI.createQuarterNote(74),
      MIDI.createQuarterNote(78),
    ],
  ],
};

export const Minor13thChord: Pattern = {
  id: "minor-13-chord",
  name: "Minor 13 Chord",
  aliases: [
    "min13",
    "min13 chord",
    "m13",
    "m13 chord",
    "minor 13th",
    "minor 13th chord",
  ],
  stream: [
    [
      MIDI.createQuarterNote(60),
      MIDI.createQuarterNote(63),
      MIDI.createQuarterNote(67),
      MIDI.createQuarterNote(70),
      MIDI.createQuarterNote(74),
      MIDI.createQuarterNote(77),
      MIDI.createQuarterNote(81),
    ],
  ],
};
export const Dominant9thChord: Pattern = {
  id: "dominant-9th-chord",
  name: "Dominant 9 Chord",
  aliases: [
    "dom9",
    "dom9 chord",
    "9",
    "9 chord",
    "dominant 9",
    "dominant 9 chord",
    "dominant 9th",
    "dominant 9th chord",
  ],
  stream: [
    [
      MIDI.createQuarterNote(60),
      MIDI.createQuarterNote(64),
      MIDI.createQuarterNote(67),
      MIDI.createQuarterNote(70),
      MIDI.createQuarterNote(74),
    ],
  ],
};
export const DominantFlat9thChord: Pattern = {
  id: "dominant-b9-chord",
  name: "Dominant b9 Chord",
  aliases: [
    "domb9",
    "domb9 chord",
    "b9",
    "b9 chord",
    "dominant b9",
    "dominant b9 chord",
    "dominant b9th",
    "dominant b9th chord",
    "dominant flat 9",
    "dominant flat 9 chord",
    "dominant flat 9th",
    "dominant flat 9th chord",
  ],
  stream: [
    [
      MIDI.createQuarterNote(60),
      MIDI.createQuarterNote(64),
      MIDI.createQuarterNote(67),
      MIDI.createQuarterNote(70),
      MIDI.createQuarterNote(73),
    ],
  ],
};
export const DominantSharp9thChord: Pattern = {
  id: "dominant-#9-chord",
  name: "Dominant #9 Chord",
  aliases: [
    "dom#9",
    "dom#9 chord",
    "#9",
    "#9 chord",
    "dominant #9",
    "dominant #9 chord",
    "dominant #9th",
    "dominant #9th chord",
    "dominant sharp 9",
    "dominant sharp 9 chord",
    "dominant sharp 9th",
    "dominant sharp 9th chord",
  ],
  stream: [
    [
      MIDI.createQuarterNote(60),
      MIDI.createQuarterNote(64),
      MIDI.createQuarterNote(67),
      MIDI.createQuarterNote(70),
      MIDI.createQuarterNote(75),
    ],
  ],
};

export const Dominant11thChord: Pattern = {
  id: "dominant-11th-chord",
  name: "Dominant 11 Chord",
  aliases: [
    "dom11",
    "dom11 chord",
    "11",
    "11 chord",
    "dominant 11",
    "dominant 11 chord",
    "dominant 11th",
    "dominant 11th chord",
  ],
  stream: [
    [
      MIDI.createQuarterNote(60),
      MIDI.createQuarterNote(64),
      MIDI.createQuarterNote(67),
      MIDI.createQuarterNote(70),
      MIDI.createQuarterNote(74),
      MIDI.createQuarterNote(77),
    ],
  ],
};
export const DominantSharp11thChord: Pattern = {
  id: "dominant-#11th-chord",
  name: "Dominant #11 Chord",
  aliases: [
    "dom#11",
    "dom#11 chord",
    "#11",
    "#11 chord",
    "dominant #11",
    "dominant #11 chord",
    "dominant #11th",
    "dominant #11th chord",
    "dominant sharp 11",
    "dominant sharp 11 chord",
    "dominant sharp 11th",
    "dominant sharp 11th chord",
  ],
  stream: [
    [
      MIDI.createQuarterNote(60),
      MIDI.createQuarterNote(64),
      MIDI.createQuarterNote(67),
      MIDI.createQuarterNote(70),
      MIDI.createQuarterNote(74),
      MIDI.createQuarterNote(78),
    ],
  ],
};

export const Dominant13thChord: Pattern = {
  id: "dominant-13th-chord",
  name: "Dominant 13 Chord",
  aliases: [
    "dom13",
    "dom13 chord",
    "13",
    "13 chord",
    "dominant 13",
    "dominant 13 chord",
    "dominant 13th",
    "dominant 13th chord",
  ],
  stream: [
    [
      MIDI.createQuarterNote(60),
      MIDI.createQuarterNote(64),
      MIDI.createQuarterNote(67),
      MIDI.createQuarterNote(70),
      MIDI.createQuarterNote(74),
      MIDI.createQuarterNote(77),
      MIDI.createQuarterNote(81),
    ],
  ],
};

export default {
  Major9thChord,
  Major11thChord,
  MajorSharp11thChord,
  Major13thChord,
  Minor9thChord,
  Minor11thChord,
  MinorSharp11thChord,
  Minor13thChord,
  Dominant9thChord,
  DominantFlat9thChord,
  DominantSharp9thChord,
  Dominant11thChord,
  DominantSharp11thChord,
  Dominant13thChord,
};
