import { ScaleObject } from "types/Scale/ScaleTypes";

export const MelodicMinorScale: ScaleObject = {
  id: "scale_preset_melodic-minor-scale",
  name: "Melodic Minor Scale",
  notes: [60, 62, 63, 65, 67, 69, 71],
};

export const DorianFlat2Scale: ScaleObject = {
  id: "scale_preset_dorian-flat-2-scale",
  name: "Dorian b2 Scale",
  notes: [60, 61, 63, 65, 67, 69, 70],
};

export const LydianAugmentedScale: ScaleObject = {
  id: "scale_preset_lydian-augmented-scale",
  name: "Lydian Augmented Scale",
  notes: [60, 62, 64, 66, 68, 69, 71],
};

export const AcousticScale: ScaleObject = {
  id: "scale_preset_acoustic-scale",
  name: "Acoustic Scale",
  notes: [60, 62, 64, 66, 67, 69, 70],
};

export const AeolianDominantScale: ScaleObject = {
  id: "scale_preset_aeolian-dominant-scale",
  name: "Aeolian Dominant Scale",
  notes: [60, 62, 64, 65, 67, 68, 70],
};

export const HalfDiminishedScale: ScaleObject = {
  id: "scale_preset_half-diminished-scale",
  name: "Half Diminished Scale",
  notes: [60, 62, 63, 65, 66, 68, 70],
};

export const SuperLocrianScale: ScaleObject = {
  id: "scale_preset_super-locrian-scale",
  name: "Super Locrian Scale",
  notes: [60, 61, 63, 64, 66, 68, 70],
};

export default {
  MelodicMinorScale,
  DorianFlat2Scale,
  LydianAugmentedScale,
  AcousticScale,
  AeolianDominantScale,
  HalfDiminishedScale,
  SuperLocrianScale,
};
