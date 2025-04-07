import { ScaleObject } from "types/Scale/ScaleTypes";

export const BebopMajorScale: ScaleObject = {
  id: "scale_preset_bebop_major",
  name: "Bebop Major",
  notes: [60, 62, 64, 65, 67, 68, 69, 71],
};
export const BebopMinorScale: ScaleObject = {
  id: "scale_preset_bebop_minor",
  name: "Bebop Minor",
  notes: [60, 62, 63, 64, 65, 67, 69, 70],
};
export const BebopHarmonicMinorScale: ScaleObject = {
  id: "scale_preset_bebop_harmonic_minor",
  name: "Bebop Harmonic Minor",
  notes: [60, 62, 63, 65, 67, 68, 70, 71],
};
export const BebopMelodicMinorScale: ScaleObject = {
  id: "scale_preset_bebop_melodic_minor",
  name: "Bebop Melodic Minor",
  notes: [60, 62, 63, 65, 67, 68, 69, 71],
};
export const BebopDominantScale: ScaleObject = {
  id: "scale_preset_bebop_dominant",
  name: "Bebop Dominant",
  notes: [60, 62, 64, 65, 67, 69, 70, 71],
};
export const OctatonicWHScale: ScaleObject = {
  id: "scale_preset_octatonic_wh",
  name: "Octatonic (W-H)",
  notes: [60, 62, 63, 65, 66, 68, 69, 71],
};
export const OctatonicHWScale: ScaleObject = {
  id: "scale_preset_octatonic_hw",
  name: "Octatonic (H-W)",
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
