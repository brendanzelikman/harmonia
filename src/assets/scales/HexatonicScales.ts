import { ScaleObject } from "types/Scale/ScaleTypes";

export const MajorHexatonicScale: ScaleObject = {
  id: "scale_preset_major_hexatonic",
  name: "Major Scale (no 7th)",
  notes: [60, 62, 64, 65, 67, 69],
};
export const MinorHexatonicScale: ScaleObject = {
  id: "scale_preset_minor_hexatonic",
  name: "Minor Scale (no 7th)",
  notes: [60, 62, 63, 65, 67, 68],
};
export const MajorScaleNo2nd: ScaleObject = {
  id: "scale_preset_major_no2",
  name: "Major Scale (no 2nd)",
  notes: [60, 64, 65, 67, 69, 71],
};
export const MinorScaleNo2nd: ScaleObject = {
  id: "scale_preset_minor_no2",
  name: "Minor Scale (no 2nd)",
  notes: [60, 63, 65, 67, 68, 70],
};
export const MajorScaleNo3rd: ScaleObject = {
  id: "scale_preset_major_no3",
  name: "Major Scale (no 3rd)",
  notes: [60, 62, 65, 67, 69, 71],
};
export const MinorScaleNo3rd: ScaleObject = {
  id: "scale_preset_minor_no3",
  name: "Minor Scale (no 3rd)",
  notes: [60, 62, 63, 67, 69, 70],
};
export const MajorScaleNo4th: ScaleObject = {
  id: "scale_preset_major_no4",
  name: "Major Scale (no 4th)",
  notes: [60, 62, 64, 67, 69, 71],
};
export const MinorScaleNo4th: ScaleObject = {
  id: "scale_preset_minor_no4",
  name: "Minor Scale (no 4th)",
  notes: [60, 62, 63, 67, 68, 70],
};
export const MajorScaleNo5th: ScaleObject = {
  id: "scale_preset_major_no5",
  name: "Major Scale (no 5th)",
  notes: [60, 62, 64, 65, 69, 71],
};
export const MinorScaleNo5th: ScaleObject = {
  id: "scale_preset_minor_no5",
  name: "Minor Scale (no 5th)",
  notes: [60, 62, 63, 65, 68, 70],
};
export const MajorScaleNo6th: ScaleObject = {
  id: "scale_preset_major_no6",
  name: "Major Scale (no 6th)",
  notes: [60, 62, 64, 65, 67, 71],
};
export const MinorScaleNo6th: ScaleObject = {
  id: "scale_preset_minor_no6",
  name: "Minor Scale (no 6th)",
  notes: [60, 62, 63, 65, 67, 70],
};
export const BluesScale: ScaleObject = {
  id: "scale_preset_blues",
  name: "Blues Scale",
  notes: [60, 63, 65, 66, 67, 70],
};
export const AugmentedScale: ScaleObject = {
  id: "scale_preset_augmented",
  name: "Augmented Scale",
  notes: [60, 63, 64, 67, 68, 71],
};
export const PrometheusScale: ScaleObject = {
  id: "scale_preset_prometheus",
  name: "Prometheus Scale",
  notes: [60, 62, 64, 66, 69, 70],
};
export const TritoneScale: ScaleObject = {
  id: "scale_preset_tritone",
  name: "Tritone Scale",
  notes: [60, 61, 64, 66, 67, 70],
};
export const RitsuScale: ScaleObject = {
  id: "scale_preset_ritsu-scale",
  name: "Ritsu Scale",
  notes: [60, 61, 63, 65, 68, 70],
};

export const WholeToneScale: ScaleObject = {
  id: "scale_preset_whole_tone",
  name: "Whole Tone Scale",
  notes: [60, 62, 64, 66, 68, 70],
};

export default {
  MajorScaleNo2nd,
  MinorScaleNo2nd,
  MajorScaleNo3rd,
  MinorScaleNo3rd,
  MajorScaleNo4th,
  MinorScaleNo4th,
  MajorScaleNo5th,
  MinorScaleNo5th,
  MajorScaleNo6th,
  MinorScaleNo6th,
  MajorHexatonicScale,
  MinorHexatonicScale,
  BluesScale,
  AugmentedScale,
  PrometheusScale,
  TritoneScale,
  WholeToneScale,
};
