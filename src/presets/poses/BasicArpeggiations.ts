import { Pose } from "types/Pose";
import * as _ from "utils/durations";

export const ArpeggiateUp: Pose = {
  id: "arpeggiate-up",
  name: "Arpeggiate Up",
  stream: [
    _.createQuarterVector({ chordal: 0 }),
    _.createQuarterVector({ chordal: 1 }),
    _.createQuarterVector({ chordal: 2 }),
    _.createQuarterVector({ chordal: 3 }),
  ],
};

export const ArpeggiateUpBelow: Pose = {
  id: "arpeggiate-up-below",
  name: "Arpeggiate Up (-1 Octave)",
  stream: [
    _.createQuarterVector({ chromatic: -12, chordal: 0 }),
    _.createQuarterVector({ chromatic: -12, chordal: 1 }),
    _.createQuarterVector({ chromatic: -12, chordal: 2 }),
    _.createQuarterVector({ chromatic: -12, chordal: 3 }),
  ],
};

export const ArpeggiateUpAbove: Pose = {
  id: "arpeggiate-up-above",
  name: "Arpeggiate Up (+1 Octave)",
  stream: [
    _.createQuarterVector({ chromatic: 12, chordal: 0 }),
    _.createQuarterVector({ chromatic: 12, chordal: 1 }),
    _.createQuarterVector({ chromatic: 12, chordal: 2 }),
    _.createQuarterVector({ chromatic: 12, chordal: 3 }),
  ],
};

export const ArpeggiateDown: Pose = {
  id: "arpeggiate-down",
  name: "Arpeggiate Down",
  stream: [
    _.createQuarterVector({ chordal: 0 }),
    _.createQuarterVector({ chordal: -1 }),
    _.createQuarterVector({ chordal: -2 }),
    _.createQuarterVector({ chordal: -3 }),
  ],
};

export const ArpeggiateDownBelow: Pose = {
  id: "arpeggiate-down-below",
  name: "Arpeggiate Down (-1 Octave)",
  stream: [
    _.createQuarterVector({ chromatic: -12, chordal: 0 }),
    _.createQuarterVector({ chromatic: -12, chordal: -1 }),
    _.createQuarterVector({ chromatic: -12, chordal: -2 }),
    _.createQuarterVector({ chromatic: -12, chordal: -3 }),
  ],
};

export const ArpeggiateDownAbove: Pose = {
  id: "arpeggiate-down-above",
  name: "Arpeggiate Down (+1 Octave)",
  stream: [
    _.createQuarterVector({ chromatic: 12, chordal: 0 }),
    _.createQuarterVector({ chromatic: 12, chordal: -1 }),
    _.createQuarterVector({ chromatic: 12, chordal: -2 }),
    _.createQuarterVector({ chromatic: 12, chordal: -3 }),
  ],
};

export const ArpeggiateUpAndDown: Pose = {
  id: "arpeggiate-up-and-down",
  name: "Arpeggiate Up and Down",
  stream: [
    _.createQuarterVector({ chordal: 0 }),
    _.createQuarterVector({ chordal: 1 }),
    _.createQuarterVector({ chordal: 2 }),
    _.createQuarterVector({ chordal: 1 }),
  ],
};

export const ArpeggiateUpAndDownBelow: Pose = {
  id: "arpeggiate-up-and-down-below",
  name: "Arpeggiate Up and Down (-1 Octave)",
  stream: [
    _.createQuarterVector({ chromatic: -12, chordal: 0 }),
    _.createQuarterVector({ chromatic: -12, chordal: 1 }),
    _.createQuarterVector({ chromatic: -12, chordal: 2 }),
    _.createQuarterVector({ chromatic: -12, chordal: 1 }),
  ],
};

export const ArpeggiateUpAndDownAbove: Pose = {
  id: "arpeggiate-up-and-down-above",
  name: "Arpeggiate Up and Down (+1 Octave)",
  stream: [
    _.createQuarterVector({ chromatic: 12, chordal: 0 }),
    _.createQuarterVector({ chromatic: 12, chordal: 1 }),
    _.createQuarterVector({ chromatic: 12, chordal: 2 }),
    _.createQuarterVector({ chromatic: 12, chordal: 1 }),
  ],
};

export const ArpeggiateDownAndUp: Pose = {
  id: "arpeggiate-down-and-up",
  name: "Arpeggiate Down and Up",
  stream: [
    _.createQuarterVector({ chordal: 0 }),
    _.createQuarterVector({ chordal: -1 }),
    _.createQuarterVector({ chordal: -2 }),
    _.createQuarterVector({ chordal: -1 }),
  ],
};

export const ArpeggiateDownAndUpBelow: Pose = {
  id: "arpeggiate-down-and-up-below",
  name: "Arpeggiate Down And Up (-1 Octave)",
  stream: [
    _.createQuarterVector({ chromatic: -12, chordal: 0 }),
    _.createQuarterVector({ chromatic: -12, chordal: -1 }),
    _.createQuarterVector({ chromatic: -12, chordal: -2 }),
    _.createQuarterVector({ chromatic: -12, chordal: -1 }),
  ],
};

export const ArpeggiateDownAndUpAbove: Pose = {
  id: "arpeggiate-down-and-up-above",
  name: "Arpeggiate Down And Up (+1 Octave)",
  stream: [
    _.createQuarterVector({ chromatic: 12, chordal: 0 }),
    _.createQuarterVector({ chromatic: 12, chordal: -1 }),
    _.createQuarterVector({ chromatic: 12, chordal: -2 }),
    _.createQuarterVector({ chromatic: 12, chordal: -1 }),
  ],
};

export default {
  ArpeggiateUp,
  ArpeggiateUpBelow,
  ArpeggiateUpAbove,
  ArpeggiateDown,
  ArpeggiateDownBelow,
  ArpeggiateDownAbove,
  ArpeggiateUpAndDown,
  ArpeggiateUpAndDownBelow,
  ArpeggiateUpAndDownAbove,
  ArpeggiateDownAndUp,
  ArpeggiateDownAndUpBelow,
  ArpeggiateDownAndUpAbove,
};
