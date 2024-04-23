import { fill } from "lodash";
import { Pattern } from "types/Pattern";
import * as _ from "utils/durations";

export const TripletWholeNotes: Pattern = {
  id: "preset-triplet-whole-notes",
  name: "Triplet Whole Notes",
  aliases: ["triplet whole notes", "triplet wholes"],
  stream: fill(Array(3), [_.createTripletWholeNote()]),
};

export const TripletHalfNotes: Pattern = {
  id: "preset-triplet-half-notes",
  name: "Triplet Half Notes",
  aliases: ["triplet half notes", "triplet halfs", "triplet halves"],
  stream: fill(Array(3), [_.createTripletHalfNote()]),
};

export const TripletQuarterNotes: Pattern = {
  id: "preset-triplet-quarter-notes",
  name: "Triplet Quarter Notes",
  aliases: ["triplet quarter notes", "triplet quarters"],
  stream: fill(Array(6), [_.createTripletQuarterNote()]),
};

export const TripletEighthNotes: Pattern = {
  id: "preset-triplet-eighth-notes",
  name: "Triplet Eighth Notes",
  aliases: ["triplet eighth notes", "triplet eighths", "triplet 8ths"],
  stream: fill(Array(12), [_.createTripletEighthNote()]),
};

export const TripletSixteenthNotes: Pattern = {
  id: "preset-triplet-sixteenth-notes",
  name: "Triplet Sixteenth Notes",
  aliases: [
    "triplet sixteenth notes",
    "triplet sixteenths",
    "triplet 16ths",
    "triplet 16th notes",
  ],
  stream: fill(Array(24), [_.createTripletSixteenthNote()]),
};

export const TripletThirtySecondNotes: Pattern = {
  id: "preset-triplet-thirty-second-notes",
  name: "Triplet Thirty-Second Notes",
  aliases: [
    "triplet thirty-second notes",
    "triplet thirty-seconds",
    "triplet 32nds",
    "triplet 32nd notes",
  ],
  stream: fill(Array(48), [_.createTripletThirtySecondNote()]),
};

export const TripletSixtyFourthNotes: Pattern = {
  id: "preset-triplet-sixty-fourth-notes",
  name: "Triplet Sixty-Fourth Notes",
  aliases: [
    "triplet sixty-fourth notes",
    "triplet sixty-fourths",
    "triplet 64ths",
    "triplet 64th notes",
  ],
  stream: fill(Array(96), [_.createTripletSixtyFourthNote()]),
};

export default {
  TripletWholeNotes,
  TripletHalfNotes,
  TripletQuarterNotes,
  TripletEighthNotes,
  TripletSixteenthNotes,
  TripletThirtySecondNotes,
  TripletSixtyFourthNotes,
};
