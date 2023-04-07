import { MAX_SUBDIVISION } from "appConstants";
import { fill } from "lodash";
import { MIDI } from "types/midi";
import { Pattern, PatternChord as Chord } from "types/patterns";

// Notes
export const wholeNote: Chord = [{ MIDI: 60, duration: MIDI.WholeNote }];
export const wholeRest: Chord = [{ MIDI: MIDI.Rest, duration: MIDI.WholeNote }];
export const halfNote: Chord = [{ MIDI: 60, duration: MIDI.HalfNote }];
export const halfRest: Chord = [{ MIDI: MIDI.Rest, duration: MIDI.HalfNote }];
export const quarterNote: Chord = [{ MIDI: 60, duration: MIDI.QuarterNote }];
export const quarterRest: Chord = [
  { MIDI: MIDI.Rest, duration: MIDI.QuarterNote },
];
export const eighthNote: Chord = [{ MIDI: 60, duration: MIDI.EighthNote }];
export const eighthRest: Chord = [
  { MIDI: MIDI.Rest, duration: MIDI.EighthNote },
];
export const sixteenthNote: Chord = [
  { MIDI: 60, duration: MIDI.SixteenthNote },
];
export const sixteenthRest: Chord = [
  { MIDI: MIDI.Rest, duration: MIDI.SixteenthNote },
];

// Basic Chords
export const MajorChord: Pattern = {
  id: "major-chord",
  name: "Major Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.WholeNote },
      { MIDI: 64, duration: MIDI.WholeNote },
      { MIDI: 67, duration: MIDI.WholeNote },
    ],
  ],
};
export const MajorSeventhChord: Pattern = {
  id: "major-seventh-chord",
  name: "Major Seventh Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.WholeNote },
      { MIDI: 64, duration: MIDI.WholeNote },
      { MIDI: 67, duration: MIDI.WholeNote },
      { MIDI: 71, duration: MIDI.WholeNote },
    ],
  ],
};
export const MinorChord: Pattern = {
  id: "minor-chord",
  name: "Minor Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.WholeNote },
      { MIDI: 63, duration: MIDI.WholeNote },
      { MIDI: 67, duration: MIDI.WholeNote },
    ],
  ],
};
export const MinorSeventhChord: Pattern = {
  id: "minor-seventh-chord",
  name: "Minor Seventh Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.WholeNote },
      { MIDI: 63, duration: MIDI.WholeNote },
      { MIDI: 67, duration: MIDI.WholeNote },
      { MIDI: 70, duration: MIDI.WholeNote },
    ],
  ],
};
export const DiminishedChord: Pattern = {
  id: "diminished-chord",
  name: "Diminished Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.WholeNote },
      { MIDI: 63, duration: MIDI.WholeNote },
      { MIDI: 66, duration: MIDI.WholeNote },
      { MIDI: 69, duration: MIDI.WholeNote },
    ],
  ],
};
export const DiminishedSeventhChord: Pattern = {
  id: "diminished-seventh-chord",
  name: "Diminished Seventh Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.WholeNote },
      { MIDI: 63, duration: MIDI.WholeNote },
      { MIDI: 66, duration: MIDI.WholeNote },
      { MIDI: 69, duration: MIDI.WholeNote },
    ],
  ],
};
export const HalfDiminishedSeventhChord: Pattern = {
  id: "half-diminished-seventh-chord",
  name: "Half Diminished Seventh Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.WholeNote },
      { MIDI: 63, duration: MIDI.WholeNote },
      { MIDI: 66, duration: MIDI.WholeNote },
      { MIDI: 70, duration: MIDI.WholeNote },
    ],
  ],
};
export const AugmentedChord: Pattern = {
  id: "augmented-chord",
  name: "Augmented Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.WholeNote },
      { MIDI: 64, duration: MIDI.WholeNote },
      { MIDI: 68, duration: MIDI.WholeNote },
    ],
  ],
};
export const AugmentedSeventhChord: Pattern = {
  id: "augmented-seventh-chord",
  name: "Augmented Seventh Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.WholeNote },
      { MIDI: 64, duration: MIDI.WholeNote },
      { MIDI: 68, duration: MIDI.WholeNote },
      { MIDI: 71, duration: MIDI.WholeNote },
    ],
  ],
};
export const DominantSeventhChord: Pattern = {
  id: "dominant-seventh-chord",
  name: "Dominant Seventh Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.WholeNote },
      { MIDI: 64, duration: MIDI.WholeNote },
      { MIDI: 67, duration: MIDI.WholeNote },
      { MIDI: 70, duration: MIDI.WholeNote },
    ],
  ],
};
export const MinorMajorSeventhChord: Pattern = {
  id: "major-minor-seventh-chord",
  name: "Major Minor Seventh Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.WholeNote },
      { MIDI: 63, duration: MIDI.WholeNote },
      { MIDI: 67, duration: MIDI.WholeNote },
      { MIDI: 71, duration: MIDI.WholeNote },
    ],
  ],
};

// Basic Arpeggios
export const MajorArpeggio: Pattern = {
  id: "major-arpeggio",
  name: "Major Arpeggio",
  stream: [
    [{ MIDI: 60, duration: MIDI.QuarterNote }],
    [{ MIDI: 64, duration: MIDI.QuarterNote }],
    [{ MIDI: 67, duration: MIDI.QuarterNote }],
    [{ MIDI: 72, duration: MIDI.QuarterNote }],
  ],
};

export const MinorArpeggio: Pattern = {
  id: "minor-arpeggio",
  name: "Minor Arpeggio",
  stream: [
    [{ MIDI: 60, duration: MIDI.QuarterNote }],
    [{ MIDI: 63, duration: MIDI.QuarterNote }],
    [{ MIDI: 67, duration: MIDI.QuarterNote }],
    [{ MIDI: 72, duration: MIDI.QuarterNote }],
  ],
};

export const DiminishedArpeggio: Pattern = {
  id: "diminished-arpeggio",
  name: "Diminished Arpeggio",
  stream: [
    [{ MIDI: 60, duration: MIDI.QuarterNote }],
    [{ MIDI: 63, duration: MIDI.QuarterNote }],
    [{ MIDI: 66, duration: MIDI.QuarterNote }],
    [{ MIDI: 69, duration: MIDI.QuarterNote }],
  ],
};

export const AugmentedArpeggio: Pattern = {
  id: "augmented-arpeggio",
  name: "Augmented Arpeggio",
  stream: [
    [{ MIDI: 60, duration: MIDI.QuarterNote }],
    [{ MIDI: 64, duration: MIDI.QuarterNote }],
    [{ MIDI: 68, duration: MIDI.QuarterNote }],
    [{ MIDI: 72, duration: MIDI.QuarterNote }],
  ],
};

export const MajorSeventhArpeggio: Pattern = {
  id: "major-seventh-arpeggio",
  name: "Major Seventh Arpeggio",
  stream: [
    [{ MIDI: 60, duration: MIDI.QuarterNote }],
    [{ MIDI: 64, duration: MIDI.QuarterNote }],
    [{ MIDI: 67, duration: MIDI.QuarterNote }],
    [{ MIDI: 71, duration: MIDI.QuarterNote }],
  ],
};
export const MinorSeventhArpeggio: Pattern = {
  id: "minor-seventh-arpeggio",
  name: "Minor Seventh Arpeggio",
  stream: [
    [{ MIDI: 60, duration: MIDI.QuarterNote }],
    [{ MIDI: 63, duration: MIDI.QuarterNote }],
    [{ MIDI: 67, duration: MIDI.QuarterNote }],
    [{ MIDI: 70, duration: MIDI.QuarterNote }],
  ],
};
export const DominantSeventhArpeggio: Pattern = {
  id: "dominant-seventh-arpeggio",
  name: "Dominant Seventh Arpeggio",
  stream: [
    [{ MIDI: 60, duration: MIDI.QuarterNote }],
    [{ MIDI: 64, duration: MIDI.QuarterNote }],
    [{ MIDI: 67, duration: MIDI.QuarterNote }],
    [{ MIDI: 70, duration: MIDI.QuarterNote }],
  ],
};

export const DiminishedSeventhArpeggio: Pattern = {
  id: "diminished-seventh-arpeggio",
  name: "Diminished Seventh Arpeggio",
  stream: [
    [{ MIDI: 60, duration: MIDI.QuarterNote }],
    [{ MIDI: 63, duration: MIDI.QuarterNote }],
    [{ MIDI: 66, duration: MIDI.QuarterNote }],
    [{ MIDI: 69, duration: MIDI.QuarterNote }],
  ],
};

export const HalfDiminishedSeventhArpeggio: Pattern = {
  id: "half-diminished-seventh-arpeggio",
  name: "Half Diminished Seventh Arpeggio",
  stream: [
    [{ MIDI: 60, duration: MIDI.QuarterNote }],
    [{ MIDI: 63, duration: MIDI.QuarterNote }],
    [{ MIDI: 66, duration: MIDI.QuarterNote }],
    [{ MIDI: 70, duration: MIDI.QuarterNote }],
  ],
};

export const AugmentedSeventhArpeggio: Pattern = {
  id: "augmented-seventh-arpeggio",
  name: "Augmented Seventh Arpeggio",
  stream: [
    [{ MIDI: 60, duration: MIDI.QuarterNote }],
    [{ MIDI: 64, duration: MIDI.QuarterNote }],
    [{ MIDI: 68, duration: MIDI.QuarterNote }],
    [{ MIDI: 71, duration: MIDI.QuarterNote }],
  ],
};
export const MinorMajorSeventhArpeggio: Pattern = {
  id: "major-minor-seventh-arpeggio",
  name: "Major Minor Seventh Arpeggio",
  stream: [
    [{ MIDI: 60, duration: MIDI.QuarterNote }],
    [{ MIDI: 63, duration: MIDI.QuarterNote }],
    [{ MIDI: 67, duration: MIDI.QuarterNote }],
    [{ MIDI: 71, duration: MIDI.QuarterNote }],
  ],
};

// Famous Chords
export const TristanChord: Pattern = {
  id: "tristan-chord",
  name: "Tristan Chord (Wagner)",
  stream: [
    [
      { MIDI: 53, duration: MIDI.WholeNote },
      { MIDI: 59, duration: MIDI.WholeNote },
      { MIDI: 63, duration: MIDI.WholeNote },
      { MIDI: 68, duration: MIDI.WholeNote },
    ],
  ],
};
export const MysticChord: Pattern = {
  id: "mystic-chord",
  name: "Mystic Chord (Scriabin)",
  stream: [
    [
      { MIDI: 60, duration: MIDI.WholeNote },
      { MIDI: 66, duration: MIDI.WholeNote },
      { MIDI: 70, duration: MIDI.WholeNote },
      { MIDI: 76, duration: MIDI.WholeNote },
      { MIDI: 81, duration: MIDI.WholeNote },
      { MIDI: 86, duration: MIDI.WholeNote },
    ],
  ],
};
export const ElektraChord: Pattern = {
  id: "elektra-chord",
  name: "Elektra Chord (Strauss)",
  stream: [
    [
      { MIDI: 64, duration: MIDI.WholeNote },
      { MIDI: 71, duration: MIDI.WholeNote },
      { MIDI: 73, duration: MIDI.WholeNote },
      { MIDI: 77, duration: MIDI.WholeNote },
      { MIDI: 80, duration: MIDI.WholeNote },
    ],
  ],
};
export const FarbenChord: Pattern = {
  id: "farben-chord",
  name: "Farben Chord (Schoenberg)",
  stream: [
    [
      { MIDI: 60, duration: MIDI.WholeNote },
      { MIDI: 68, duration: MIDI.WholeNote },
      { MIDI: 71, duration: MIDI.WholeNote },
      { MIDI: 76, duration: MIDI.WholeNote },
      { MIDI: 82, duration: MIDI.WholeNote },
    ],
  ],
};
export const PurpleHazeChord: Pattern = {
  id: "purple-haze-chord",
  name: "Purple Haze Chord (Hendrix)",
  stream: [
    [
      { MIDI: 40, duration: MIDI.WholeNote },
      { MIDI: 52, duration: MIDI.WholeNote },
      { MIDI: 56, duration: MIDI.WholeNote },
      { MIDI: 62, duration: MIDI.WholeNote },
      { MIDI: 64, duration: MIDI.WholeNote },
      { MIDI: 67, duration: MIDI.WholeNote },
    ],
  ],
};
export const SoWhatChord: Pattern = {
  id: "so-what-chord",
  name: "So What Chord (Evans)",
  stream: [
    [
      { MIDI: 52, duration: MIDI.WholeNote },
      { MIDI: 57, duration: MIDI.WholeNote },
      { MIDI: 62, duration: MIDI.WholeNote },
      { MIDI: 67, duration: MIDI.WholeNote },
      { MIDI: 71, duration: MIDI.WholeNote },
    ],
  ],
};
export const BondChord: Pattern = {
  id: "bond-chord",
  name: "Bond Chord (Flick)",
  stream: [
    [
      { MIDI: 52, duration: MIDI.WholeNote },
      { MIDI: 67, duration: MIDI.WholeNote },
      { MIDI: 71, duration: MIDI.WholeNote },
      { MIDI: 75, duration: MIDI.WholeNote },
      { MIDI: 78, duration: MIDI.WholeNote },
    ],
  ],
};

// Common Voicings

// Famous Patterns
export const BachPrelude: Pattern = {
  id: "bach-prelude",
  name: "Prelude in C (Bach)",
  stream: [
    [{ MIDI: 60, duration: MIDI.EighthNote }],
    [{ MIDI: 64, duration: MIDI.EighthNote }],
    [{ MIDI: 67, duration: MIDI.EighthNote }],
    [{ MIDI: 72, duration: MIDI.EighthNote }],
    [{ MIDI: 76, duration: MIDI.EighthNote }],
    [{ MIDI: 67, duration: MIDI.EighthNote }],
    [{ MIDI: 72, duration: MIDI.EighthNote }],
    [{ MIDI: 76, duration: MIDI.EighthNote }],
  ],
};
export const TurkishMarch: Pattern = {
  id: "turkish-march",
  name: "Turkish March (Mozart)",
  stream: [
    [{ MIDI: 71, duration: MIDI.SixteenthNote }],
    [{ MIDI: 69, duration: MIDI.SixteenthNote }],
    [{ MIDI: 68, duration: MIDI.SixteenthNote }],
    [{ MIDI: 69, duration: MIDI.SixteenthNote }],
    [{ MIDI: 72, duration: MIDI.SixteenthNote }],
  ],
};
export const FatePattern: Pattern = {
  id: "fate-motif",
  name: "Fate Motif (Beethoven)",
  stream: [
    [{ MIDI: MIDI.Rest, duration: MIDI.EighthNote }],
    [{ MIDI: 67, duration: MIDI.EighthNote }],
    [{ MIDI: 67, duration: MIDI.EighthNote }],
    [{ MIDI: 67, duration: MIDI.EighthNote }],
    [{ MIDI: 63, duration: MIDI.HalfNote }],
  ],
};
export const RevolutionaryEtude: Pattern = {
  id: "revolutionary-etude",
  name: "Revolutionary Etude (Chopin)",
  stream: [
    [{ MIDI: 48, duration: MIDI.SixteenthNote }],
    [{ MIDI: 55, duration: MIDI.SixteenthNote }],
    [{ MIDI: 60, duration: MIDI.SixteenthNote }],
    [{ MIDI: 62, duration: MIDI.SixteenthNote }],
    [{ MIDI: 63, duration: MIDI.SixteenthNote }],
    [{ MIDI: 62, duration: MIDI.SixteenthNote }],
    [{ MIDI: 60, duration: MIDI.SixteenthNote }],
    [{ MIDI: 55, duration: MIDI.SixteenthNote }],
  ],
};
export const ZarahustraFanfare: Pattern = {
  id: "zarahustra-fanfare",
  name: "Zarahustra Fanfare (Strauss)",
  stream: [
    [{ MIDI: 60, duration: MIDI.HalfNote }],
    [{ MIDI: 67, duration: MIDI.HalfNote }],
    [{ MIDI: 72, duration: MIDI.HalfNote }],
    [{ MIDI: MIDI.Rest, duration: MIDI.QuarterNote }],
    [{ MIDI: MIDI.Rest, duration: MIDI.EighthNote }],
    [{ MIDI: MIDI.Rest, duration: MIDI.SixteenthNote }],
    [{ MIDI: 76, duration: MIDI.SixteenthNote }],
    [{ MIDI: 75, duration: MIDI.WholeNote }],
  ],
};
export const AlbertiBass: Pattern = {
  id: "alberti-bass",
  name: "Alberti Bass",
  stream: [
    [{ MIDI: 60, duration: MIDI.EighthNote }],
    [{ MIDI: 67, duration: MIDI.EighthNote }],
    [{ MIDI: 64, duration: MIDI.EighthNote }],
    [{ MIDI: 67, duration: MIDI.EighthNote }],
    [{ MIDI: 60, duration: MIDI.EighthNote }],
    [{ MIDI: 67, duration: MIDI.EighthNote }],
    [{ MIDI: 64, duration: MIDI.EighthNote }],
    [{ MIDI: 67, duration: MIDI.EighthNote }],
  ],
};
export const TheLick: Pattern = {
  id: "the-lick",
  name: "The Lick",
  stream: [
    [{ MIDI: 62, duration: MIDI.EighthNote }],
    [{ MIDI: 64, duration: MIDI.EighthNote }],
    [{ MIDI: 65, duration: MIDI.EighthNote }],
    [{ MIDI: 67, duration: MIDI.EighthNote }],
    [{ MIDI: 64, duration: MIDI.QuarterNote }],
    [{ MIDI: 60, duration: MIDI.EighthNote }],
    [{ MIDI: 62, duration: MIDI.EighthNote }],
  ],
};
export const HappyBirthday: Pattern = {
  id: "happy-birthday",
  name: "Happy Birthday",
  stream: [
    [{ MIDI: 67, duration: MIDI.EighthNote }],
    [{ MIDI: MIDI.Rest, duration: MIDI.SixteenthNote }],
    [{ MIDI: 67, duration: MIDI.SixteenthNote }],
    [{ MIDI: 69, duration: MIDI.QuarterNote }],
    [{ MIDI: 67, duration: MIDI.QuarterNote }],
    [{ MIDI: 72, duration: MIDI.QuarterNote }],
    [{ MIDI: 71, duration: MIDI.QuarterNote }],
  ],
};

// Basic Durations
export const WholeNote: Pattern = {
  id: "whole-notes",
  name: "Whole Note",
  stream: [wholeNote],
};
export const HalfNotes: Pattern = {
  id: "half-notes",
  name: "Half Notes",
  stream: fill(Array(2), halfNote),
};
export const QuarterNotes: Pattern = {
  id: "quarter-notes",
  name: "Quarter Notes",
  stream: fill(Array(4), quarterNote),
};
export const EighthNotes: Pattern = {
  id: "eighth-notes",
  name: "Eighth Notes",
  stream: fill(Array(8), eighthNote),
};
export const SixteenthNotes: Pattern = {
  id: "sixteenth-notes",
  name: "Sixteenth Notes",
  stream: fill(Array(16), sixteenthNote),
};

// Simple Rhythms
export const EighthAndTwoSixteenths: Pattern = {
  id: "eighth-and-two-sixteenths",
  name: "Eighth + Two Sixteenths",
  stream: fill(Array(4), [eighthNote, sixteenthNote, sixteenthNote]).flat(),
};
export const TwoSixteenthsAndEighth: Pattern = {
  id: "two-sixteenths-and-eighth",
  name: "Two Sixteenths + Eighth",
  stream: fill(Array(4), [sixteenthNote, sixteenthNote, eighthNote]).flat(),
};
export const SixteenthEighthSixteenth: Pattern = {
  id: "sixteenth-eighth-sixteenth",
  name: "Sixteenth + Eighth + Sixteenth",
  stream: fill(Array(4), [sixteenthNote, eighthNote, sixteenthNote]).flat(),
};
export const SixteenthAndDottedEighth: Pattern = {
  id: "sixteenth-and-dotted",
  name: "Sixteenth + Dotted Eighth",
  stream: fill(Array(4), [sixteenthNote, sixteenthNote, eighthRest]).flat(),
};
export const DottedEighthAndSixteenth: Pattern = {
  id: "dotted-and-sixteenth",
  name: "Dotted Eighth + Sixteenth",
  stream: fill(Array(4), [eighthNote, sixteenthRest, sixteenthNote]).flat(),
};

// Latin Rhythms
export const Habanera: Pattern = {
  id: "habanera",
  name: "Habanera",
  stream: [
    eighthNote,
    sixteenthRest,
    sixteenthNote,
    eighthNote,
    eighthNote,
    eighthNote,
    sixteenthRest,
    sixteenthNote,
    eighthNote,
    eighthNote,
  ],
};
export const Tresillo: Pattern = {
  id: "tresillo",
  name: "Tresillo",
  stream: [
    eighthNote,
    sixteenthRest,
    sixteenthNote,
    eighthRest,
    eighthNote,
    eighthNote,
    sixteenthRest,
    sixteenthNote,
    eighthRest,
    eighthNote,
  ],
};
export const Cinquillo: Pattern = {
  id: "cinquillo",
  name: "Cinquillo",
  stream: [
    eighthNote,
    sixteenthNote,
    sixteenthNote,
    sixteenthRest,
    sixteenthNote,
    sixteenthNote,
    sixteenthRest,
    eighthNote,
    sixteenthNote,
    sixteenthNote,
    sixteenthRest,
    sixteenthNote,
    sixteenthNote,
    sixteenthRest,
  ],
};
export const Baqueteo: Pattern = {
  id: "baqueteo",
  name: "Baqueteo",
  stream: [
    eighthNote,
    sixteenthNote,
    sixteenthNote,
    sixteenthRest,
    sixteenthNote,
    sixteenthNote,
    sixteenthRest,
    eighthNote,
    eighthNote,
    eighthNote,
    eighthNote,
  ],
};
export const Cascara: Pattern = {
  id: "cascara",
  name: "Cascara",
  stream: [
    eighthNote,
    sixteenthNote,
    sixteenthNote,
    sixteenthRest,
    sixteenthNote,
    sixteenthRest,
    sixteenthNote,
    eighthNote,
    eighthNote,
    sixteenthNote,
    sixteenthNote,
    sixteenthRest,
    sixteenthNote,
  ],
};

// Clave Patterns
export const TwoThreeSonClave: Pattern = {
  id: "2-3-son-clave",
  name: "2-3 Son Clave",
  stream: [
    eighthRest,
    eighthNote,
    eighthNote,
    eighthRest,
    eighthNote,
    sixteenthRest,
    sixteenthNote,
    eighthRest,
    eighthNote,
  ],
};
export const ThreeTwoSonClave: Pattern = {
  id: "3-2-son-clave",
  name: "3-2 Son Clave",
  stream: [
    eighthNote,
    sixteenthRest,
    sixteenthNote,
    eighthRest,
    eighthNote,
    eighthRest,
    eighthNote,
    eighthNote,
    eighthRest,
  ],
};
export const TwoThreeRumbaClave: Pattern = {
  id: "2-3-rumba-clave",
  name: "2-3 Rumba Clave",
  stream: [
    eighthRest,
    eighthNote,
    eighthNote,
    eighthRest,
    eighthNote,
    sixteenthRest,
    sixteenthNote,
    eighthRest,
    sixteenthRest,
    sixteenthNote,
  ],
};
export const ThreeTwoRumbaClave: Pattern = {
  id: "3-2-rumba-clave",
  name: "3-2 Rumba Clave",
  stream: [
    eighthNote,
    sixteenthRest,
    sixteenthNote,
    eighthRest,
    sixteenthRest,
    sixteenthNote,
    eighthRest,
    eighthNote,
    eighthNote,
    eighthRest,
  ],
};
export const TwoThreeBossaNovaClave: Pattern = {
  id: "2-3-bossa-nova-clave",
  name: "2-3 Bossa Nova Clave",
  stream: [
    eighthRest,
    eighthNote,
    sixteenthRest,
    sixteenthNote,
    eighthRest,
    eighthNote,
    sixteenthRest,
    sixteenthNote,
    eighthRest,
    eighthNote,
  ],
};
export const ThreeTwoBossaNovaClave: Pattern = {
  id: "3-2-bossa-nova-clave",
  name: "3-2 Bossa Nova Clave",
  stream: [
    eighthNote,
    sixteenthRest,
    sixteenthNote,
    eighthRest,
    eighthNote,
    eighthRest,
    eighthNote,
    sixteenthRest,
    sixteenthNote,
    eighthRest,
  ],
};

export * as PresetPatterns from "./patterns";
