import { ScaleObject } from "types/Scale/ScaleTypes";

export const DoubleHarmonicScale: ScaleObject = {
  id: "scale_preset_double_harmonic",
  name: "Double Harmonic",
  notes: [60, 61, 64, 65, 67, 68, 71],
};

export const LydianSharp2Sharp6Scale: ScaleObject = {
  id: "scale_preset_lydian_#2_#6",
  name: "Lydian #2 #6",
  notes: [60, 63, 64, 66, 67, 70, 71],
};

export const UltraLocrianSharp5Scale: ScaleObject = {
  id: "scale_preset_ultra_locrian_#5",
  name: "Ultra Locrian #5",
  notes: [60, 61, 63, 64, 67, 68, 69],
};

export const DoubleHarmonicMinorScale: ScaleObject = {
  id: "scale_preset_double_harmonic_minor",
  name: "Double Harmonic Minor",
  notes: [60, 62, 63, 66, 67, 68, 71],
};

export const MixolydianFlat5Flat2Scale: ScaleObject = {
  id: "scale_preset_mixolydian_b5_b2",
  name: "Mixolydian b5 b2",
  notes: [60, 61, 64, 65, 66, 69, 70],
};

export const IonianSharp5Sharp2Scale: ScaleObject = {
  id: "scale_preset_ionian_#5_#2",
  name: "Ionian #5 #2",
  notes: [60, 63, 64, 65, 68, 69, 71],
};

export const LocrianDoubleFlat3DoubleFlat7Scale: ScaleObject = {
  id: "scale_preset_locrian_bb3_bb7",
  name: "Locrian bb3 bb7",
  notes: [60, 61, 62, 65, 66, 68, 69],
};

export default {
  DoubleHarmonicScale,
  LydianSharp2Sharp6Scale,
  UltraLocrianSharp5Scale,
  DoubleHarmonicMinorScale,
  MixolydianFlat5Flat2Scale,
  IonianSharp5Sharp2Scale,
  LocrianDoubleFlat3DoubleFlat7Scale,
};
