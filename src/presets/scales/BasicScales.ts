import { ScaleObject } from "types/Scale/ScaleTypes";
import { BluesScale, WholeToneScale } from "./HexatonicScales";
import { MajorPentatonicScale, MinorPentatonicScale } from "./PentatonicScales";
import { OctatonicHWScale, OctatonicWHScale } from "./OctatonicScales";

export const ChromaticScale: ScaleObject = {
  id: "scale_preset_chromatic",
  name: "Chromatic Scale",
  notes: [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71],
};
export const MajorScale: ScaleObject = {
  id: "scale_preset_major",
  name: "Major Scale",
  notes: [60, 62, 64, 65, 67, 69, 71],
};
export const MinorScale: ScaleObject = {
  id: "scale_preset_minor",
  name: "Minor Scale",
  notes: [60, 62, 63, 65, 67, 68, 70],
};

export default {
  ChromaticScale,
  MajorScale,
  MinorScale,
  MajorPentatonicScale,
  MinorPentatonicScale,
  BluesScale,
  OctatonicHWScale,
  OctatonicWHScale,
  WholeToneScale,
};
