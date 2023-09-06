import { MIDI, Pattern } from "types";

export const StraightMajorArpeggio: Pattern = {
  id: "straight-major-arpeggio",
  name: "Straight Major Arpeggio",
  aliases: [
    "maj arpeggio",
    "maj arp",
    "major arpeggio",
    "major arp",
    "M arpeggio",
    "M arp",
  ],
  stream: [
    [MIDI.createSixteenthNote(60)],
    [MIDI.createSixteenthNote(64)],
    [MIDI.createSixteenthNote(67)],
    [MIDI.createSixteenthNote(72)],
  ],
};
export const TripletMajorArpeggio: Pattern = {
  id: "triplet-major-arpeggio",
  name: "Triplet Major Arpeggio",
  aliases: [
    "maj triplet arpeggio",
    "maj triplet arp",
    "major triplet arpeggio",
    "major triplet arp",
    "M triplet arpeggio",
    "M triplet arp",
  ],
  stream: [
    [MIDI.createTripletEighthNote(60)],
    [MIDI.createTripletEighthNote(64)],
    [MIDI.createTripletEighthNote(67)],
  ],
};

export const StraightMinorArpeggio: Pattern = {
  id: "straight-minor-arpeggio",
  name: "Straight Minor Arpeggio",
  aliases: [
    "min arpeggio",
    "min arp",
    "minor arpeggio",
    "minor arp",
    "m arpeggio",
    "m arp",
  ],
  stream: [
    [MIDI.createSixteenthNote(60)],
    [MIDI.createSixteenthNote(63)],
    [MIDI.createSixteenthNote(67)],
    [MIDI.createSixteenthNote(72)],
  ],
};
export const TripletMinorArpeggio: Pattern = {
  id: "triplet-minor-arpeggio",
  name: "Triplet Minor Arpeggio",
  aliases: [
    "min triplet arpeggio",
    "min triplet arp",
    "minor triplet arpeggio",
    "minor triplet arp",
    "m triplet arpeggio",
    "m triplet arp",
  ],
  stream: [
    [MIDI.createTripletEighthNote(60)],
    [MIDI.createTripletEighthNote(63)],
    [MIDI.createTripletEighthNote(67)],
  ],
};
export const StraightDiminishedArpeggio: Pattern = {
  id: "straight-diminished-arpeggio",
  name: "Straight Diminished Arpeggio",
  aliases: [
    "dim arpeggio",
    "dim arp",
    "diminished arpeggio",
    "diminished arp",
    "o arpeggio",
    "o arp",
  ],
  stream: [
    [MIDI.createSixteenthNote(60)],
    [MIDI.createSixteenthNote(63)],
    [MIDI.createSixteenthNote(66)],
    [MIDI.createSixteenthNote(69)],
  ],
};
export const TripletDiminishedArpeggio: Pattern = {
  id: "triplet-diminished-arpeggio",
  name: "Triplet Diminished Arpeggio",
  aliases: [
    "dim triplet arpeggio",
    "dim triplet arp",
    "diminished triplet arpeggio",
    "diminished triplet arp",
    "o triplet arpeggio",
    "o triplet arp",
  ],
  stream: [
    [MIDI.createTripletEighthNote(60)],
    [MIDI.createTripletEighthNote(63)],
    [MIDI.createTripletEighthNote(66)],
  ],
};
export const StraightAugmentedArpeggio: Pattern = {
  id: "straight-augmented-arpeggio",
  name: "Straight Augmented Arpeggio",
  aliases: [
    "aug arpeggio",
    "aug arp",
    "augmented arpeggio",
    "augmented arp",
    "+ arpeggio",
    "+ arp",
  ],
  stream: [
    [MIDI.createSixteenthNote(60)],
    [MIDI.createSixteenthNote(64)],
    [MIDI.createSixteenthNote(68)],
    [MIDI.createSixteenthNote(72)],
  ],
};
export const TripletAugmentedArpeggio: Pattern = {
  id: "triplet-augmented-arpeggio",
  name: "Triplet Augmented Arpeggio",
  aliases: [
    "aug triplet arpeggio",
    "aug triplet arp",
    "augmented triplet arpeggio",
    "augmented triplet arp",
    "+ triplet arpeggio",
    "+ triplet arp",
  ],
  stream: [
    [MIDI.createTripletEighthNote(60)],
    [MIDI.createTripletEighthNote(64)],
    [MIDI.createTripletEighthNote(68)],
  ],
};

export const Major7thArpeggio: Pattern = {
  id: "major-7th-arpeggio",
  name: "Major 7th Arpeggio",
  aliases: [
    "maj7 arpeggio",
    "maj7 arp",
    "major 7th arpeggio",
    "major 7th arp",
    "M7 arpeggio",
    "M7 arp",
  ],
  stream: [
    [MIDI.createSixteenthNote(60)],
    [MIDI.createSixteenthNote(64)],
    [MIDI.createSixteenthNote(67)],
    [MIDI.createSixteenthNote(71)],
  ],
};
export const Minor7thArpeggio: Pattern = {
  id: "minor-7th-arpeggio",
  name: "Minor 7th Arpeggio",
  aliases: [
    "min7 arpeggio",
    "min7 arp",
    "minor 7th arpeggio",
    "minor 7th arp",
    "m7 arpeggio",
    "m7 arp",
  ],
  stream: [
    [MIDI.createSixteenthNote(60)],
    [MIDI.createSixteenthNote(63)],
    [MIDI.createSixteenthNote(67)],
    [MIDI.createSixteenthNote(70)],
  ],
};
export const Dominant7thArpeggio: Pattern = {
  id: "dominant-7th-arpeggio",
  name: "Dominant 7th Arpeggio",
  aliases: [
    "dom7 arpeggio",
    "dom7 arp",
    "7 arpeggio",
    "7 arp",
    "dominant 7th arpeggio",
    "dominant 7th arp",
  ],
  stream: [
    [MIDI.createSixteenthNote(60)],
    [MIDI.createSixteenthNote(64)],
    [MIDI.createSixteenthNote(67)],
    [MIDI.createSixteenthNote(70)],
  ],
};

export const HalfDiminished7thArpeggio: Pattern = {
  id: "half-diminished-7th-arpeggio",
  name: "Half Diminished 7th Arpeggio",
  aliases: [
    "min7b5 arpeggio",
    "min7b5 arp",
    "m7b5 arpeggio",
    "m7b5 arp",
    "minor 7th flat 5 arpeggio",
    "minor 7th flat 5 arp",
    "minor 7th b5 arpeggio",
    "minor 7th b5 arp",
    "half diminished 7th arpeggio",
    "half diminished 7th arp",
  ],
  stream: [
    [MIDI.createSixteenthNote(60)],
    [MIDI.createSixteenthNote(63)],
    [MIDI.createSixteenthNote(66)],
    [MIDI.createSixteenthNote(70)],
  ],
};

export const Augmented7thArpeggio: Pattern = {
  id: "augmented-7th-arpeggio",
  name: "Augmented 7th Arpeggio",
  aliases: [
    "aug7 arpeggio",
    "aug7 arp",
    "+7 arpeggio",
    "+7 arp",
    "augmented 7th arpeggio",
    "augmented 7th arp",
    "maj7#5 arpeggio",
    "maj7#5 arp",
    "major 7th sharp 5 arpeggio",
    "major 7th sharp 5 arp",
    "major 7th #5 arpeggio",
    "major 7th #5 arp",
  ],
  stream: [
    [MIDI.createSixteenthNote(60)],
    [MIDI.createSixteenthNote(64)],
    [MIDI.createSixteenthNote(68)],
    [MIDI.createSixteenthNote(71)],
  ],
};
export const MinorMajor7thArpeggio: Pattern = {
  id: "major-minor-7th-arpeggio",
  name: "Major Minor 7th Arpeggio",
  aliases: [
    "minmaj7 arpeggio",
    "minmaj7 arp",
    "mM7 arpeggio",
    "mM7 arp",
    "minor major 7th arpeggio",
    "minor major 7th arp",
  ],
  stream: [
    [MIDI.createSixteenthNote(60)],
    [MIDI.createSixteenthNote(63)],
    [MIDI.createSixteenthNote(67)],
    [MIDI.createSixteenthNote(71)],
  ],
};

export default {
  StraightMajorArpeggio,
  TripletMajorArpeggio,
  StraightMinorArpeggio,
  TripletMinorArpeggio,
  StraightDiminishedArpeggio,
  TripletDiminishedArpeggio,
  StraightAugmentedArpeggio,
  TripletAugmentedArpeggio,
  Major7thArpeggio,
  Minor7thArpeggio,
  Dominant7thArpeggio,
  HalfDiminished7thArpeggio,
  Augmented7thArpeggio,
  MinorMajor7thArpeggio,
};
