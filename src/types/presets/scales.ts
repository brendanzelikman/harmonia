import { Scale } from "types/scales";

// Common Scales
export const ChromaticScale: Scale = {
  id: "chromatic-scale",
  name: "Chromatic Scale",
  notes: [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71],
};
export const MajorScale: Scale = {
  id: "major-scale",
  name: "Major Scale",
  notes: [60, 62, 64, 65, 67, 69, 71],
};
export const MinorScale: Scale = {
  id: "minor-scale",
  name: "Minor Scale",
  notes: [60, 62, 63, 65, 67, 68, 70],
};
export const HarmonicMinorScale: Scale = {
  id: "harmonic-minor-scale",
  name: "Harmonic Minor Scale",
  notes: [60, 62, 63, 65, 67, 68, 71],
};
export const MelodicMinorScale: Scale = {
  id: "melodic-minor-scale",
  name: "Melodic Minor Scale",
  notes: [60, 62, 63, 65, 67, 69, 71],
};

// Common Modes
export const LydianScale: Scale = {
  id: "lydian-scale",
  name: "Lydian Scale",
  notes: [60, 62, 64, 66, 67, 69, 71],
};
export const IonianScale: Scale = {
  id: "ionian-scale",
  name: "Ionian Scale",
  notes: [60, 62, 64, 65, 67, 69, 71],
};
export const MixolydianScale: Scale = {
  id: "mixolydian-scale",
  name: "Mixolydian Scale",
  notes: [60, 62, 64, 65, 67, 69, 70],
};
export const DorianScale: Scale = {
  id: "dorian-scale",
  name: "Dorian Scale",
  notes: [60, 62, 63, 65, 67, 69, 70],
};
export const AeolianScale: Scale = {
  id: "aeolian-scale",
  name: "Aeolian Scale",
  notes: [60, 62, 63, 65, 67, 68, 70],
};
export const PhrygianScale: Scale = {
  id: "phrygian-scale",
  name: "Phrygian Scale",
  notes: [60, 61, 63, 65, 67, 68, 70],
};
export const LocrianScale: Scale = {
  id: "locrian-scale",
  name: "Locrian Scale",
  notes: [60, 61, 63, 65, 66, 68, 70],
};
export const AlteredScale: Scale = {
  id: "altered-scale",
  name: "Altered Scale",
  notes: [60, 61, 63, 64, 66, 68, 70],
};

// Pentatonic Scales
export const MajorPentatonicScale: Scale = {
  id: "major-pentatonic-scale",
  name: "Major Pentatonic Scale",
  notes: [60, 62, 64, 67, 69],
};
export const MinorPentatonicScale: Scale = {
  id: "minor-pentatonic-scale",
  name: "Minor Pentatonic Scale",
  notes: [60, 63, 65, 67, 70],
};
export const InScale: Scale = {
  id: "in-scale",
  name: "In Scale",
  notes: [60, 61, 65, 67, 68],
};
export const YoScale: Scale = {
  id: "yo-scale",
  name: "Yo Scale",
  notes: [60, 62, 65, 67, 69],
};
export const InsenScale: Scale = {
  id: "insen-scale",
  name: "Insen Scale",
  notes: [60, 61, 65, 67, 70],
};
export const HirajoshiScale: Scale = {
  id: "hirajoshi-scale",
  name: "Hirajoshi Scale",
  notes: [60, 62, 63, 67, 68],
};
export const IwatoScale: Scale = {
  id: "iwato-scale",
  name: "Iwato Scale",
  notes: [60, 61, 65, 66, 70],
};

// Hexatonic Scales
export const BluesScale: Scale = {
  id: "blues-scale",
  name: "Blues Scale",
  notes: [60, 63, 65, 66, 67, 70],
};
export const AugmentedScale: Scale = {
  id: "augmented-scale",
  name: "Augmented Scale",
  notes: [60, 63, 64, 67, 68, 71],
};
export const PrometheusScale: Scale = {
  id: "prometheus-scale",
  name: "Prometheus Scale",
  notes: [60, 62, 64, 66, 69, 70],
};
export const TritoneScale: Scale = {
  id: "tritone-scale",
  name: "Tritone Scale",
  notes: [60, 61, 64, 66, 67, 70],
};
export const WholeToneScale: Scale = {
  id: "whole-tone-scale",
  name: "Whole Tone Scale",
  notes: [60, 62, 64, 66, 68, 70],
};

// Octatonic Scales
export const BebopMajorScale: Scale = {
  id: "bebop-major-scale",
  name: "Bebop Major Scale",
  notes: [60, 62, 64, 65, 67, 68, 69, 71],
};
export const BebopDorianScale: Scale = {
  id: "bebop-dorian-scale",
  name: "Bebop Dorian Scale",
  notes: [60, 62, 63, 64, 65, 67, 69, 70],
};
export const BebopHarmonicMinorScale: Scale = {
  id: "bebop-harmonic-minor-scale",
  name: "Bebop Harmonic Minor Scale",
  notes: [60, 62, 63, 65, 67, 68, 70, 71],
};
export const BebopMelodicMinorScale: Scale = {
  id: "bebop-melodic-minor-scale",
  name: "Bebop Melodic Minor Scale",
  notes: [60, 62, 63, 65, 67, 68, 69, 71],
};
export const BebopDominantScale: Scale = {
  id: "bebop-dominant-scale",
  name: "Bebop Dominant Scale",
  notes: [60, 62, 64, 65, 67, 69, 70, 72],
};
export const OctatonicWHScale: Scale = {
  id: "octatonic-wh-scale",
  name: "Octatonic Scale (W-H)",
  notes: [60, 62, 63, 65, 66, 68, 69, 71],
};
export const OctatonicHWScale: Scale = {
  id: "octatonic-hw-scale",
  name: "Octatonic Scale (H-W)",
  notes: [60, 61, 63, 64, 66, 67, 69, 70],
};

// Uncommon Scales
export const AcousticScale: Scale = {
  id: "acoustic-scale",
  name: "Acoustic Scale",
  notes: [60, 62, 64, 66, 67, 69, 70],
};
export const HarmonicMajorScale: Scale = {
  id: "harmonic-major-scale",
  name: "Harmonic Major Scale",
  notes: [60, 62, 64, 65, 67, 68, 71],
};
export const PersianScale: Scale = {
  id: "persian-scale",
  name: "Persian Scale",
  notes: [60, 61, 64, 65, 66, 68, 71],
};
export const ByzantineScale: Scale = {
  id: "byzantine-scale",
  name: "Byzantine Scale",
  notes: [60, 61, 64, 65, 67, 68, 71],
};
export const HungarianMinorScale: Scale = {
  id: "hungarian-minor-scale",
  name: "Hungarian Minor Scale",
  notes: [60, 62, 63, 66, 67, 68, 71],
};
export const HungarianMajorScale: Scale = {
  id: "hungarian-major-scale",
  name: "Hungarian Major Scale",
  notes: [60, 63, 64, 66, 67, 69, 70],
};
export const NeapolitanMajorScale: Scale = {
  id: "neapolitan-major-scale",
  name: "Neapolitan Major Scale",
  notes: [60, 61, 63, 65, 67, 69, 71],
};
export const NeapolitanMinorScale: Scale = {
  id: "neapolitan-minor-scale",
  name: "Neapolitan Minor Scale",
  notes: [60, 61, 63, 65, 67, 68, 71],
};

export * as PresetScales from "./scales";
