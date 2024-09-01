import { ScaleObject } from "types/Scale/ScaleTypes";

export const HarmonicMinorScale: ScaleObject = {
  id: "scale_preset_harmonic_minor",
  name: "Harmonic Minor Scale",
  notes: [60, 62, 63, 65, 67, 68, 71],
};

export const LocrianSharp6Scale: ScaleObject = {
  id: "scale_preset_locrian_#6",
  name: "Locrian #6 Scale",
  notes: [60, 61, 63, 65, 66, 69, 70],
};

export const IonianSharp5Scale: ScaleObject = {
  id: "scale_preset_ionian_#5",
  name: "Ionian #5 Scale",
  notes: [60, 62, 64, 65, 68, 69, 71],
};

export const DorianSharp4Scale: ScaleObject = {
  id: "scale_preset_dorian_#4",
  name: "Dorian #4 Scale",
  notes: [60, 62, 63, 66, 67, 69, 70],
};

export const PhrygianDominantScale: ScaleObject = {
  id: "scale_preset_phrygian_dominant",
  name: "Phrygian Dominant Scale",
  notes: [60, 61, 64, 65, 67, 68, 70],
};

export const LydianSharp2Scale: ScaleObject = {
  id: "scale_preset_lydian_#2",
  name: "Lydian #2 Scale",
  notes: [60, 63, 64, 66, 67, 69, 71],
};

export const UltraLocrianScale: ScaleObject = {
  id: "scale_preset_ultra_locrian",
  name: "Ultra Locrian Scale",
  notes: [60, 61, 63, 64, 66, 68, 69],
};

export default {
  HarmonicMinorScale,
  LocrianSharp6Scale,
  IonianSharp5Scale,
  DorianSharp4Scale,
  PhrygianDominantScale,
  LydianSharp2Scale,
  UltraLocrianScale,
};
