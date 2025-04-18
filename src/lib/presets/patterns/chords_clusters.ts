import { Pattern } from "types/Pattern/PatternTypes";
import * as _ from "utils/duration";

export const ChromaticTrichord: Pattern = {
  id: "pattern_preset_chromatic_trichord",
  name: "Chromatic Trichord",
  stream: [
    _.createQuarterNote(60),
    _.createQuarterNote(61),
    _.createQuarterNote(62),
  ],
};

export const ChromaticTetrachord: Pattern = {
  id: "pattern_preset_chromatic_tetrachord",
  name: "Chromatic Tetrachord",
  stream: [
    _.createQuarterNote(60),
    _.createQuarterNote(61),
    _.createQuarterNote(62),
    _.createQuarterNote(63),
  ],
};

export const ChromaticPentachord: Pattern = {
  id: "pattern_preset_chromatic_pentachord",
  name: "Chromatic Pentachord",
  stream: [
    _.createQuarterNote(60),
    _.createQuarterNote(61),
    _.createQuarterNote(62),
    _.createQuarterNote(63),
    _.createQuarterNote(64),
  ],
};

export const ChromaticHexachord: Pattern = {
  id: "pattern_preset_chromatic_hexachord",
  name: "Chromatic Hexachord",
  stream: [
    _.createQuarterNote(60),
    _.createQuarterNote(61),
    _.createQuarterNote(62),
    _.createQuarterNote(63),
    _.createQuarterNote(64),
    _.createQuarterNote(65),
  ],
};

export const ChromaticHeptachord: Pattern = {
  id: "pattern_preset_chromatic_heptachord",
  name: "Chromatic Heptachord",
  stream: [
    _.createQuarterNote(60),
    _.createQuarterNote(61),
    _.createQuarterNote(62),
    _.createQuarterNote(63),
    _.createQuarterNote(64),
    _.createQuarterNote(65),
    _.createQuarterNote(66),
  ],
};

export const ChromaticOctachord: Pattern = {
  id: "pattern_preset_chromatic_octachord",
  name: "Chromatic Octachord",
  stream: [
    _.createQuarterNote(60),
    _.createQuarterNote(61),
    _.createQuarterNote(62),
    _.createQuarterNote(63),
    _.createQuarterNote(64),
    _.createQuarterNote(65),
    _.createQuarterNote(66),
    _.createQuarterNote(67),
  ],
};

export const ChromaticNonachord: Pattern = {
  id: "pattern_preset_chromatic_nonachord",
  name: "Chromatic Nonachord",
  stream: [
    _.createQuarterNote(60),
    _.createQuarterNote(61),
    _.createQuarterNote(62),
    _.createQuarterNote(63),
    _.createQuarterNote(64),
    _.createQuarterNote(65),
    _.createQuarterNote(66),
    _.createQuarterNote(67),
    _.createQuarterNote(68),
  ],
};

export const ChromaticDecachord: Pattern = {
  id: "pattern_preset_chromatic_decachord",
  name: "Chromatic Decachord",
  stream: [
    _.createQuarterNote(60),
    _.createQuarterNote(61),
    _.createQuarterNote(62),
    _.createQuarterNote(63),
    _.createQuarterNote(64),
    _.createQuarterNote(65),
    _.createQuarterNote(66),
    _.createQuarterNote(67),
    _.createQuarterNote(68),
    _.createQuarterNote(69),
  ],
};

export default {
  ChromaticTrichord,
  ChromaticTetrachord,
  ChromaticPentachord,
  ChromaticHexachord,
  ChromaticHeptachord,
  ChromaticOctachord,
  ChromaticNonachord,
  ChromaticDecachord,
};
