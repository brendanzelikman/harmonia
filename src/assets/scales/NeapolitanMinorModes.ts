import { ScaleObject } from "types/Scale/ScaleTypes";

export const NeapolitanMinorScale: ScaleObject = {
  id: "scale_preset_neapolitan_minor",
  name: "Neapolitan Minor Scale",
  notes: [60, 61, 63, 65, 67, 68, 71],
};

export const LydianSharp6Scale: ScaleObject = {
  id: "scale_preset_lydian_#6",
  name: "Lydian #6 Scale",
  notes: [60, 62, 64, 66, 67, 70, 71],
};

export const MixolydianAugmentedScale: ScaleObject = {
  id: "scale_preset_mixolydian_aug",
  name: "Mixolydian Augmented Scale",
  notes: [60, 62, 64, 65, 68, 69, 70],
};

export const AeolianSharp4Scale: ScaleObject = {
  id: "scale_preset_aeolian_#4",
  name: "Aeolian #4 Scale",
  notes: [60, 62, 63, 66, 67, 68, 70],
};

export const LocrianDominantScale: ScaleObject = {
  id: "scale_preset_locrian_dominant",
  name: "Locrian Dominant Scale",
  notes: [60, 61, 64, 65, 66, 68, 70],
};

export const IonianSharp2Scale: ScaleObject = {
  id: "scale_preset_ionian_#2",
  name: "Ionian #2 Scale",
  notes: [60, 63, 64, 65, 67, 69, 71],
};

export const UltraLocrianDoubleFlat3Scale: ScaleObject = {
  id: "scale_preset_ultra_locrian_bb3",
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
