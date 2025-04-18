import { ScaleObject } from "types/Scale/ScaleTypes";
import BasicScales from "./BasicScales";
import DiatonicModes from "./DiatonicModes";
import PentatonicScales from "./PentatonicScales";
import HexatonicScales from "./HexatonicScales";
import OctatonicScales from "./OctatonicScales";
import ChromaticScales from "./ChromaticScales";
import MelodicMinorModes from "./MelodicMinorModes";
import HarmonicMinorModes from "./HarmonicMinorModes";
import HarmonicMajorModes from "./HarmonicMajorModes";
import DoubleHarmonicModes from "./DoubleHarmonicModes";
import NeapolitanMinorModes from "./NeapolitanMinorModes";
import NeapolitanMajorModes from "./NeapolitanMajorModes";
import MessiaenModes from "./MessiaenModes";
import { keyBy } from "lodash";

// Return a map of preset group key to preset group
// e.g. { "Common Scales": [ ... ], "Common Modes": [ ... ], ... }
export const PresetScaleGroupMap = {
  "Custom Scales": [] as ScaleObject[],
  "Track Scales": [] as ScaleObject[],
  "Basic Scales": Object.values(BasicScales),
  "Pentatonic Scales": Object.values(PentatonicScales),
  "Hexatonic Scales": Object.values(HexatonicScales),
  "Octatonic Scales": Object.values(OctatonicScales),
  "Chromatic Scales": Object.values(ChromaticScales),
  "Diatonic Modes": Object.values(DiatonicModes),
  "Melodic Minor Modes": Object.values(MelodicMinorModes),
  "Harmonic Minor Modes": Object.values(HarmonicMinorModes),
  "Harmonic Major Modes": Object.values(HarmonicMajorModes),
  "Double Harmonic Modes": Object.values(DoubleHarmonicModes),
  "Neapolitan Minor Modes": Object.values(NeapolitanMinorModes),
  "Neapolitan Major Modes": Object.values(NeapolitanMajorModes),
  "Messiaen Modes": Object.values(MessiaenModes),
};

export type ScaleGroupMap = typeof PresetScaleGroupMap;
export type ScaleGroupKey = keyof ScaleGroupMap;
export type ScaleGroupList = ScaleGroupKey[];

// Return a list of all preset groups
// e.g. [ "Common Scales", "Common Modes", ... ]
export const PresetScaleGroupList = Object.keys(
  PresetScaleGroupMap
) as ScaleGroupList;

// Return a list of all preset scales
// e.g. [ Major Scale, Minor Scale, ... ]
export const PresetScaleList = Object.values(PresetScaleGroupMap).flat();
export const PresetScaleNotes = PresetScaleList.map((scale) => scale.notes);

// Return a map of preset scale id to preset scale
// e.g. { "major-scale": Major Scale, "minor-scale": Minor Scale, ... }
export const PresetScaleMap = keyBy(PresetScaleList, "id");
