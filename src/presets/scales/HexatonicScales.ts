import { ScaleObject } from "types/Scale";

export const MajorHexatonicScale: ScaleObject = {
  id: "major-hexatonic",
  name: "Major Hexatonic",
  notes: [0, 2, 4, 5, 7, 9].map((degree) => ({ degree })),
};
export const MinorHexatonicScale: ScaleObject = {
  id: "minor-hexatonic",
  name: "Minor Hexatonic",
  notes: [0, 2, 3, 5, 7, 10].map((degree) => ({ degree })),
};
export const MajorScaleNo4th: ScaleObject = {
  id: "major-scale-no-4th",
  name: "Major Scale (no 4th)",
  notes: [0, 2, 4, 7, 9, 11].map((degree) => ({ degree })),
};
export const MinorScaleNo4th: ScaleObject = {
  id: "minor-scale-no-4th",
  name: "Minor Scale (no 4th)",
  notes: [0, 2, 3, 7, 8, 10].map((degree) => ({ degree })),
};
export const BluesScale: ScaleObject = {
  id: "blues-scale",
  name: "Blues Scale",
  notes: [0, 3, 5, 6, 7, 10].map((degree) => ({ degree })),
};
export const AugmentedScale: ScaleObject = {
  id: "augmented-scale",
  name: "Augmented Scale",
  notes: [0, 3, 4, 7, 8, 11].map((degree) => ({ degree })),
};
export const PrometheusScale: ScaleObject = {
  id: "prometheus-scale",
  name: "Prometheus Scale",
  notes: [0, 2, 4, 6, 9, 10].map((degree) => ({ degree })),
};
export const TritoneScale: ScaleObject = {
  id: "tritone-scale",
  name: "Tritone Scale",
  notes: [0, 1, 4, 6, 7, 10].map((degree) => ({ degree })),
};
export const RitsuScale: ScaleObject = {
  id: "ritsu-scale",
  name: "Ritsu Scale",
  notes: [0, 1, 3, 5, 8, 10].map((degree) => ({ degree })),
};

export const WholeToneScale: ScaleObject = {
  id: "whole-tone-scale",
  name: "Whole Tone Scale",
  notes: [0, 2, 4, 6, 8, 10].map((degree) => ({ degree })),
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
