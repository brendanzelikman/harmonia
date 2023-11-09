import { ScaleObject } from "types/Scale";

export const ChromaticScale: ScaleObject = {
  id: "chromatic-scale",
  name: "Chromatic Scale",
  notes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((degree) => ({ degree })),
};
export const MajorScale: ScaleObject = {
  id: "major-scale",
  name: "Major Scale",
  notes: [0, 2, 4, 5, 7, 9, 11].map((degree) => ({ degree })),
};
export const MinorScale: ScaleObject = {
  id: "minor-scale",
  name: "Minor Scale",
  notes: [0, 2, 3, 5, 7, 8, 10].map((degree) => ({ degree })),
};
export const HarmonicMinorScale: ScaleObject = {
  id: "harmonic-minor-scale",
  name: "Harmonic Minor Scale",
  notes: [0, 2, 3, 5, 7, 8, 11].map((degree) => ({ degree })),
};
export const MelodicMinorScale: ScaleObject = {
  id: "melodic-minor-scale",
  name: "Melodic Minor Scale",
  notes: [0, 2, 3, 5, 7, 9, 11].map((degree) => ({ degree })),
};

export default {
  ChromaticScale,
  MajorScale,
  MinorScale,
  HarmonicMinorScale,
  MelodicMinorScale,
};
