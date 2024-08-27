import { range } from "lodash";
import { ScaleObject } from "types/Scale/ScaleTypes";

const chromaticSlice = (i: number) => range(60, 72).filter((_, j) => j !== i);

export const ChromaticScaleNo2: ScaleObject = {
  id: "scale_preset_chromatic-scale-no-2",
  name: "Chromatic Scale (No b2)",
  notes: chromaticSlice(1),
};

export const ChromaticScaleNo3: ScaleObject = {
  id: "scale_preset_chromatic-scale-no-3",
  name: "Chromatic Scale (No 2)",
  notes: chromaticSlice(2),
};

export const ChromaticScaleNo4: ScaleObject = {
  id: "scale_preset_chromatic-scale-no-4",
  name: "Chromatic Scale (No b3)",
  notes: chromaticSlice(3),
};

export const ChromaticScaleNo5: ScaleObject = {
  id: "scale_preset_chromatic-scale-no-5",
  name: "Chromatic Scale (No 3)",
  notes: chromaticSlice(4),
};

export const ChromaticScaleNo6: ScaleObject = {
  id: "scale_preset_chromatic-scale-no-6",
  name: "Chromatic Scale (No 4)",
  notes: chromaticSlice(5),
};

export const ChromaticScaleNo7: ScaleObject = {
  id: "scale_preset_chromatic-scale-no-7",
  name: "Chromatic Scale (No #4)",
  notes: chromaticSlice(6),
};

export const ChromaticScaleNo8: ScaleObject = {
  id: "scale_preset_chromatic-scale-no-8",
  name: "Chromatic Scale (No 5)",
  notes: chromaticSlice(7),
};

export const ChromaticScaleNo9: ScaleObject = {
  id: "scale_preset_chromatic-scale-no-9",
  name: "Chromatic Scale (No b6)",
  notes: chromaticSlice(8),
};

export const ChromaticScaleNo10: ScaleObject = {
  id: "scale_preset_chromatic-scale-no-10",
  name: "Chromatic Scale (No 6)",
  notes: chromaticSlice(9),
};

export const ChromaticScaleNo11: ScaleObject = {
  id: "scale_preset_chromatic-scale-no-11",
  name: "Chromatic Scale (No b7)",
  notes: chromaticSlice(10),
};

export const ChromaticScaleNo12: ScaleObject = {
  id: "scale_preset_chromatic-scale-no-12",
  name: "Chromatic Scale (No 7)",
  notes: chromaticSlice(11),
};

export default {
  ChromaticScaleNo2,
  ChromaticScaleNo3,
  ChromaticScaleNo4,
  ChromaticScaleNo5,
  ChromaticScaleNo6,
  ChromaticScaleNo7,
  ChromaticScaleNo8,
  ChromaticScaleNo9,
  ChromaticScaleNo10,
  ChromaticScaleNo11,
  ChromaticScaleNo12,
};
