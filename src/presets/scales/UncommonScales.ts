import { ScaleObject } from "types/Scale";

export const AcousticScale: ScaleObject = {
  id: "acoustic-scale",
  name: "Acoustic Scale",
  notes: [0, 2, 4, 6, 7, 9, 10].map((degree) => ({ degree })),
};
export const AlteredScale: ScaleObject = {
  id: "altered-scale",
  name: "Altered Scale",
  notes: [0, 1, 3, 4, 6, 8, 10].map((degree) => ({ degree })),
};
export const PersianScale: ScaleObject = {
  id: "persian-scale",
  name: "Persian Scale",
  notes: [0, 1, 4, 5, 6, 8, 11].map((degree) => ({ degree })),
};
export const HarmonicMajorScale: ScaleObject = {
  id: "harmonic-major-scale",
  name: "Harmonic Major Scale",
  notes: [0, 2, 4, 5, 7, 8, 11].map((degree) => ({ degree })),
};
export const DoubleHarmonicMajorScale: ScaleObject = {
  id: "double-harmonic-major-scale",
  name: "Double Harmonic Major Scale",
  notes: [0, 1, 4, 5, 7, 8, 11].map((degree) => ({ degree })),
};
export const HungarianMinorScale: ScaleObject = {
  id: "hungarian-minor-scale",
  name: "Hungarian Minor Scale",
  notes: [0, 2, 3, 6, 7, 8, 11].map((degree) => ({ degree })),
};
export const HungarianMajorScale: ScaleObject = {
  id: "hungarian-major-scale",
  name: "Hungarian Major Scale",
  notes: [0, 3, 4, 6, 7, 9, 10].map((degree) => ({ degree })),
};
export const NeapolitanMajorScale: ScaleObject = {
  id: "neapolitan-major-scale",
  name: "Neapolitan Major Scale",
  notes: [0, 1, 3, 5, 7, 9, 11].map((degree) => ({ degree })),
};
export const NeapolitanMinorScale: ScaleObject = {
  id: "neapolitan-minor-scale",
  name: "Neapolitan Minor Scale",
  notes: [0, 1, 3, 5, 7, 8, 11].map((degree) => ({ degree })),
};
export const RomanianMajorScale: ScaleObject = {
  id: "romanian-major-scale",
  name: "Romanian Major Scale",
  notes: [0, 1, 4, 6, 7, 9, 10].map((degree) => ({ degree })),
};
export const EnigmaticScale: ScaleObject = {
  id: "enigmatic-scale",
  name: "Enigmatic Scale",
  notes: [0, 1, 4, 6, 8, 10, 11].map((degree) => ({ degree })),
};

export default {
  AcousticScale,
  AlteredScale,
  PersianScale,
  RomanianMajorScale,
  HarmonicMajorScale,
  DoubleHarmonicMajorScale,
  HungarianMinorScale,
  HungarianMajorScale,
  NeapolitanMajorScale,
  NeapolitanMinorScale,
  EnigmaticScale,
};
