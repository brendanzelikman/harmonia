import { Scale } from "types";

export const AcousticScale: Scale = {
  id: "acoustic-scale",
  name: "Acoustic Scale",
  notes: [60, 62, 64, 66, 67, 69, 70],
};
export const AlteredScale: Scale = {
  id: "altered-scale",
  name: "Altered Scale",
  notes: [60, 61, 63, 64, 66, 68, 70],
};
export const PersianScale: Scale = {
  id: "persian-scale",
  name: "Persian Scale",
  notes: [60, 61, 64, 65, 66, 68, 71],
};
export const HarmonicMajorScale: Scale = {
  id: "harmonic-major-scale",
  name: "Harmonic Major Scale",
  notes: [60, 62, 64, 65, 67, 68, 71],
};
export const DoubleHarmonicMajorScale: Scale = {
  id: "double-harmonic-major-scale",
  name: "Double Harmonic Major Scale",
  notes: [60, 61, 64, 65, 67, 68, 71],
};
export const HungarianMinorScale: Scale = {
  id: "hungarian-minor-scale",
  name: "Hungarian Minor Scale",
  notes: [60, 62, 63, 66, 67, 68, 71],
};
export const HungarianMajorScale: Scale = {
  id: "hungarian-major-scale",
  name: "Hungarian Major Scale",
  notes: [60, 63, 64, 66, 67, 69, 70],
};
export const NeapolitanMajorScale: Scale = {
  id: "neapolitan-major-scale",
  name: "Neapolitan Major Scale",
  notes: [60, 61, 63, 65, 67, 69, 71],
};
export const NeapolitanMinorScale: Scale = {
  id: "neapolitan-minor-scale",
  name: "Neapolitan Minor Scale",
  notes: [60, 61, 63, 65, 67, 68, 71],
};

export default {
  AcousticScale,
  AlteredScale,
  PersianScale,
  HarmonicMajorScale,
  DoubleHarmonicMajorScale,
  HungarianMinorScale,
  HungarianMajorScale,
  NeapolitanMajorScale,
  NeapolitanMinorScale,
};
