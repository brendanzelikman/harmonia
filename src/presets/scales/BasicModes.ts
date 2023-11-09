import { ScaleObject } from "types/Scale";

export const LydianScale: ScaleObject = {
  id: "lydian-scale",
  name: "Lydian Scale",
  notes: [0, 2, 4, 6, 7, 9, 11].map((degree) => ({ degree })),
};

export const IonianScale: ScaleObject = {
  id: "ionian-scale",
  name: "Ionian Scale",
  notes: [0, 2, 4, 5, 7, 9, 11].map((degree) => ({ degree })),
};

export const MixolydianScale: ScaleObject = {
  id: "mixolydian-scale",
  name: "Mixolydian Scale",
  notes: [0, 2, 4, 5, 7, 9, 10].map((degree) => ({ degree })),
};
export const DorianScale: ScaleObject = {
  id: "dorian-scale",
  name: "Dorian Scale",
  notes: [0, 2, 3, 5, 7, 9, 10].map((degree) => ({ degree })),
};
export const AeolianScale: ScaleObject = {
  id: "aeolian-scale",
  name: "Aeolian Scale",
  notes: [0, 2, 3, 5, 7, 8, 10].map((degree) => ({ degree })),
};
export const PhrygianScale: ScaleObject = {
  id: "phrygian-scale",
  name: "Phrygian Scale",
  notes: [0, 1, 3, 5, 7, 8, 10].map((degree) => ({ degree })),
};
export const LocrianScale: ScaleObject = {
  id: "locrian-scale",
  name: "Locrian Scale",
  notes: [0, 1, 3, 5, 6, 8, 10].map((degree) => ({ degree })),
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
