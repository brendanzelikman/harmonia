import { ScaleMap, ScaleObject } from "types/Scale";
import BasicScales from "./BasicScales";
import BasicModes from "./BasicModes";
import PentatonicScales from "./PentatonicScales";
import HexatonicScales from "./HexatonicScales";
import OctatonicScales from "./OctatonicScales";
import UncommonScales from "./UncommonScales";
import { createMap } from "utils/objects";

// Return a map of preset group key to preset group
// e.g. { "Common Scales": [ ... ], "Common Modes": [ ... ], ... }
export const PresetScaleGroupMap = {
  "Custom Scales": [] as ScaleObject[],
  "Basic Scales": Object.values(BasicScales),
  "Basic Modes": Object.values(BasicModes),
  "Pentatonic Scales": Object.values(PentatonicScales),
  "Hexatonic Scales": Object.values(HexatonicScales),
  "Octatonic Scales": Object.values(OctatonicScales),
  "Uncommon Scales": Object.values(UncommonScales),
};

export type ScaleGroupMap = typeof PresetScaleGroupMap;
export type ScaleGroup = keyof ScaleGroupMap;
export type ScaleGroupList = ScaleGroup[];

// Return a list of all preset groups
// e.g. [ "Common Scales", "Common Modes", ... ]
export const PresetScaleGroupList = Object.keys(
  PresetScaleGroupMap
) as ScaleGroupList;

// Return a list of all preset scales
// e.g. [ Major Scale, Minor Scale, ... ]
export const PresetScaleList = Object.values(PresetScaleGroupMap).flat();

// Return a map of preset scale id to preset scale
// e.g. { "major-scale": Major Scale, "minor-scale": Minor Scale, ... }
export const PresetScaleMap = createMap<ScaleMap>(PresetScaleList);
