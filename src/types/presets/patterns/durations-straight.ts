import { fill } from "lodash";
import { MIDI, Pattern } from "types";

export const WholeNote: Pattern = {
  id: "whole-note",
  name: "Straight Whole Note",
  stream: [[MIDI.createWholeNote()]],
};
export const HalfNotes: Pattern = {
  id: "half-notes",
  name: "Straight Half Notes",
  stream: fill(Array(2), [MIDI.createHalfNote()]),
};
export const QuarterNotes: Pattern = {
  id: "quarter-notes",
  name: "Straight Quarter Notes",
  stream: fill(Array(4), [MIDI.createQuarterNote()]),
};
export const EighthNotes: Pattern = {
  id: "eighth-notes",
  name: "Straight Eighth Notes",
  stream: fill(Array(8), [MIDI.createEighthNote()]),
};
export const SixteenthNotes: Pattern = {
  id: "sixteenth-notes",
  name: "Straight Sixteenth Notes",
  stream: fill(Array(16), [MIDI.createSixteenthNote()]),
};
export const ThirtySecondNotes: Pattern = {
  id: "thirty-second-notes",
  name: "Straight Thirty-Second Notes",
  stream: fill(Array(32), [MIDI.createThirtySecondNote()]),
};
export const SixtyFourthNotes: Pattern = {
  id: "sixty-fourth-notes",
  name: "Straight Sixty-Fourth Notes",
  stream: fill(Array(64), [MIDI.createSixtyFourthNote()]),
};
