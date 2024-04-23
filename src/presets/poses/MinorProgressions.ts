import { Pose } from "types/Pose";
import * as _ from "utils/durations";

export const OneFourFiveMinor: Pose = {
  id: "preset-one-four-five-minor",
  name: "i - iv - v",
  stream: [
    _.createQuarterVector({ chordal: 0 }),
    _.createQuarterVector({ chordal: 3 }),
    _.createQuarterVector({ chordal: 4 }),
    _.createQuarterVector({ chordal: -3 }),
  ],
};

export const FourFiveOneMinor: Pose = {
  id: "preset-four-five-one-minor",
  name: "iv - v - i",
  stream: [
    _.createQuarterVector({ chordal: 3 }),
    _.createQuarterVector({ chordal: 4 }),
    _.createHalfVector({ chordal: 0 }),
  ],
};

export const OneFourOneFiveMinor: Pose = {
  id: "preset-one-four-one-five-minor",
  name: "i - iv - i - v",
  stream: [
    _.createQuarterVector({ chordal: 0 }),
    _.createQuarterVector({ chordal: 3 }),
    _.createQuarterVector({ chordal: 0 }),
    _.createQuarterVector({ chordal: -3 }),
  ],
};

export const OneSixFourFiveMinor: Pose = {
  id: "preset-one-six-four-five-minor",
  name: "i - bVI - iv - v",
  stream: [
    _.createQuarterVector({ chordal: 0 }),
    _.createQuarterVector({ chordal: -2 }),
    _.createQuarterVector({ chordal: -4 }),
    _.createQuarterVector({ chordal: -3 }),
  ],
};

export const OneSixThreeSevenMinor: Pose = {
  id: "preset-one-six-three-seven",
  name: "i - bVI - bIII - bVII",
  stream: [
    _.createQuarterVector({ chordal: 0 }),
    _.createQuarterVector({ chordal: -2 }),
    _.createQuarterVector({ chordal: 2 }),
    _.createQuarterVector({ chordal: -1 }),
  ],
};

export const TwoFiveOneMinor: Pose = {
  id: "preset-two-five-one-minor",
  name: "iio - V - I",
  stream: [
    _.createQuarterVector({ chordal: 1 }),
    _.createQuarterVector({ chromatic: -3, chordal: -1 }),
    _.createHalfVector({ chordal: 0 }),
  ],
};

export const OneSevenSixFive: Pose = {
  id: "preset-one-seven-sixfive",
  name: "i - VII - VI - V",
  stream: [
    _.createQuarterVector({ chordal: 0 }),
    _.createQuarterVector({ chordal: -1 }),
    _.createQuarterVector({ chordal: -2 }),
    _.createQuarterVector({ chromatic: -3, chordal: -1 }),
  ],
};

export default {
  OneFourFiveMinor,
  FourFiveOneMinor,
  OneFourOneFiveMinor,
  OneSixFourFiveMinor,
  OneSixThreeSevenMinor,
  TwoFiveOneMinor,
  OneSevenSixFive,
};
