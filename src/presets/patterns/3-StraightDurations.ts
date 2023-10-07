import { fill } from "lodash";
import { Pattern } from "types/Pattern";
import { MIDI } from "types/midi";

export const WholeNote: Pattern = {
  id: "whole-note",
  name: "Straight Whole Note",
  aliases: ["whole note"],
  stream: [[MIDI.createWholeNote()]],
};
export const HalfNotes: Pattern = {
  id: "half-notes",
  name: "Straight Half Notes",
  aliases: ["half notes", "halfs", "halves"],
  stream: fill(Array(2), [MIDI.createHalfNote()]),
};
export const QuarterNotes: Pattern = {
  id: "quarter-notes",
  name: "Straight Quarter Notes",
  aliases: ["quarter notes", "quarters"],
  stream: fill(Array(4), [MIDI.createQuarterNote()]),
};
export const EighthNotes: Pattern = {
  id: "eighth-notes",
  name: "Straight Eighth Notes",
  aliases: ["eighth notes", "eighths", "8ths", "8th notes"],
  stream: fill(Array(8), [MIDI.createEighthNote()]),
};
export const SixteenthNotes: Pattern = {
  id: "sixteenth-notes",
  name: "Straight Sixteenth Notes",
  aliases: ["sixteenth notes", "sixteenths", "16ths", "16th notes"],
  stream: fill(Array(16), [MIDI.createSixteenthNote()]),
};
export const ThirtySecondNotes: Pattern = {
  id: "thirty-second-notes",
  name: "Straight Thirty-Second Notes",
  aliases: [
    "thirty-second notes",
    "thirty-seconds",
    "thirty second notes",
    "thirty seconds",
    "32nds",
    "32nd notes",
  ],
  stream: fill(Array(32), [MIDI.createThirtySecondNote()]),
};
export const SixtyFourthNotes: Pattern = {
  id: "sixty-fourth-notes",
  name: "Straight Sixty-Fourth Notes",
  aliases: [
    "sixty-fourth notes",
    "sixty-fourths",
    "sixty fourth notes",
    "sixty fourths",
    "64ths",
    "64th notes",
  ],
  stream: fill(Array(64), [MIDI.createSixtyFourthNote()]),
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
