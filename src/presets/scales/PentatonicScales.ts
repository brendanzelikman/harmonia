import { ScaleObject } from "types/Scale";

export const MajorPentatonicScale: ScaleObject = {
  id: "major-pentatonic-scale",
  name: "Major Pentatonic Scale",
  notes: [0, 2, 4, 7, 9].map((degree) => ({ degree })),
};
export const MinorPentatonicScale: ScaleObject = {
  id: "minor-pentatonic-scale",
  name: "Minor Pentatonic Scale",
  notes: [0, 3, 5, 7, 10].map((degree) => ({ degree })),
};
export const InScale: ScaleObject = {
  id: "in-scale",
  name: "In Scale",
  notes: [0, 1, 5, 7, 8].map((degree) => ({ degree })),
};
export const YoScale: ScaleObject = {
  id: "yo-scale",
  name: "Yo Scale",
  notes: [0, 2, 5, 7, 9].map((degree) => ({ degree })),
};
export const InsenScale: ScaleObject = {
  id: "insen-scale",
  name: "Insen Scale",
  notes: [0, 1, 5, 7, 10].map((degree) => ({ degree })),
};
export const HirajoshiScale: ScaleObject = {
  id: "hirajoshi-scale",
  name: "Hirajoshi Scale",
  notes: [0, 2, 3, 7, 8].map((degree) => ({ degree })),
};
export const IwatoScale: ScaleObject = {
  id: "iwato-scale",
  name: "Iwato Scale",
  notes: [0, 1, 5, 6, 10].map((degree) => ({ degree })),
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
