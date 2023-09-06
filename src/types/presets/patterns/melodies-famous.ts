import { MIDI, Pattern } from "types";

export const BachPrelude: Pattern = {
  id: "bach-prelude",
  name: "Prelude in C",
  stream: [
    [MIDI.createEighthNote(60)],
    [MIDI.createEighthNote(64)],
    [MIDI.createEighthNote(67)],
    [MIDI.createEighthNote(72)],
    [MIDI.createEighthNote(76)],
    [MIDI.createEighthNote(67)],
    [MIDI.createEighthNote(72)],
    [MIDI.createEighthNote(76)],
  ],
};
export const AlbertiBass: Pattern = {
  id: "alberti-bass",
  name: "Alberti Bass",
  stream: [
    [MIDI.createEighthNote(60)],
    [MIDI.createEighthNote(67)],
    [MIDI.createEighthNote(64)],
    [MIDI.createEighthNote(67)],
    [MIDI.createEighthNote(60)],
    [MIDI.createEighthNote(67)],
    [MIDI.createEighthNote(64)],
    [MIDI.createEighthNote(67)],
  ],
};
export const TurkishMarch: Pattern = {
  id: "turkish-march",
  name: "Turkish March",
  stream: [
    [MIDI.createSixteenthNote(71)],
    [MIDI.createSixteenthNote(69)],
    [MIDI.createSixteenthNote(68)],
    [MIDI.createSixteenthNote(69)],
    [MIDI.createSixteenthNote(72)],
  ],
};
export const FateMotif: Pattern = {
  id: "fate-motif",
  name: "Fate Motif",
  stream: [
    [MIDI.createEighthRest()],
    [MIDI.createEighthNote(67)],
    [MIDI.createEighthNote(67)],
    [MIDI.createEighthNote(67)],
    [MIDI.createHalfNote(63)],
  ],
};
export const RevolutionaryEtude: Pattern = {
  id: "revolutionary-etude",
  name: "Revolutionary Etude",
  stream: [
    [MIDI.createSixteenthNote(48)],
    [MIDI.createSixteenthNote(55)],
    [MIDI.createSixteenthNote(60)],
    [MIDI.createSixteenthNote(62)],
    [MIDI.createSixteenthNote(63)],
    [MIDI.createSixteenthNote(62)],
    [MIDI.createSixteenthNote(60)],
    [MIDI.createSixteenthNote(55)],
  ],
};
export const ZarahustraFanfare: Pattern = {
  id: "zarahustra-fanfare",
  name: "Zarahustra Fanfare",
  stream: [
    [MIDI.createHalfNote(60)],
    [MIDI.createHalfNote(67)],
    [MIDI.createHalfNote(72)],
    [MIDI.createQuarterRest()],
    [MIDI.createEighthRest()],
    [MIDI.createSixteenthRest()],
    [MIDI.createSixteenthNote(76)],
    [MIDI.createQuarterNote(75)],
  ],
};
export const TheLick: Pattern = {
  id: "the-lick",
  name: "The Lick",
  stream: [
    [MIDI.createEighthNote(62)],
    [MIDI.createEighthNote(64)],
    [MIDI.createEighthNote(65)],
    [MIDI.createEighthNote(67)],
    [MIDI.createQuarterNote(64)],
    [MIDI.createEighthNote(60)],
    [MIDI.createEighthNote(62)],
  ],
};
export const HappyBirthday: Pattern = {
  id: "happy-birthday",
  name: "Happy Birthday",
  stream: [
    [MIDI.createEighthNote(67)],
    [MIDI.createSixteenthRest()],
    [MIDI.createSixteenthNote(67)],
    [MIDI.createQuarterNote(69)],
    [MIDI.createQuarterNote(67)],
    [MIDI.createQuarterNote(72)],
    [MIDI.createQuarterNote(71)],
  ],
};

export default {
  BachPrelude,
  AlbertiBass,
  TurkishMarch,
  FateMotif,
  RevolutionaryEtude,
  ZarahustraFanfare,
  TheLick,
  HappyBirthday,
};
