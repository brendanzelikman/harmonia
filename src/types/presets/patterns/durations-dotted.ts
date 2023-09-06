import { fill } from "lodash";
import { MIDI, Pattern } from "types";

export const DottedWholeNotes: Pattern = {
  id: "dotted-whole-note",
  name: "Dotted Whole Note",
  stream: [[MIDI.createDottedWholeNote()], [MIDI.createDottedWholeNote()]],
};
export const DottedHalfNotes: Pattern = {
  id: "dotted-half-notes",
  name: "Dotted Half Notes",
  stream: fill(Array(4), [MIDI.createDottedHalfNote()]),
};
export const DottedQuarterNotes: Pattern = {
  id: "dotted-quarter-notes",
  name: "Dotted Quarter Notes",
  stream: fill(Array(4), [MIDI.createDottedQuarterNote()]),
};
export const DottedEighthNotes: Pattern = {
  id: "dotted-eighth-notes",
  name: "Dotted Eighth Notes",
  stream: fill(Array(8), [MIDI.createDottedEighthNote()]),
};
export const DottedSixteenthNotes: Pattern = {
  id: "dotted-sixteenth-notes",
  name: "Dotted Sixteenth Notes",
  stream: fill(Array(16), [MIDI.createDottedSixteenthNote()]),
};
export const DottedThirtySecondNotes: Pattern = {
  id: "dotted-thirty-second-notes",
  name: "Dotted Thirty-Second Notes",
  stream: fill(Array(32), [MIDI.createDottedThirtySecondNote()]),
};
export const DottedSixtyFourthNotes: Pattern = {
  id: "dotted-sixty-fourth-notes",
  name: "Dotted Sixty-Fourth Notes",
  stream: fill(Array(64), [MIDI.createDottedSixtyFourthNote()]),
};
