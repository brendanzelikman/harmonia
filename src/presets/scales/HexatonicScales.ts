import { ScaleObject } from "types/Scale";

export const MajorHexatonicScale: ScaleObject = {
  id: "major-hexatonic",
  name: "Major Hexatonic Scale",
  notes: [60, 62, 64, 65, 67, 69],
};
export const MinorHexatonicScale: ScaleObject = {
  id: "minor-hexatonic",
  name: "Minor Hexatonic Scale",
  notes: [60, 62, 63, 65, 67, 70],
};
export const MajorScaleNo4th: ScaleObject = {
  id: "major-scale-no-4th",
  name: "Major Scale (no 4th)",
  notes: [60, 62, 64, 67, 69, 71],
};
export const MinorScaleNo4th: ScaleObject = {
  id: "minor-scale-no-4th",
  name: "Minor Scale (no 4th)",
  notes: [60, 62, 63, 67, 68, 70],
};
export const BluesScale: ScaleObject = {
  id: "blues-scale",
  name: "Blues Scale",
  notes: [60, 63, 65, 66, 67, 70],
};
export const AugmentedScale: ScaleObject = {
  id: "augmented-scale",
  name: "Augmented Scale",
  notes: [60, 63, 64, 67, 68, 71],
};
export const PrometheusScale: ScaleObject = {
  id: "prometheus-scale",
  name: "Prometheus Scale",
  notes: [60, 62, 64, 66, 69, 70],
};
export const TritoneScale: ScaleObject = {
  id: "tritone-scale",
  name: "Tritone Scale",
  notes: [60, 61, 64, 66, 67, 70],
};
export const RitsuScale: ScaleObject = {
  id: "ritsu-scale",
  name: "Ritsu Scale",
  notes: [60, 61, 63, 65, 68, 70],
};

export const WholeToneScale: ScaleObject = {
  id: "whole-tone-scale",
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
