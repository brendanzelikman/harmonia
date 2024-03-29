import { fill } from "lodash";
import { Pattern } from "types/Pattern";
import * as _ from "utils/durations";

export const EighthAndTwoSixteenths: Pattern = {
  id: "eighth-and-two-sixteenths",
  name: "Eighth + Two Sixteenths",
  stream: fill(Array(4), [
    [_.createEighthNote()],
    [_.createSixteenthNote()],
    [_.createSixteenthNote()],
  ]).flat(),
};
export const TwoSixteenthsAndEighth: Pattern = {
  id: "two-sixteenths-and-eighth",
  name: "Two Sixteenths + Eighth",
  stream: fill(Array(4), [
    [_.createSixteenthNote()],
    [_.createSixteenthNote()],
    [_.createEighthNote()],
  ]).flat(),
};
export const SixteenthEighthSixteenth: Pattern = {
  id: "sixteenth-eighth-sixteenth",
  name: "Sixteenth + Eighth + Sixteenth",
  stream: fill(Array(4), [
    [_.createSixteenthNote()],
    [_.createEighthNote()],
    [_.createSixteenthNote()],
  ]).flat(),
};
export const SixteenthAndDottedEighth: Pattern = {
  id: "sixteenth-and-dotted",
  name: "Sixteenth + Dotted Eighth",
  stream: fill(Array(4), [
    [_.createSixteenthNote()],
    [_.createDottedEighthNote()],
  ]).flat(),
};
export const DottedEighthAndSixteenth: Pattern = {
  id: "dotted-and-sixteenth",
  name: "Dotted Eighth + Sixteenth",
  stream: fill(Array(4), [
    [_.createDottedEighthNote()],
    [_.createSixteenthNote()],
  ]).flat(),
};

export default {
  EighthAndTwoSixteenths,
  TwoSixteenthsAndEighth,
  SixteenthEighthSixteenth,
  SixteenthAndDottedEighth,
  DottedEighthAndSixteenth,
};
