import { Pose } from "types/Pose";
import * as _ from "utils/durations";

export const FourSemitonesUp: Pose = {
  id: "four-semitones-up",
  name: "Four Semitones (Up)",
  stream: [
    _.createQuarterVector({ chromatic: 0 }),
    _.createQuarterVector({ chromatic: 1 }),
    _.createQuarterVector({ chromatic: 2 }),
    _.createQuarterVector({ chromatic: 3 }),
  ],
};

export const FourSemitonesDown: Pose = {
  id: "four-semitones-down",
  name: "Four Semitones (Down)",
  stream: [
    _.createQuarterVector({ chromatic: 0 }),
    _.createQuarterVector({ chromatic: -1 }),
    _.createQuarterVector({ chromatic: -2 }),
    _.createQuarterVector({ chromatic: -3 }),
  ],
};

export const FourSemitonesUpAndDown: Pose = {
  id: "four-semitones-up-and-down",
  name: "Four Semitones (Up and Down)",
  stream: [
    _.createQuarterVector({ chromatic: 0 }),
    _.createQuarterVector({ chromatic: 1 }),
    _.createQuarterVector({ chromatic: 2 }),
    _.createQuarterVector({ chromatic: 1 }),
  ],
};

export const FourSemitonesDownAndUp: Pose = {
  id: "four-semitones-down-and-up",
  name: "Four Semitones (Down and Up)",
  stream: [
    _.createQuarterVector({ chromatic: 0 }),
    _.createQuarterVector({ chromatic: -1 }),
    _.createQuarterVector({ chromatic: -2 }),
    _.createQuarterVector({ chromatic: -1 }),
  ],
};

export const FourOctavesUp: Pose = {
  id: "four-octaves-up",
  name: "Four Octaves (Up)",
  stream: [
    _.createQuarterVector({ chromatic: 0 }),
    _.createQuarterVector({ chromatic: 12 }),
    _.createQuarterVector({ chromatic: 24 }),
    _.createQuarterVector({ chromatic: 36 }),
  ],
};

export const FourOctavesDown: Pose = {
  id: "four-octaves-down",
  name: "Four Octaves (Down)",
  stream: [
    _.createQuarterVector({ chromatic: 0 }),
    _.createQuarterVector({ chromatic: -12 }),
    _.createQuarterVector({ chromatic: -24 }),
    _.createQuarterVector({ chromatic: -36 }),
  ],
};

export const DiminishedChordUp: Pose = {
  id: "diminished-chord-up",
  name: "Diminished Chord (Up)",
  stream: [
    _.createQuarterVector({ chromatic: 0 }),
    _.createQuarterVector({ chromatic: 3 }),
    _.createQuarterVector({ chromatic: 6 }),
    _.createQuarterVector({ chromatic: 9 }),
  ],
};

export const DiminishedChordDown: Pose = {
  id: "diminished-chord-down",
  name: "Diminished Chord (Down)",
  stream: [
    _.createQuarterVector({ chromatic: 0 }),
    _.createQuarterVector({ chromatic: -3 }),
    _.createQuarterVector({ chromatic: -6 }),
    _.createQuarterVector({ chromatic: -9 }),
  ],
};

export const AugmentedChordUp: Pose = {
  id: "augmented-chord-up",
  name: "Augmented Chord (Up)",
  stream: [
    _.createQuarterVector({ chromatic: 0 }),
    _.createQuarterVector({ chromatic: 4 }),
    _.createQuarterVector({ chromatic: 8 }),
    _.createQuarterVector({ chromatic: 12 }),
  ],
};

export const AugmentedChordDown: Pose = {
  id: "augmented-chord-down",
  name: "Augmented Chord (Down)",
  stream: [
    _.createQuarterVector({ chromatic: 0 }),
    _.createQuarterVector({ chromatic: -4 }),
    _.createQuarterVector({ chromatic: -8 }),
    _.createQuarterVector({ chromatic: -12 }),
  ],
};

export const CircleOfFifthsUp: Pose = {
  id: "circle-of-fifths-up",
  name: "Circle of Fifths (Up)",
  stream: [
    {
      vector: { chromatic: 0, chordal: -0 },
      chain: { chromatic: -5, chordal: 3 },
      duration: 384,
      repeat: 12,
    },
  ],
};

export const CircleOfFifthsDown: Pose = {
  id: "circle-of-fifths-down",
  name: "Circle of Fifths (Down)",
  stream: [
    {
      vector: { chromatic: 0, chordal: -0 },
      chain: { chromatic: 5, chordal: -3 },
      duration: 384,
      repeat: 12,
    },
  ],
};

export default {
  FourSemitonesUp,
  FourSemitonesDown,
  FourSemitonesUpAndDown,
  FourSemitonesDownAndUp,
  FourOctavesUp,
  FourOctavesDown,
  DiminishedChordUp,
  DiminishedChordDown,
  AugmentedChordUp,
  AugmentedChordDown,
  CircleOfFifthsUp,
  CircleOfFifthsDown,
};
