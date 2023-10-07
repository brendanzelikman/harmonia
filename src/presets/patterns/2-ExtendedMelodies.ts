import { Pattern } from "types/Pattern";
import { MIDI } from "types/midi";

export const Major9thArpeggio: Pattern = {
  id: "major-9th-arpeggio",
  name: "Major 9th Arpeggio",
  stream: [
    [MIDI.createSixteenthNote(60)],
    [MIDI.createSixteenthNote(64)],
    [MIDI.createSixteenthNote(67)],
    [MIDI.createSixteenthNote(71)],
    [MIDI.createSixteenthNote(74)],
    [MIDI.createSixteenthNote(71)],
    [MIDI.createSixteenthNote(67)],
    [MIDI.createSixteenthNote(64)],
  ],
};

export const Minor9thArpeggio: Pattern = {
  id: "minor-9th-arpeggio",
  name: "Minor 9th Arpeggio",
  stream: [
    [MIDI.createSixteenthNote(60)],
    [MIDI.createSixteenthNote(63)],
    [MIDI.createSixteenthNote(67)],
    [MIDI.createSixteenthNote(70)],
    [MIDI.createSixteenthNote(74)],
    [MIDI.createSixteenthNote(70)],
    [MIDI.createSixteenthNote(67)],
    [MIDI.createSixteenthNote(63)],
  ],
};

export const Dominant9thArpeggio: Pattern = {
  id: "dominant-9th-arpeggio",
  name: "Dominant 9th Arpeggio",
  stream: [
    [MIDI.createSixteenthNote(60)],
    [MIDI.createSixteenthNote(64)],
    [MIDI.createSixteenthNote(67)],
    [MIDI.createSixteenthNote(70)],
    [MIDI.createSixteenthNote(74)],
    [MIDI.createSixteenthNote(70)],
    [MIDI.createSixteenthNote(67)],
    [MIDI.createSixteenthNote(64)],
  ],
};
export const Major11thArpeggio: Pattern = {
  id: "major-11th-arpeggio",
  name: "Major 11th Arpeggio",
  stream: [
    [MIDI.createSixteenthNote(60)],
    [MIDI.createSixteenthNote(67)],
    [MIDI.createSixteenthNote(71)],
    [MIDI.createSixteenthNote(74)],
    [MIDI.createSixteenthNote(78)],
    [MIDI.createSixteenthNote(74)],
    [MIDI.createSixteenthNote(71)],
    [MIDI.createSixteenthNote(67)],
  ],
};

export const Minor11thArpeggio: Pattern = {
  id: "minor-11th-arpeggio",
  name: "Minor 11th Arpeggio",
  stream: [
    [MIDI.createSixteenthNote(60)],
    [MIDI.createSixteenthNote(67)],
    [MIDI.createSixteenthNote(70)],
    [MIDI.createSixteenthNote(74)],
    [MIDI.createSixteenthNote(77)],
    [MIDI.createSixteenthNote(74)],
    [MIDI.createSixteenthNote(70)],
    [MIDI.createSixteenthNote(67)],
  ],
};

export const Dominant11thArpeggio: Pattern = {
  id: "dominant-11th-arpeggio",
  name: "Dominant 11th Arpeggio",
  stream: [
    [MIDI.createSixteenthNote(60)],
    [MIDI.createSixteenthNote(67)],
    [MIDI.createSixteenthNote(70)],
    [MIDI.createSixteenthNote(74)],
    [MIDI.createSixteenthNote(77)],
    [MIDI.createSixteenthNote(74)],
    [MIDI.createSixteenthNote(70)],
    [MIDI.createSixteenthNote(67)],
  ],
};
export const Major13thArpeggio: Pattern = {
  id: "major-13th-arpeggio",
  name: "Major 13th Arpeggio",
  stream: [
    [MIDI.createSixteenthNote(60)],
    [MIDI.createSixteenthNote(71)],
    [MIDI.createSixteenthNote(74)],
    [MIDI.createSixteenthNote(78)],
    [MIDI.createSixteenthNote(81)],
    [MIDI.createSixteenthNote(78)],
    [MIDI.createSixteenthNote(74)],
    [MIDI.createSixteenthNote(71)],
  ],
};

export const Minor13thArpeggio: Pattern = {
  id: "minor-13th-arpeggio",
  name: "Minor 13th Arpeggio",
  stream: [
    [MIDI.createSixteenthNote(60)],
    [MIDI.createSixteenthNote(70)],
    [MIDI.createSixteenthNote(74)],
    [MIDI.createSixteenthNote(77)],
    [MIDI.createSixteenthNote(81)],
    [MIDI.createSixteenthNote(77)],
    [MIDI.createSixteenthNote(74)],
    [MIDI.createSixteenthNote(70)],
  ],
};

export const Dominant13thArpeggio: Pattern = {
  id: "dominant-13th-arpeggio",
  name: "Dominant 13th Arpeggio",
  stream: [
    [MIDI.createSixteenthNote(60)],
    [MIDI.createSixteenthNote(70)],
    [MIDI.createSixteenthNote(74)],
    [MIDI.createSixteenthNote(77)],
    [MIDI.createSixteenthNote(81)],
    [MIDI.createSixteenthNote(77)],
    [MIDI.createSixteenthNote(74)],
    [MIDI.createSixteenthNote(70)],
  ],
};

export default {
  Major9thArpeggio,
  Major11thArpeggio,
  Major13thArpeggio,
  Minor9thArpeggio,
  Minor11thArpeggio,
  Minor13thArpeggio,
  Dominant9thArpeggio,
  Dominant11thArpeggio,
  Dominant13thArpeggio,
};
