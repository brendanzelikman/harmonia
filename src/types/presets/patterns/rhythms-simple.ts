import { fill } from "lodash";
import { Pattern } from "types/pattern";
import { MIDI } from "types/midi";

export const EighthAndTwoSixteenths: Pattern = {
  id: "eighth-and-two-sixteenths",
  name: "Eighth + Two Sixteenths",
  stream: fill(Array(4), [
    [MIDI.createEighthNote()],
    [MIDI.createSixteenthNote()],
    [MIDI.createSixteenthNote()],
  ]).flat(),
};
export const TwoSixteenthsAndEighth: Pattern = {
  id: "two-sixteenths-and-eighth",
  name: "Two Sixteenths + Eighth",
  stream: fill(Array(4), [
    [MIDI.createSixteenthNote()],
    [MIDI.createSixteenthNote()],
    [MIDI.createEighthNote()],
  ]).flat(),
};
export const SixteenthEighthSixteenth: Pattern = {
  id: "sixteenth-eighth-sixteenth",
  name: "Sixteenth + Eighth + Sixteenth",
  stream: fill(Array(4), [
    [MIDI.createSixteenthNote()],
    [MIDI.createEighthNote()],
    [MIDI.createSixteenthNote()],
  ]).flat(),
};
export const SixteenthAndDottedEighth: Pattern = {
  id: "sixteenth-and-dotted",
  name: "Sixteenth + Dotted Eighth",
  stream: fill(Array(4), [
    [MIDI.createSixteenthNote()],
    [MIDI.createDottedEighthNote()],
  ]).flat(),
};
export const DottedEighthAndSixteenth: Pattern = {
  id: "dotted-and-sixteenth",
  name: "Dotted Eighth + Sixteenth",
  stream: fill(Array(4), [
    [MIDI.createDottedEighthNote()],
    [MIDI.createSixteenthNote()],
  ]).flat(),
};

export default {
  EighthAndTwoSixteenths,
  TwoSixteenthsAndEighth,
  SixteenthEighthSixteenth,
  SixteenthAndDottedEighth,
  DottedEighthAndSixteenth,
};
