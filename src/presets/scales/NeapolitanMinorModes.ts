import { ScaleObject } from "types/Scale";

export const NeapolitanMinorScale: ScaleObject = {
  id: "preset-neapolitan-minor-scale",
  name: "Neapolitan Minor Scale",
  notes: [60, 61, 63, 65, 67, 68, 71],
};

export const LydianSharp6Scale: ScaleObject = {
  id: "preset-lydian-sharp-6-scale",
  name: "Lydian #6 Scale",
  notes: [60, 62, 64, 66, 67, 70, 71],
};

export const MixolydianAugmentedScale: ScaleObject = {
  id: "preset-mixolydian-augmented-scale",
  name: "Mixolydian Augmented Scale",
  notes: [60, 62, 64, 65, 68, 69, 70],
};

export const AeolianSharp4Scale: ScaleObject = {
  id: "preset-aeolian-sharp-4-scale",
  name: "Aeolian #4 Scale",
  notes: [60, 62, 63, 66, 67, 68, 70],
};

export const LocrianDominantScale: ScaleObject = {
  id: "preset-locrian-dominant-scale",
  name: "Locrian Dominant Scale",
  notes: [60, 61, 64, 65, 66, 68, 70],
};

export const IonianSharp2Scale: ScaleObject = {
  id: "preset-ionian-sharp-2-scale",
  name: "Ionian #2 Scale",
  notes: [60, 63, 64, 65, 67, 69, 71],
};

export const UltraLocrianDoubleFlat3Scale: ScaleObject = {
  id: "preset-ultra-locrian-double-flat-3-scale",
  name: "Ultra Locrian bb3 Scale",
  notes: [60, 61, 62, 64, 66, 68, 69],
};

export default {
  NeapolitanMinorScale,
  LydianSharp6Scale,
  MixolydianAugmentedScale,
  AeolianSharp4Scale,
  LocrianDominantScale,
  IonianSharp2Scale,
  UltraLocrianDoubleFlat3Scale,
};
