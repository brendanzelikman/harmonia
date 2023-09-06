import { fill } from "lodash";
import { MIDI, Pattern } from "types";

export const TripletWholeNotes: Pattern = {
  id: "triplet-whole-notes",
  name: "Triplet Whole Notes",
  stream: fill(Array(3), [MIDI.createTripletWholeNote()]),
};

export const TripletHalfNotes: Pattern = {
  id: "triplet-half-notes",
  name: "Triplet Half Notes",
  stream: fill(Array(3), [MIDI.createTripletHalfNote()]),
};

export const TripletQuarterNotes: Pattern = {
  id: "triplet-quarter-notes",
  name: "Triplet Quarter Notes",
  stream: fill(Array(6), [MIDI.createTripletQuarterNote()]),
};

export const TripletEighthNotes: Pattern = {
  id: "triplet-eighth-notes",
  name: "Triplet Eighth Notes",
  stream: fill(Array(12), [MIDI.createTripletEighthNote()]),
};

export const TripletSixteenthNotes: Pattern = {
  id: "triplet-sixteenth-notes",
  name: "Triplet Sixteenth Notes",
  stream: fill(Array(24), [MIDI.createTripletSixteenthNote()]),
};

export const TripletThirtySecondNotes: Pattern = {
  id: "triplet-thirty-second-notes",
  name: "Triplet Thirty-Second Notes",
  stream: fill(Array(48), [MIDI.createTripletThirtySecondNote()]),
};

export const TripletSixtyFourthNotes: Pattern = {
  id: "triplet-sixty-fourth-notes",
  name: "Triplet Sixty-Fourth Notes",
  stream: fill(Array(96), [MIDI.createTripletSixtyFourthNote()]),
};
