import { ScaleObject } from "types/Scale";

export const BebopMajorScale: ScaleObject = {
  id: "preset-bebop-major-scale",
  name: "Bebop Major Scale",
  notes: [60, 62, 64, 65, 67, 68, 69, 71],
};
export const BebopMinorScale: ScaleObject = {
  id: "preset-bebop-minor-scale",
  name: "Bebop Minor Scale",
  notes: [60, 62, 63, 64, 65, 67, 69, 70],
};
export const BebopHarmonicMinorScale: ScaleObject = {
  id: "preset-bebop-harmonic-minor-scale",
  name: "Bebop Harmonic Minor Scale",
  notes: [60, 62, 63, 65, 67, 68, 70, 71],
};
export const BebopMelodicMinorScale: ScaleObject = {
  id: "preset-bebop-melodic-minor-scale",
  name: "Bebop Melodic Minor Scale",
  notes: [60, 62, 63, 65, 67, 68, 69, 71],
};
export const BebopDominantScale: ScaleObject = {
  id: "preset-bebop-dominant-scale",
  name: "Bebop Dominant Scale",
  notes: [60, 62, 64, 65, 67, 69, 70, 71],
};
export const OctatonicWHScale: ScaleObject = {
  id: "preset-octatonic-wh-scale",
  name: "Octatonic Scale (W-H)",
  notes: [60, 62, 63, 65, 66, 68, 69, 71],
};
export const OctatonicHWScale: ScaleObject = {
  id: "preset-octatonic-hw-scale",
  name: "Octatonic Scale (H-W)",
  notes: [60, 61, 63, 64, 66, 67, 69, 70],
};

export default {
  BebopMajorScale,
  BebopMinorScale,
  BebopHarmonicMinorScale,
  BebopMelodicMinorScale,
  BebopDominantScale,
  OctatonicWHScale,
  OctatonicHWScale,
};
