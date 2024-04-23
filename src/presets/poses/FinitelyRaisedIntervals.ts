import { Pose } from "types/Pose";
import { WholeNoteTicks } from "utils/durations";

export const FinitelyUpAMinorSecond: Pose = {
  id: "preset-finitely-up-a-minor-second",
  name: "Up a Minor Second",
  stream: [{ vector: { chromatic: 1 }, duration: WholeNoteTicks }],
};

export const FinitelyUpAMajorSecond: Pose = {
  id: "preset-finitely-up-a-major-second",
  name: "Up a Major Second",
  stream: [{ vector: { chromatic: 2 }, duration: WholeNoteTicks }],
};

export const FinitelyUpAMinorThird: Pose = {
  id: "preset-finitely-up-a-minor-third",
  name: "Up a Minor Third",
  stream: [{ vector: { chromatic: 3 }, duration: WholeNoteTicks }],
};

export const FinitelyUpAMajorThird: Pose = {
  id: "preset-finitely-up-a-major-third",
  name: "Up a Major Third",
  stream: [{ vector: { chromatic: 4 }, duration: WholeNoteTicks }],
};

export const FinitelyUpAPerfectFourth: Pose = {
  id: "preset-finitely-up-a-perfect-fourth",
  name: "Up a Perfect Fourth",
  stream: [{ vector: { chromatic: 5 }, duration: WholeNoteTicks }],
};

export const FinitelyUpATritone: Pose = {
  id: "preset-finitely-up-a-tritone",
  name: "Up a Tritone",
  stream: [{ vector: { chromatic: 6 }, duration: WholeNoteTicks }],
};

export const FinitelyUpAPerfectFifth: Pose = {
  id: "preset-finitely-up-a-perfect-fifth",
  name: "Up a Perfect Fifth",
  stream: [{ vector: { chromatic: 7 }, duration: WholeNoteTicks }],
};

export const FinitelyUpAMinorSixth: Pose = {
  id: "preset-finitely-up-a-minor-sixth",
  name: "Up a Minor Sixth",
  stream: [{ vector: { chromatic: 8 }, duration: WholeNoteTicks }],
};

export const FinitelyUpAMajorSixth: Pose = {
  id: "preset-finitely-up-a-major-sixth",
  name: "Up a Major Sixth",
  stream: [{ vector: { chromatic: 9 }, duration: WholeNoteTicks }],
};

export const FinitelyUpAMinorSeventh: Pose = {
  id: "preset-finitely-up-a-minor-seventh",
  name: "Up a Minor Seventh",
  stream: [{ vector: { chromatic: 10 }, duration: WholeNoteTicks }],
};

export const FinitelyUpAMajorSeventh: Pose = {
  id: "preset-finitely-up-a-major-seventh",
  name: "Up a Major Seventh",
  stream: [{ vector: { chromatic: 11 }, duration: WholeNoteTicks }],
};

export const FinitelyUpAnOctave: Pose = {
  id: "preset-finitely-up-an-octave",
  name: "Up an Octave",
  stream: [{ vector: { chromatic: 12 }, duration: WholeNoteTicks }],
};

export default {
  FinitelyUpAMinorSecond,
  FinitelyUpAMajorSecond,
  FinitelyUpAMinorThird,
  FinitelyUpAMajorThird,
  FinitelyUpAPerfectFourth,
  FinitelyUpATritone,
  FinitelyUpAPerfectFifth,
  FinitelyUpAMinorSixth,
  FinitelyUpAMajorSixth,
  FinitelyUpAMinorSeventh,
  FinitelyUpAMajorSeventh,
  FinitelyUpAnOctave,
};
