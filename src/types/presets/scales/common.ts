import { Scale } from "types";

export const ChromaticScale: Scale = {
  id: "chromatic-scale",
  name: "Chromatic Scale",
  notes: [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71],
};
export const MajorScale: Scale = {
  id: "major-scale",
  name: "Major Scale",
  notes: [60, 62, 64, 65, 67, 69, 71],
};
export const MinorScale: Scale = {
  id: "minor-scale",
  name: "Minor Scale",
  notes: [60, 62, 63, 65, 67, 68, 70],
};
export const HarmonicMinorScale: Scale = {
  id: "harmonic-minor-scale",
  name: "Harmonic Minor Scale",
  notes: [60, 62, 63, 65, 67, 68, 71],
};
export const MelodicMinorScale: Scale = {
  id: "melodic-minor-scale",
  name: "Melodic Minor Scale",
  notes: [60, 62, 63, 65, 67, 69, 71],
};
