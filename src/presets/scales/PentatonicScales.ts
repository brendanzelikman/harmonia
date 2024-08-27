import { ScaleObject } from "types/Scale/ScaleTypes";

export const MajorPentatonicScale: ScaleObject = {
  id: "scale_preset_major-pentatonic-scale",
  name: "Major Pentatonic Scale",
  notes: [60, 62, 64, 67, 69],
};
export const MinorPentatonicScale: ScaleObject = {
  id: "scale_preset_minor-pentatonic-scale",
  name: "Minor Pentatonic Scale",
  notes: [60, 63, 65, 67, 70],
};
export const InScale: ScaleObject = {
  id: "scale_preset_in-scale",
  name: "In Scale",
  notes: [60, 61, 65, 67, 68],
};
export const YoScale: ScaleObject = {
  id: "scale_preset_yo-scale",
  name: "Yo Scale",
  notes: [60, 62, 65, 67, 69],
};
export const InsenScale: ScaleObject = {
  id: "scale_preset_insen-scale",
  name: "Insen Scale",
  notes: [60, 61, 65, 67, 70],
};
export const HirajoshiScale: ScaleObject = {
  id: "scale_preset_hirajoshi-scale",
  name: "Hirajoshi Scale",
  notes: [60, 62, 63, 67, 68],
};
export const IwatoScale: ScaleObject = {
  id: "scale_preset_iwato-scale",
  name: "Iwato Scale",
  notes: [60, 61, 65, 66, 70],
};

export default {
  MajorPentatonicScale,
  MinorPentatonicScale,
  InScale,
  YoScale,
  InsenScale,
  HirajoshiScale,
  IwatoScale,
};
