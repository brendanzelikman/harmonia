import { Pattern } from "types/pattern";
import { MIDI } from "types/midi";

export const MajorChord: Pattern = {
  id: "major-chord",
  name: "Major Chord",
  aliases: ["maj", "maj chord", "major", "major chord", "M", "M chord"],
  stream: [
    [
      MIDI.createQuarterNote(60),
      MIDI.createQuarterNote(64),
      MIDI.createQuarterNote(67),
    ],
  ],
};
export const MinorChord: Pattern = {
  id: "minor-chord",
  name: "Minor Chord",
  aliases: ["min", "min chord", "minor", "minor chord", "m", "m chord"],
  stream: [
    [
      MIDI.createQuarterNote(60),
      MIDI.createQuarterNote(63),
      MIDI.createQuarterNote(67),
    ],
  ],
};
export const DiminishedChord: Pattern = {
  id: "diminished-chord",
  name: "Diminished Chord",
  aliases: [
    "dim",
    "dim chord",
    "diminished",
    "diminished chord",
    "o",
    "o chord",
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
export const AugmentedChord: Pattern = {
  id: "augmented-chord",
  name: "Augmented Chord",
  aliases: ["aug", "aug chord", "+", "+ chord"],
  stream: [
    [
      MIDI.createQuarterNote(60),
      MIDI.createQuarterNote(64),
      MIDI.createQuarterNote(68),
    ],
  ],
};
export const Sus2Chord: Pattern = {
  id: "sus2-chord",
  name: "Sus2 Chord",
  aliases: ["sus2", "sus2 chord"],
  stream: [
    [
      MIDI.createQuarterNote(60),
      MIDI.createQuarterNote(62),
      MIDI.createQuarterNote(67),
    ],
  ],
};
export const Sus4Chord: Pattern = {
  id: "sus4-chord",
  name: "Sus4 Chord",
  aliases: ["sus4", "sus4 chord"],
  stream: [
    [
      MIDI.createQuarterNote(60),
      MIDI.createQuarterNote(65),
      MIDI.createQuarterNote(67),
    ],
  ],
};
export const QuartalChord: Pattern = {
  id: "quartal-chord",
  name: "Quartal Chord",
  aliases: ["quartal", "quartal chord", "q", "q chord"],
  stream: [
    [
      MIDI.createQuarterNote(60),
      MIDI.createQuarterNote(65),
      MIDI.createQuarterNote(70),
    ],
  ],
};
export const QuintalChord: Pattern = {
  id: "quintal-chord",
  name: "Quintal Chord",
  aliases: ["quintal", "quintal chord"],
  stream: [
    [
      MIDI.createQuarterNote(60),
      MIDI.createQuarterNote(67),
      MIDI.createQuarterNote(74),
    ],
  ],
};

export const PowerChord: Pattern = {
  id: "power-chord",
  name: "Power Chord",
  aliases: ["5", "5 chord"],
  stream: [
    [
      MIDI.createQuarterNote(60),
      MIDI.createQuarterNote(67),
      MIDI.createQuarterNote(72),
    ],
  ],
};
export const Octave: Pattern = {
  id: "octave",
  name: "Octave",
  stream: [[MIDI.createQuarterNote(60), MIDI.createQuarterNote(72)]],
};

export default {
  MajorChord,
  MinorChord,
  DiminishedChord,
  AugmentedChord,
  Sus2Chord,
  Sus4Chord,
  QuartalChord,
  QuintalChord,
  PowerChord,
  Octave,
};
