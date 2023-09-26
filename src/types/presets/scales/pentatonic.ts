import { PresetScale } from "types";

export const MajorPentatonicScale: PresetScale = {
  id: "major-pentatonic-scale",
  name: "Major Pentatonic Scale",
  notes: [60, 62, 64, 67, 69],
};
export const MinorPentatonicScale: PresetScale = {
  id: "minor-pentatonic-scale",
  name: "Minor Pentatonic Scale",
  notes: [60, 63, 65, 67, 70],
};
export const InScale: PresetScale = {
  id: "in-scale",
  name: "In Scale",
  notes: [60, 61, 65, 67, 68],
};
export const YoScale: PresetScale = {
  id: "yo-scale",
  name: "Yo Scale",
  notes: [60, 62, 65, 67, 69],
};
export const InsenScale: PresetScale = {
  id: "insen-scale",
  name: "Insen Scale",
  notes: [60, 61, 65, 67, 70],
};
export const HirajoshiScale: PresetScale = {
  id: "hirajoshi-scale",
  name: "Hirajoshi Scale",
  notes: [60, 62, 63, 67, 68],
};
export const IwatoScale: PresetScale = {
  id: "iwato-scale",
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
