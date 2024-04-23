import { ScaleObject } from "types/Scale";

export const HarmonicMajorScale: ScaleObject = {
  id: "preset-harmonic-major-scale",
  name: "Harmonic Major Scale",
  notes: [60, 62, 64, 65, 67, 68, 71],
};

export const DorianFlat5Scale: ScaleObject = {
  id: "preset-dorian-flat-5-scale",
  name: "Dorian b5 Scale",
  notes: [60, 62, 63, 65, 66, 69, 70],
};

export const PhrygianFlat4Scale: ScaleObject = {
  id: "preset-phrygian-flat-4-scale",
  name: "Phrygian b4 Scale",
  notes: [60, 61, 63, 64, 67, 68, 70],
};

export const LydianFlat3Scale: ScaleObject = {
  id: "preset-lydian-flat-3-scale",
  name: "Lydian b3 Scale",
  notes: [60, 62, 63, 66, 67, 69, 71],
};

export const MixolydianFlat2Scale: ScaleObject = {
  id: "preset-mixolydian-flat-2-scale",
  name: "Mixolydian b2 Scale",
  notes: [60, 61, 64, 65, 67, 69, 70],
};

export const LydianAugmentedSharp2Scale: ScaleObject = {
  id: "preset-lydian-augmented-sharp-2-scale",
  name: "Lydian Augmented #2 Scale",
  notes: [60, 63, 64, 66, 68, 69, 71],
};

export const LocrianDoubleFlat7Scale: ScaleObject = {
  id: "preset-locrian-double-flat-7-scale",
  name: "Locrian bb7 Scale",
  notes: [60, 61, 63, 65, 66, 68, 69],
};

export default {
  HarmonicMajorScale,
  DorianFlat5Scale,
  PhrygianFlat4Scale,
  LydianFlat3Scale,
  MixolydianFlat2Scale,
  LydianAugmentedSharp2Scale,
  LocrianDoubleFlat7Scale,
};
