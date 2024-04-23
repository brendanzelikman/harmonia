import { Pose } from "types/Pose";
import { WholeNoteTicks } from "utils/durations";

export const FinitelyDownAMinorSecond: Pose = {
  id: "preset-finitely-down-a-minor-second",
  name: "Down a Minor Second",
  stream: [{ vector: { chromatic: -1 }, duration: WholeNoteTicks }],
};

export const FinitelyDownAMajorSecond: Pose = {
  id: "preset-finitely-down-a-major-second",
  name: "Down a Major Second",
  stream: [{ vector: { chromatic: -2 }, duration: WholeNoteTicks }],
};

export const FinitelyDownAMinorThird: Pose = {
  id: "preset-finitely-down-a-minor-third",
  name: "Down a Minor Third",
  stream: [{ vector: { chromatic: -3 }, duration: WholeNoteTicks }],
};

export const FinitelyDownAMajorThird: Pose = {
  id: "preset-finitely-down-a-major-third",
  name: "Down a Major Third",
  stream: [{ vector: { chromatic: -4 }, duration: WholeNoteTicks }],
};

export const FinitelyDownAPerfectFourth: Pose = {
  id: "preset-finitely-down-a-perfect-fourth",
  name: "Down a Perfect Fourth",
  stream: [{ vector: { chromatic: -5 }, duration: WholeNoteTicks }],
};

export const FinitelyDownATritone: Pose = {
  id: "preset-finitely-down-a-tritone",
  name: "Down a Tritone",
  stream: [{ vector: { chromatic: -6 }, duration: WholeNoteTicks }],
};

export const FinitelyDownAPerfectFifth: Pose = {
  id: "preset-finitely-down-a-perfect-fifth",
  name: "Down a Perfect Fifth",
  stream: [{ vector: { chromatic: -7 }, duration: WholeNoteTicks }],
};

export const FinitelyDownAMinorSixth: Pose = {
  id: "preset-finitely-down-a-minor-sixth",
  name: "Down a Minor Sixth",
  stream: [{ vector: { chromatic: -8 }, duration: WholeNoteTicks }],
};

export const FinitelyDownAMajorSixth: Pose = {
  id: "preset-finitely-down-a-major-sixth",
  name: "Down a Major Sixth",
  stream: [{ vector: { chromatic: -9 }, duration: WholeNoteTicks }],
};

export const FinitelyDownAMinorSeventh: Pose = {
  id: "preset-finitely-down-a-minor-seventh",
  name: "Down a Minor Seventh",
  stream: [{ vector: { chromatic: -10 }, duration: WholeNoteTicks }],
};

export const FinitelyDownAMajorSeventh: Pose = {
  id: "preset-finitely-down-a-major-seventh",
  name: "Down a Major Seventh",
  stream: [{ vector: { chromatic: -11 }, duration: WholeNoteTicks }],
};

export const FinitelyDownAnOctave: Pose = {
  id: "preset-finitely-down-an-octave",
  name: "Down an Octave",
  stream: [{ vector: { chromatic: -12 }, duration: WholeNoteTicks }],
};

export default {
  FinitelyDownAMinorSecond,
  FinitelyDownAMajorSecond,
  FinitelyDownAMinorThird,
  FinitelyDownAMajorThird,
  FinitelyDownAPerfectFourth,
  FinitelyDownATritone,
  FinitelyDownAPerfectFifth,
  FinitelyDownAMinorSixth,
  FinitelyDownAMajorSixth,
  FinitelyDownAMinorSeventh,
  FinitelyDownAMajorSeventh,
  FinitelyDownAnOctave,
};
