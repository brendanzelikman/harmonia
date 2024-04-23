import { ScaleObject } from "types/Scale";

export const MajorHexatonicScale: ScaleObject = {
  id: "preset-major-hexatonic",
  name: "Major Hexatonic Scale",
  notes: [60, 62, 64, 65, 67, 69],
};
export const MinorHexatonicScale: ScaleObject = {
  id: "preset-minor-hexatonic",
  name: "Minor Hexatonic Scale",
  notes: [60, 62, 63, 65, 67, 70],
};
export const MajorScaleNo4th: ScaleObject = {
  id: "preset-major-scale-no-4th",
  name: "Major Scale (no 4th)",
  notes: [60, 62, 64, 67, 69, 71],
};
export const MinorScaleNo4th: ScaleObject = {
  id: "preset-minor-scale-no-4th",
  name: "Minor Scale (no 4th)",
  notes: [60, 62, 63, 67, 68, 70],
};
export const BluesScale: ScaleObject = {
  id: "preset-blues-scale",
  name: "Blues Scale",
  notes: [60, 63, 65, 66, 67, 70],
};
export const AugmentedScale: ScaleObject = {
  id: "preset-augmented-scale",
  name: "Augmented Scale",
  notes: [60, 63, 64, 67, 68, 71],
};
export const PrometheusScale: ScaleObject = {
  id: "preset-prometheus-scale",
  name: "Prometheus Scale",
  notes: [60, 62, 64, 66, 69, 70],
};
export const TritoneScale: ScaleObject = {
  id: "preset-tritone-scale",
  name: "Tritone Scale",
  notes: [60, 61, 64, 66, 67, 70],
};
export const RitsuScale: ScaleObject = {
  id: "preset-ritsu-scale",
  name: "Ritsu Scale",
  notes: [60, 61, 63, 65, 68, 70],
};

export const WholeToneScale: ScaleObject = {
  id: "preset-whole-tone-scale",
  name: "Whole Tone Scale",
  notes: [60, 62, 64, 66, 68, 70],
};

export default {
  MajorHexatonicScale,
  MinorHexatonicScale,
  MajorScaleNo4th,
  MinorScaleNo4th,
  BluesScale,
  AugmentedScale,
  PrometheusScale,
  TritoneScale,
  WholeToneScale,
};
