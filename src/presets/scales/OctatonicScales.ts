import { ScaleObject } from "types/Scale/ScaleTypes";

export const BebopMajorScale: ScaleObject = {
  id: "scale_preset_bebop-major-scale",
  name: "Bebop Major Scale",
  notes: [60, 62, 64, 65, 67, 68, 69, 71],
};
export const BebopMinorScale: ScaleObject = {
  id: "scale_preset_bebop-minor-scale",
  name: "Bebop Minor Scale",
  notes: [60, 62, 63, 64, 65, 67, 69, 70],
};
export const BebopHarmonicMinorScale: ScaleObject = {
  id: "scale_preset_bebop-harmonic-minor-scale",
  name: "Bebop Harmonic Minor Scale",
  notes: [60, 62, 63, 65, 67, 68, 70, 71],
};
export const BebopMelodicMinorScale: ScaleObject = {
  id: "scale_preset_bebop-melodic-minor-scale",
  name: "Bebop Melodic Minor Scale",
  notes: [60, 62, 63, 65, 67, 68, 69, 71],
};
export const BebopDominantScale: ScaleObject = {
  id: "scale_preset_bebop-dominant-scale",
  name: "Bebop Dominant Scale",
  notes: [60, 62, 64, 65, 67, 69, 70, 71],
};
export const OctatonicWHScale: ScaleObject = {
  id: "scale_preset_octatonic-wh-scale",
  name: "Octatonic Scale (W-H)",
  notes: [60, 62, 63, 65, 66, 68, 69, 71],
};
export const OctatonicHWScale: ScaleObject = {
  id: "scale_preset_octatonic-hw-scale",
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
