import { ScaleObject } from "types/Scale";

export const BebopMajorScale: ScaleObject = {
  id: "bebop-major-scale",
  name: "Bebop Major Scale",
  notes: [0, 2, 4, 5, 7, 8, 9, 11].map((degree) => ({ degree })),
};
export const BebopDorianScale: ScaleObject = {
  id: "bebop-dorian-scale",
  name: "Bebop Dorian Scale",
  notes: [0, 2, 3, 4, 5, 7, 9, 10].map((degree) => ({ degree })),
};
export const BebopHarmonicMinorScale: ScaleObject = {
  id: "bebop-harmonic-minor-scale",
  name: "Bebop Harmonic Minor Scale",
  notes: [0, 2, 3, 5, 7, 8, 10, 11].map((degree) => ({ degree })),
};
export const BebopMelodicMinorScale: ScaleObject = {
  id: "bebop-melodic-minor-scale",
  name: "Bebop Melodic Minor Scale",
  notes: [0, 2, 3, 5, 7, 8, 9, 11].map((degree) => ({ degree })),
};
export const BebopDominantScale: ScaleObject = {
  id: "bebop-dominant-scale",
  name: "Bebop Dominant Scale",
  notes: [0, 2, 4, 5, 7, 9, 10, 11].map((degree) => ({ degree })),
};
export const OctatonicWHScale: ScaleObject = {
  id: "octatonic-wh-scale",
  name: "Octatonic Scale (W-H)",
  notes: [0, 2, 3, 5, 6, 8, 9, 11].map((degree) => ({ degree })),
};
export const OctatonicHWScale: ScaleObject = {
  id: "octatonic-hw-scale",
  name: "Octatonic Scale (H-W)",
  notes: [0, 1, 3, 4, 6, 7, 9, 10].map((degree) => ({ degree })),
};

export default {
  BebopMajorScale,
  BebopDorianScale,
  BebopHarmonicMinorScale,
  BebopMelodicMinorScale,
  BebopDominantScale,
  OctatonicWHScale,
  OctatonicHWScale,
};
