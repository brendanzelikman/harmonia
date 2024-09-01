import { ScaleObject } from "types/Scale/ScaleTypes";

export const LydianScale: ScaleObject = {
  id: "scale_preset_lydian_scale",
  name: "Lydian Scale",
  notes: [60, 62, 64, 66, 67, 69, 71],
};
export const IonianScale: ScaleObject = {
  id: "scale_preset_ionian-scale",
  name: "Ionian Scale",
  notes: [60, 62, 64, 65, 67, 69, 71],
};
export const MixolydianScale: ScaleObject = {
  id: "scale_preset_mixolydian_scale",
  name: "Mixolydian Scale",
  notes: [60, 62, 64, 65, 67, 69, 70],
};
export const DorianScale: ScaleObject = {
  id: "scale_preset_dorian_scale",
  name: "Dorian Scale",
  notes: [60, 62, 63, 65, 67, 69, 70],
};
export const AeolianScale: ScaleObject = {
  id: "scale_preset_aeolian-scale",
  name: "Aeolian Scale",
  notes: [60, 62, 63, 65, 67, 68, 70],
};
export const PhrygianScale: ScaleObject = {
  id: "scale_preset_phrygian_scale",
  name: "Phrygian Scale",
  notes: [60, 61, 63, 65, 67, 68, 70],
};
export const LocrianScale: ScaleObject = {
  id: "scale_preset_locrian_scale",
  name: "Locrian Scale",
  notes: [60, 61, 63, 65, 66, 68, 70],
};

export default {
  LydianScale,
  IonianScale,
  MixolydianScale,
  DorianScale,
  AeolianScale,
  PhrygianScale,
  LocrianScale,
};
