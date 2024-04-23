import { ScaleObject } from "types/Scale";

export const ChromaticScale: ScaleObject = {
  id: "preset-preset-chromatic-scale",
  name: "Chromatic Scale",
  notes: [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71],
};
export const NoScale: ScaleObject = {
  id: "preset-preset-no-scale",
  name: "No Scale",
  notes: [],
};
export const MajorScale: ScaleObject = {
  id: "preset-preset-major-scale",
  name: "Major Scale",
  notes: [60, 62, 64, 65, 67, 69, 71],
};
export const MinorScale: ScaleObject = {
  id: "preset-preset-minor-scale",
  name: "Minor Scale",
  notes: [60, 62, 63, 65, 67, 68, 70],
};

export const MajorPentatonicScale: ScaleObject = {
  id: "preset-preset-major-pentatonic-scale",
  name: "Major Pentatonic Scale",
  notes: [60, 62, 64, 67, 69],
};
export const MinorPentatonicScale: ScaleObject = {
  id: "preset-preset-minor-pentatonic-scale",
  name: "Minor Pentatonic Scale",
  notes: [60, 63, 65, 67, 70],
};
export const BluesScale: ScaleObject = {
  id: "preset-preset-blues-scale",
  name: "Blues Scale",
  notes: [60, 63, 65, 66, 67, 70],
};

export default {
  ChromaticScale,
  NoScale,
  MajorScale,
  MinorScale,
  MajorPentatonicScale,
  MinorPentatonicScale,
  BluesScale,
};
