import { Pattern } from "types/pattern";
import { MIDI } from "types/midi";

export const BellPattern1: Pattern = {
  id: "bell-pattern-1",
  name: "Bell Pattern 1",
  stream: [
    [MIDI.createDottedEighthNote()],
    [MIDI.createSixteenthNote()],
    [MIDI.createEighthRest()],
    [MIDI.createSixteenthNote()],
    [MIDI.createSixteenthNote()],
    [MIDI.createEighthRest()],
    [MIDI.createEighthNote()],
    [MIDI.createDottedEighthNote()],
    [MIDI.createSixteenthNote()],
  ],
};
export const BellPattern2: Pattern = {
  id: "bell-pattern-2",
  name: "Bell Pattern 2",
  stream: [
    [MIDI.createDottedEighthNote()],
    [MIDI.createSixteenthNote()],
    [MIDI.createDottedEighthRest()],
    [MIDI.createSixteenthNote()],
    [MIDI.createEighthRest()],
    [MIDI.createEighthNote()],
    [MIDI.createQuarterNote()],
  ],
};
export const BellPattern3: Pattern = {
  id: "bell-pattern-3",
  name: "Bell Pattern 3",
  stream: [
    [MIDI.createDottedEighthNote()],
    [MIDI.createSixteenthNote()],
    [MIDI.createEighthRest()],
    [MIDI.createEighthNote()],
    [MIDI.createEighthRest()],
    [MIDI.createEighthNote()],
    [MIDI.createQuarterNote()],
  ],
};
export const BellPattern4: Pattern = {
  id: "bell-pattern-4",
  name: "Bell Pattern 4",
  stream: [
    [MIDI.createDottedEighthNote()],
    [MIDI.createSixteenthNote()],
    [MIDI.createEighthRest()],
    [MIDI.createEighthNote()],
    [MIDI.createEighthRest()],
    [MIDI.createEighthNote()],
    [MIDI.createEighthRest()],
    [MIDI.createEighthNote()],
  ],
};
export const BellPattern5: Pattern = {
  id: "bell-pattern-5",
  name: "Bell Pattern 5",
  stream: [
    [MIDI.createQuarterRest()],
    [MIDI.createEighthRest()],
    [MIDI.createEighthNote()],
    [MIDI.createEighthRest()],
    [MIDI.createEighthNote()],
    [MIDI.createEighthRest()],
    [MIDI.createEighthNote()],
  ],
};
export const BellPattern6: Pattern = {
  id: "bell-pattern-6",
  name: "Bell Pattern 6",
  stream: [
    [MIDI.createTripletEighthNote()],
    [MIDI.createTripletEighthRest()],
    [MIDI.createTripletEighthNote()],
    [MIDI.createTripletEighthRest()],
    [MIDI.createTripletEighthRest()],
    [MIDI.createTripletEighthNote()],
    [MIDI.createTripletEighthRest()],
    [MIDI.createTripletEighthNote()],
    [MIDI.createTripletEighthRest()],
    [MIDI.createTripletEighthNote()],
    [MIDI.createTripletEighthRest()],
    [MIDI.createTripletEighthRest()],
  ],
};
export const BellPattern7: Pattern = {
  id: "bell-pattern-7",
  name: "Bell Pattern 7",
  stream: [
    [MIDI.createTripletEighthNote()],
    [MIDI.createTripletEighthRest()],
    [MIDI.createTripletEighthNote()],
    [MIDI.createTripletEighthRest()],
    [MIDI.createTripletEighthNote()],
    [MIDI.createTripletEighthRest()],
    [MIDI.createTripletEighthRest()],
    [MIDI.createTripletEighthNote()],
    [MIDI.createTripletEighthRest()],
    [MIDI.createTripletEighthNote()],
    [MIDI.createTripletEighthRest()],
    [MIDI.createTripletEighthRest()],
  ],
};
export const BellPattern8: Pattern = {
  id: "bell-pattern-8",
  name: "Bell Pattern 8",
  stream: [
    [MIDI.createTripletEighthNote()],
    [MIDI.createTripletEighthRest()],
    [MIDI.createTripletEighthNote()],
    [MIDI.createTripletEighthRest()],
    [MIDI.createTripletEighthNote()],
    [MIDI.createTripletEighthRest()],
    [MIDI.createTripletEighthNote()],
    [MIDI.createTripletEighthNote()],
    [MIDI.createTripletEighthRest()],
    [MIDI.createTripletEighthNote()],
    [MIDI.createTripletEighthRest()],
    [MIDI.createTripletEighthNote()],
  ],
};
export const BellPattern9: Pattern = {
  id: "bell-pattern-9",
  name: "Bell Pattern 9",
  stream: [
    [MIDI.createTripletEighthNote()],
    [MIDI.createTripletEighthRest()],
    [MIDI.createTripletEighthNote()],
    [MIDI.createTripletEighthRest()],
    [MIDI.createTripletEighthNote()],
    [MIDI.createTripletEighthRest()],
    [MIDI.createTripletEighthNote()],
    [MIDI.createTripletEighthRest()],
    [MIDI.createTripletEighthRest()],
    [MIDI.createTripletEighthNote()],
    [MIDI.createTripletEighthRest()],
    [MIDI.createTripletEighthRest()],
  ],
};

export default {
  BellPattern1,
  BellPattern2,
  BellPattern3,
  BellPattern4,
  BellPattern5,
  BellPattern6,
  BellPattern7,
  BellPattern8,
  BellPattern9,
};
