import { fill } from "lodash";
import { Pattern } from "types/Pattern/PatternTypes";
import * as _ from "utils/duration";

export const DottedWholeNotes: Pattern = {
  id: "pattern_preset_dotted-whole-note",
  name: "Dotted Whole Note",
  aliases: ["dotted whole note", "dotted whole"],
  stream: [[_.createDottedWholeNote()], [_.createDottedWholeNote()]],
};
export const DottedHalfNotes: Pattern = {
  id: "pattern_preset_dotted-half-notes",
  name: "Dotted Half Notes",
  aliases: ["dotted half notes", "dotted halfs", "dotted halves"],
  stream: fill(Array(4), [_.createDottedHalfNote()]),
};
export const DottedQuarterNotes: Pattern = {
  id: "pattern_preset_dotted-quarter-notes",
  name: "Dotted Quarter Notes",
  aliases: ["dotted quarter notes", "dotted quarters"],
  stream: fill(Array(4), [_.createDottedQuarterNote()]),
};
export const DottedEighthNotes: Pattern = {
  id: "pattern_preset_dotted-eighth-notes",
  name: "Dotted Eighth Notes",
  aliases: [
    "dotted eighth notes",
    "dotted eighths",
    "dotted 8th notes",
    "dotted 8ths",
  ],
  stream: fill(Array(8), [_.createDottedEighthNote()]),
};
export const DottedSixteenthNotes: Pattern = {
  id: "pattern_preset_dotted-sixteenth-notes",
  name: "Dotted Sixteenth Notes",
  aliases: [
    "dotted sixteenth notes",
    "dotted sixteenths",
    "dotted 16ths",
    "dotted 16th notes",
  ],

  stream: fill(Array(16), [_.createDottedSixteenthNote()]),
};
export const DottedThirtySecondNotes: Pattern = {
  id: "pattern_preset_dotted-thirty-second-notes",
  name: "Dotted Thirty-Second Notes",
  aliases: [
    "dotted thirty-second notes",
    "dotted thirty-seconds",
    "dotted thirty second notes",
    "dotted thirty seconds",
    "dotted 32nds",
    "dotted 32nd notes",
  ],
  stream: fill(Array(32), [_.createDottedThirtySecondNote()]),
};
export const DottedSixtyFourthNotes: Pattern = {
  id: "pattern_preset_dotted-sixty-fourth-notes",
  name: "Dotted Sixty-Fourth Notes",
  aliases: [
    "dotted sixty-fourth notes",
    "dotted sixty-fourths",
    "dotted sixty fourth notes",
    "dotted sixty fourths",
    "dotted 64ths",
    "dotted 64th notes",
  ],
  stream: fill(Array(64), [_.createDottedSixtyFourthNote()]),
};

export default {
  DottedWholeNotes,
  DottedHalfNotes,
  DottedQuarterNotes,
  DottedEighthNotes,
  DottedSixteenthNotes,
  DottedThirtySecondNotes,
  DottedSixtyFourthNotes,
};
