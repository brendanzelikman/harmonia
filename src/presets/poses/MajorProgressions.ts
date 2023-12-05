import { Pose } from "types/Pose";
import * as _ from "utils/durations";

export const OneFourFiveMajor: Pose = {
  id: "one-four-five-major",
  name: "I - IV - V",
  stream: [
    _.createQuarterVector({ chordal: 0 }),
    _.createQuarterVector({ chordal: 3 }),
    _.createQuarterVector({ chordal: 4 }),
    _.createQuarterVector({ chordal: -3 }),
  ],
};

export const FourFiveOneMajor: Pose = {
  id: "four-five-one-major",
  name: "IV - V- I",
  stream: [
    _.createQuarterVector({ chordal: 3 }),
    _.createQuarterVector({ chordal: 4 }),
    _.createHalfVector({ chordal: 0 }),
  ],
};

export const OneFourOneFiveMajor: Pose = {
  id: "one-four-one-five-major",
  name: "I - IV - I - V",
  stream: [
    _.createQuarterVector({ chordal: 0 }),
    _.createQuarterVector({ chordal: 3 }),
    _.createQuarterVector({ chordal: 0 }),
    _.createQuarterVector({ chordal: -3 }),
  ],
};

export const OneFourFiveFourMajor: Pose = {
  id: "one-four-five-four-major",
  name: "I - IV - V - IV",
  stream: [
    _.createQuarterVector({ chordal: 0 }),
    _.createQuarterVector({ chordal: 3 }),
    _.createQuarterVector({ chordal: 4 }),
    _.createQuarterVector({ chordal: 3 }),
  ],
};

export const OneSixFourFiveMajor: Pose = {
  id: "one-six-four-five-major",
  name: "I - vi - IV - V",
  stream: [
    _.createQuarterVector({ chordal: 0 }),
    _.createQuarterVector({ chordal: -2 }),
    _.createQuarterVector({ chordal: 3 }),
    _.createQuarterVector({ chordal: 4 }),
  ],
};

export const OneSixTwoFiveMajor: Pose = {
  id: "one-six-two-five-major",
  name: "I - vi - ii - V",
  stream: [
    _.createQuarterVector({ chordal: 0 }),
    _.createQuarterVector({ chordal: -2 }),
    _.createQuarterVector({ chordal: 1 }),
    _.createQuarterVector({ chordal: -3 }),
  ],
};

export const TwoFiveOneMajor: Pose = {
  id: "two-five-one-major",
  name: "ii - V - I",
  stream: [
    _.createQuarterVector({ chordal: 1 }),
    _.createQuarterVector({ chordal: -3 }),
    _.createHalfVector({ chordal: 0 }),
  ],
};

export const TwoFiveOneSixMajor: Pose = {
  id: "two-five-one-six-major",
  name: "ii - V - I - V/ii",
  stream: [
    _.createQuarterVector({ chordal: 1 }),
    _.createQuarterVector({ chordal: -3 }),
    _.createQuarterVector({ chordal: 0 }),
    _.createQuarterVector({ chromatic: 2, chordal: -3 }),
  ],
};

export const TwoFiveOneMajorSub: Pose = {
  id: "two-five-one-major-sub",
  name: "ii - bII - I",
  stream: [
    _.createQuarterVector({ chordal: 1 }),
    _.createQuarterVector({ chromatic: 6, chordal: -3 }),
    _.createHalfVector({}),
  ],
};

export const TwoFiveOneSixMajorSub: Pose = {
  id: "two-five-one-six-major-sub",
  name: "ii - bII - I - V/ii",
  stream: [
    _.createQuarterVector({ chordal: 1 }),
    _.createQuarterVector({ chromatic: 6, chordal: -3 }),
    _.createQuarterVector({}),
    _.createQuarterVector({ chromatic: 2, chordal: -3 }),
  ],
};

export default {
  OneFourFiveMajor,
  FourFiveOneMajor,
  OneFourOneFiveMajor,
  OneFourFiveFourMajor,
  OneSixFourFiveMajor,
  OneSixTwoFiveMajor,
  TwoFiveOneMajor,
  TwoFiveOneSixMajor,
  TwoFiveOneMajorSub,
  TwoFiveOneSixMajorSub,
};
