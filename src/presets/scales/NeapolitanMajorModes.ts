import { ScaleObject } from "types/Scale/ScaleTypes";

export const NeapolitanMajorScale: ScaleObject = {
  id: "scale_preset_neapolitan_major",
  name: "Neapolitan Major Scale",
  notes: [60, 61, 63, 65, 67, 69, 71],
};

export const LeadingWholeToneScale: ScaleObject = {
  id: "scale_preset_leading_whole_tone",
  name: "Leading Whole Tone Scale",
  notes: [60, 62, 64, 66, 68, 70, 71],
};

export const LydianAugmentedDominantScale: ScaleObject = {
  id: "scale_preset_lydian_aug_dom",
  name: "Lydian Augmented Dominant Scale",
  notes: [60, 62, 64, 66, 68, 69, 70],
};

export const LydianMinorScale: ScaleObject = {
  id: "scale_preset_lydian_minor",
  name: "Lydian Minor Scale",
  notes: [60, 62, 64, 66, 67, 68, 70],
};

export const MajorLocrianScale: ScaleObject = {
  id: "scale_preset_major_locrian",
  name: "Major Locrian Scale",
  notes: [60, 62, 64, 65, 66, 68, 70],
};

export const SuperLocrianSharp2Scale: ScaleObject = {
  id: "scale_preset_super_locrian_#2",
  name: "Super Locrian #2 Scale",
  notes: [60, 62, 63, 64, 66, 68, 70],
};

export const SuperLocrianDoubleFlat3Scale: ScaleObject = {
  id: "scale_preset_super_locrian_bb3",
  name: "Super Locrian bb3 Scale",
  notes: [60, 61, 62, 64, 66, 68, 70],
};

export default {
  NeapolitanMajorScale,
  LeadingWholeToneScale,
  LydianAugmentedDominantScale,
  LydianMinorScale,
  MajorLocrianScale,
  SuperLocrianSharp2Scale,
  SuperLocrianDoubleFlat3Scale,
};
