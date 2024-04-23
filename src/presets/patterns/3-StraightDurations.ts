import { fill } from "lodash";
import { Pattern } from "types/Pattern";
import * as _ from "utils/durations";

export const WholeNote: Pattern = {
  id: "preset-whole-note",
  name: "Straight Whole Note",
  aliases: ["whole note"],
  stream: [[_.createWholeNote()]],
};
export const HalfNotes: Pattern = {
  id: "preset-half-notes",
  name: "Straight Half Notes",
  aliases: ["half notes", "halfs", "halves"],
  stream: fill(Array(2), [_.createHalfNote()]),
};
export const QuarterNotes: Pattern = {
  id: "preset-quarter-notes",
  name: "Straight Quarter Notes",
  aliases: ["quarter notes", "quarters"],
  stream: fill(Array(4), [_.createQuarterNote()]),
};
export const EighthNotes: Pattern = {
  id: "preset-eighth-notes",
  name: "Straight Eighth Notes",
  aliases: ["eighth notes", "eighths", "8ths", "8th notes"],
  stream: fill(Array(8), [_.createEighthNote()]),
};
export const SixteenthNotes: Pattern = {
  id: "preset-sixteenth-notes",
  name: "Straight Sixteenth Notes",
  aliases: ["sixteenth notes", "sixteenths", "16ths", "16th notes"],
  stream: fill(Array(16), [_.createSixteenthNote()]),
};
export const ThirtySecondNotes: Pattern = {
  id: "preset-thirty-second-notes",
  name: "Straight Thirty-Second Notes",
  aliases: [
    "thirty-second notes",
    "thirty-seconds",
    "thirty second notes",
    "thirty seconds",
    "32nds",
    "32nd notes",
  ],
  stream: fill(Array(32), [_.createThirtySecondNote()]),
};
export const SixtyFourthNotes: Pattern = {
  id: "preset-sixty-fourth-notes",
  name: "Straight Sixty-Fourth Notes",
  aliases: [
    "sixty-fourth notes",
    "sixty-fourths",
    "sixty fourth notes",
    "sixty fourths",
    "64ths",
    "64th notes",
  ],
  stream: fill(Array(64), [_.createSixtyFourthNote()]),
};

export default {
  WholeNote,
  HalfNotes,
  QuarterNotes,
  EighthNotes,
  SixteenthNotes,
  ThirtySecondNotes,
  SixtyFourthNotes,
};
