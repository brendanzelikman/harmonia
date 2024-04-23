import { ScaleObject } from "types/Scale";

export const HarmonicMinorScale: ScaleObject = {
  id: "preset-harmonic-minor-scale",
  name: "Harmonic Minor Scale",
  notes: [60, 62, 63, 65, 67, 68, 71],
};

export const LocrianSharp6Scale: ScaleObject = {
  id: "preset-locrian-sharp-6-scale",
  name: "Locrian #6 Scale",
  notes: [60, 61, 63, 65, 66, 69, 70],
};

export const IonianSharp5Scale: ScaleObject = {
  id: "preset-ionian-sharp-5-scale",
  name: "Ionian #5 Scale",
  notes: [60, 62, 64, 65, 68, 69, 71],
};

export const DorianSharp4Scale: ScaleObject = {
  id: "preset-dorian-sharp-4-scale",
  name: "Dorian #4 Scale",
  notes: [60, 62, 63, 66, 67, 69, 70],
};

export const PhrygianDominantScale: ScaleObject = {
  id: "preset-phrygian-dominant-scale",
  name: "Phrygian Dominant Scale",
  notes: [60, 61, 64, 65, 67, 68, 70],
};

export const LydianSharp2Scale: ScaleObject = {
  id: "preset-lydian-sharp-2-scale",
  name: "Lydian #2 Scale",
  notes: [60, 63, 64, 66, 67, 69, 71],
};

export const UltraLocrianScale: ScaleObject = {
  id: "preset-ultra-locrian-scale",
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
