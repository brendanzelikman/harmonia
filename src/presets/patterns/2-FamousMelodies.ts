import { Pattern } from "types/Pattern";
import * as _ from "utils/durations";

export const BachPrelude: Pattern = {
  id: "preset-bach-prelude",
  name: "Prelude in C",
  stream: [
    [_.createEighthNote(60)],
    [_.createEighthNote(64)],
    [_.createEighthNote(67)],
    [_.createEighthNote(72)],
    [_.createEighthNote(76)],
    [_.createEighthNote(67)],
    [_.createEighthNote(72)],
    [_.createEighthNote(76)],
  ],
};
export const AlbertiBass: Pattern = {
  id: "preset-alberti-bass",
  name: "Alberti Bass",
  stream: [
    [_.createEighthNote(60)],
    [_.createEighthNote(67)],
    [_.createEighthNote(64)],
    [_.createEighthNote(67)],
    [_.createEighthNote(60)],
    [_.createEighthNote(67)],
    [_.createEighthNote(64)],
    [_.createEighthNote(67)],
  ],
};
export const TurkishMarch: Pattern = {
  id: "preset-turkish-march",
  name: "Turkish March",
  stream: [
    [_.createSixteenthNote(71)],
    [_.createSixteenthNote(69)],
    [_.createSixteenthNote(68)],
    [_.createSixteenthNote(69)],
    [_.createSixteenthNote(72)],
  ],
};
export const FateMotif: Pattern = {
  id: "preset-fate-motif",
  name: "Fate Motif",
  stream: [
    _.createEighthRest(),
    [_.createEighthNote(67)],
    [_.createEighthNote(67)],
    [_.createEighthNote(67)],
    [_.createHalfNote(63)],
  ],
};
export const RevolutionaryEtude: Pattern = {
  id: "preset-revolutionary-etude",
  name: "Revolutionary Etude",
  stream: [
    [_.createSixteenthNote(48)],
    [_.createSixteenthNote(55)],
    [_.createSixteenthNote(60)],
    [_.createSixteenthNote(62)],
    [_.createSixteenthNote(63)],
    [_.createSixteenthNote(62)],
    [_.createSixteenthNote(60)],
    [_.createSixteenthNote(55)],
  ],
};
export const ZarahustraFanfare: Pattern = {
  id: "preset-zarahustra-fanfare",
  name: "Zarahustra Fanfare",
  stream: [
    [_.createHalfNote(60)],
    [_.createHalfNote(67)],
    [_.createHalfNote(72)],
    _.createQuarterRest(),
    _.createEighthRest(),
    _.createSixteenthRest(),
    [_.createSixteenthNote(76)],
    [_.createQuarterNote(75)],
  ],
};
export const TheLick: Pattern = {
  id: "preset-the-lick",
  name: "The Lick",
  stream: [
    [_.createEighthNote(62)],
    [_.createEighthNote(64)],
    [_.createEighthNote(65)],
    [_.createEighthNote(67)],
    [_.createQuarterNote(64)],
    [_.createEighthNote(60)],
    [_.createEighthNote(62)],
  ],
};
export const HappyBirthday: Pattern = {
  id: "preset-happy-birthday",
  name: "Happy Birthday",
  stream: [
    [_.createEighthNote(67)],
    _.createSixteenthRest(),
    [_.createSixteenthNote(67)],
    [_.createQuarterNote(69)],
    [_.createQuarterNote(67)],
    [_.createQuarterNote(72)],
    [_.createQuarterNote(71)],
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
