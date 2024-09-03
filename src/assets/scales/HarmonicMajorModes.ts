import { ScaleObject } from "types/Scale/ScaleTypes";

export const HarmonicMajorScale: ScaleObject = {
  id: "scale_preset_harmonic_major",
  name: "Harmonic Major Scale",
  notes: [60, 62, 64, 65, 67, 68, 71],
};

export const DorianFlat5Scale: ScaleObject = {
  id: "scale_preset_dorian_b5",
  name: "Dorian b5 Scale",
  notes: [60, 62, 63, 65, 66, 69, 70],
};

export const PhrygianFlat4Scale: ScaleObject = {
  id: "scale_preset_phrygian_b4",
  name: "Phrygian b4 Scale",
  notes: [60, 61, 63, 64, 67, 68, 70],
};

export const LydianFlat3Scale: ScaleObject = {
  id: "scale_preset_lydian_b3",
  name: "Lydian b3 Scale",
  notes: [60, 62, 63, 66, 67, 69, 71],
};

export const MixolydianFlat2Scale: ScaleObject = {
  id: "scale_preset_mixolydian_b2",
  name: "Mixolydian b2 Scale",
  notes: [60, 61, 64, 65, 67, 69, 70],
};

export const LydianAugmentedSharp2Scale: ScaleObject = {
  id: "scale_preset_lydian_augmented_#2",
  name: "Lydian Augmented #2 Scale",
  notes: [60, 63, 64, 66, 68, 69, 71],
};

export const LocrianDoubleFlat7Scale: ScaleObject = {
  id: "scale_preset_locrian_bb7",
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
