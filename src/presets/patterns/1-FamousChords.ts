import { Pattern } from "types/Pattern";
import { MIDI } from "types/midi";

export const TristanChord: Pattern = {
  id: "tristan-chord",
  name: "Tristan Chord",
  stream: [
    [
      MIDI.createQuarterNote(53),
      MIDI.createQuarterNote(59),
      MIDI.createQuarterNote(63),
      MIDI.createQuarterNote(68),
    ],
  ],
};
export const MysticChord: Pattern = {
  id: "mystic-chord",
  name: "Mystic Chord",
  stream: [
    [
      MIDI.createQuarterNote(60),
      MIDI.createQuarterNote(66),
      MIDI.createQuarterNote(70),
      MIDI.createQuarterNote(76),
      MIDI.createQuarterNote(81),
      MIDI.createQuarterNote(86),
    ],
  ],
};
export const ElektraChord: Pattern = {
  id: "elektra-chord",
  name: "Elektra Chord",
  stream: [
    [
      MIDI.createQuarterNote(64),
      MIDI.createQuarterNote(71),
      MIDI.createQuarterNote(73),
      MIDI.createQuarterNote(77),
      MIDI.createQuarterNote(80),
    ],
  ],
};
export const FarbenChord: Pattern = {
  id: "farben-chord",
  name: "Farben Chord",
  stream: [
    [
      MIDI.createQuarterNote(60),
      MIDI.createQuarterNote(68),
      MIDI.createQuarterNote(71),
      MIDI.createQuarterNote(76),
      MIDI.createQuarterNote(82),
    ],
  ],
};
export const RiteOfSpringChord: Pattern = {
  id: "rite-of-spring-chord",
  name: "Rite of Spring Chord",
  stream: [
    [
      MIDI.createQuarterNote(40),
      MIDI.createQuarterNote(44),
      MIDI.createQuarterNote(47),
      MIDI.createQuarterNote(52),
      MIDI.createQuarterNote(55),
      MIDI.createQuarterNote(58),
      MIDI.createQuarterNote(61),
      MIDI.createQuarterNote(63),
    ],
  ],
};
export const DreamChord: Pattern = {
  id: "dream-chord",
  name: "Dream Chord",
  stream: [
    [
      MIDI.createQuarterNote(67),
      MIDI.createQuarterNote(72),
      MIDI.createQuarterNote(73),
      MIDI.createQuarterNote(74),
    ],
  ],
};

export const HendrixChord: Pattern = {
  id: "hendrix-chord",
  name: "Hendrix Chord",
  stream: [
    [
      MIDI.createQuarterNote(40),
      MIDI.createQuarterNote(52),
      MIDI.createQuarterNote(56),
      MIDI.createQuarterNote(62),
      MIDI.createQuarterNote(64),
      MIDI.createQuarterNote(67),
    ],
  ],
};
export const SoWhatChord: Pattern = {
  id: "so-what-chord",
  name: "So What Chord",
  stream: [
    [
      MIDI.createQuarterNote(52),
      MIDI.createQuarterNote(57),
      MIDI.createQuarterNote(62),
      MIDI.createQuarterNote(67),
      MIDI.createQuarterNote(71),
    ],
  ],
};
export const BondChord: Pattern = {
  id: "james-bond-chord",
  name: "James Bond Chord",
  stream: [
    [
      MIDI.createQuarterNote(52),
      MIDI.createQuarterNote(67),
      MIDI.createQuarterNote(71),
      MIDI.createQuarterNote(75),
      MIDI.createQuarterNote(78),
    ],
  ],
};
export const KennyBarronMajorChord: Pattern = {
  id: "kenny-barron-major-chord",
  name: "Kenny Barron Major Chord",
  stream: [
    [
      MIDI.createQuarterNote(48),
      MIDI.createQuarterNote(55),
      MIDI.createQuarterNote(62),
      MIDI.createQuarterNote(64),
      MIDI.createQuarterNote(71),
      MIDI.createQuarterNote(78),
    ],
  ],
};
export const KennyBarronMinorChord: Pattern = {
  id: "kenny-barron-minor-chord",
  name: "Kenny Barron Minor Chord",
  stream: [
    [
      MIDI.createQuarterNote(48),
      MIDI.createQuarterNote(55),
      MIDI.createQuarterNote(62),
      MIDI.createQuarterNote(63),
      MIDI.createQuarterNote(70),
      MIDI.createQuarterNote(77),
    ],
  ],
};

export default {
  TristanChord,
  MysticChord,
  ElektraChord,
  FarbenChord,
  RiteOfSpringChord,
  DreamChord,
  SoWhatChord,
  KennyBarronMajorChord,
  KennyBarronMinorChord,
  HendrixChord,
  BondChord,
};
