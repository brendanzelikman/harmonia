import { Scale } from "types";

export const LydianScale: Scale = {
  id: "lydian-scale",
  name: "Lydian Scale",
  notes: [60, 62, 64, 66, 67, 69, 71],
};
export const IonianScale: Scale = {
  id: "ionian-scale",
  name: "Ionian Scale",
  notes: [60, 62, 64, 65, 67, 69, 71],
};
export const MixolydianScale: Scale = {
  id: "mixolydian-scale",
  name: "Mixolydian Scale",
  notes: [60, 62, 64, 65, 67, 69, 70],
};
export const DorianScale: Scale = {
  id: "dorian-scale",
  name: "Dorian Scale",
  notes: [60, 62, 63, 65, 67, 69, 70],
};
export const AeolianScale: Scale = {
  id: "aeolian-scale",
  name: "Aeolian Scale",
  notes: [60, 62, 63, 65, 67, 68, 70],
};
export const PhrygianScale: Scale = {
  id: "phrygian-scale",
  name: "Phrygian Scale",
  notes: [60, 61, 63, 65, 67, 68, 70],
};
export const LocrianScale: Scale = {
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
