import { PresetScale } from "types";

export const LydianScale: PresetScale = {
  id: "lydian-scale",
  name: "Lydian Scale",
  notes: [60, 62, 64, 66, 67, 69, 71],
};
export const IonianScale: PresetScale = {
  id: "ionian-scale",
  name: "Ionian Scale",
  notes: [60, 62, 64, 65, 67, 69, 71],
};
export const MixolydianScale: PresetScale = {
  id: "mixolydian-scale",
  name: "Mixolydian Scale",
  notes: [60, 62, 64, 65, 67, 69, 70],
};
export const DorianScale: PresetScale = {
  id: "dorian-scale",
  name: "Dorian Scale",
  notes: [60, 62, 63, 65, 67, 69, 70],
};
export const AeolianScale: PresetScale = {
  id: "aeolian-scale",
  name: "Aeolian Scale",
  notes: [60, 62, 63, 65, 67, 68, 70],
};
export const PhrygianScale: PresetScale = {
  id: "phrygian-scale",
  name: "Phrygian Scale",
  notes: [60, 61, 63, 65, 67, 68, 70],
};
export const LocrianScale: PresetScale = {
  id: "locrian-scale",
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
