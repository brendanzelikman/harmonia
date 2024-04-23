import { ScaleObject } from "types/Scale";

export const NeapolitanMajorScale: ScaleObject = {
  id: "preset-neapolitan-major-scale",
  name: "Neapolitan Major Scale",
  notes: [60, 61, 63, 65, 67, 69, 71],
};

export const LeadingWholeToneScale: ScaleObject = {
  id: "preset-leading-whole-tone-scale",
  name: "Leading Whole Tone Scale",
  notes: [60, 62, 64, 66, 68, 70, 71],
};

export const LydianAugmentedDominantScale: ScaleObject = {
  id: "preset-lydian-augmented-dominant-scale",
  name: "Lydian Augmented Dominant Scale",
  notes: [60, 62, 64, 66, 68, 69, 70],
};

export const LydianMinorScale: ScaleObject = {
  id: "preset-lydian-minor-scale",
  name: "Lydian Minor Scale",
  notes: [60, 62, 64, 66, 67, 68, 70],
};

export const MajorLocrianScale: ScaleObject = {
  id: "preset-major-locrian-scale",
  name: "Major Locrian Scale",
  notes: [60, 62, 64, 65, 66, 68, 70],
};

export const SuperLocrianSharp2Scale: ScaleObject = {
  id: "preset-super-locrian-sharp-2-scale",
  name: "Super Locrian #2 Scale",
  notes: [60, 62, 63, 64, 66, 68, 70],
};

export const SuperLocrianDoubleFlat3Scale: ScaleObject = {
  id: "preset-super-locrian-double-flat-3-scale",
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
