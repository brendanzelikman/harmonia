import { ScaleObject } from "types/Scale/ScaleTypes";

export const MelodicMinorScale: ScaleObject = {
  id: "scale_preset_melodic_minor",
  name: "Melodic Minor Scale",
  notes: [60, 62, 63, 65, 67, 69, 71],
};

export const DorianFlat2Scale: ScaleObject = {
  id: "scale_preset_dorian_b2",
  name: "Dorian b2 Scale",
  notes: [60, 61, 63, 65, 67, 69, 70],
};

export const LydianAugmentedScale: ScaleObject = {
  id: "scale_preset_lydian_augmented",
  name: "Lydian Augmented Scale",
  notes: [60, 62, 64, 66, 68, 69, 71],
};

export const AcousticScale: ScaleObject = {
  id: "scale_preset_acoustic",
  name: "Acoustic Scale",
  notes: [60, 62, 64, 66, 67, 69, 70],
};

export const AeolianDominantScale: ScaleObject = {
  id: "scale_preset_aeolian_dominant",
  name: "Aeolian Dominant Scale",
  notes: [60, 62, 64, 65, 67, 68, 70],
};

export const HalfDiminishedScale: ScaleObject = {
  id: "scale_preset_half_diminished",
  name: "Half Diminished Scale",
  notes: [60, 62, 63, 65, 66, 68, 70],
};

export const SuperLocrianScale: ScaleObject = {
  id: "scale_preset_super_locrian",
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
