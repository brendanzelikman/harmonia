import { ScaleObject } from "types/Scale";

export const LydianScale: ScaleObject = {
  id: "lydian-scale",
  name: "Lydian Scale",
  notes: [60, 62, 64, 66, 67, 69, 71],
};

export const IonianScale: ScaleObject = {
  id: "ionian-scale",
  name: "Ionian Scale",
  notes: [60, 62, 64, 65, 67, 69, 71],
};

export const MixolydianScale: ScaleObject = {
  id: "mixolydian-scale",
  name: "Mixolydian Scale",
  notes: [60, 62, 64, 65, 67, 69, 70],
};
export const DorianScale: ScaleObject = {
  id: "dorian-scale",
  name: "Dorian Scale",
  notes: [60, 62, 63, 65, 67, 69, 70],
};
export const AeolianScale: ScaleObject = {
  id: "aeolian-scale",
  name: "Aeolian Scale",
  notes: [60, 62, 63, 65, 67, 68, 70],
};
export const PhrygianScale: ScaleObject = {
  id: "phrygian-scale",
  name: "Phrygian Scale",
  notes: [60, 61, 63, 65, 67, 68, 70],
};
export const LocrianScale: ScaleObject = {
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
