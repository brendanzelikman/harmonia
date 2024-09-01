import { PresetScaleMap } from "presets/scales";
import { getTransposedScale } from "types/Scale/ScaleTransformers";
import { ScaleId, ScaleObject } from "types/Scale/ScaleTypes";
import { Key } from "types/units";
import { mod } from "utils/math";
import {
  getPitchClassUpperNeighbor,
  getPitchClassLowerNeighbor,
} from "utils/pitchClass";
import { majorKeys } from "./MajorKeys";
import { minorKeys } from "./MinorKeys";

/** Create a list of scales in all 12 keys from a preset ID. */
const createScalesInAllKeys = (scaleId: ScaleId): ScaleObject[] => {
  const scale = PresetScaleMap[scaleId];
  if (!scale) return new Array(12).fill([]);
  return new Array(12).fill(0).map((_, i) => getTransposedScale(scale, i));
};

/** Alter any degrees of a key by the given step. */
const alterKey = (key: Key, steps: number, ...degrees: number[]) => {
  let alteredKey = [...key];
  for (const d of degrees) {
    const newKey = [...alteredKey];
    const lastStep = mod(d - steps, 12);
    const lastKey = key[lastStep];
    const thisStep = mod(d, 12);
    newKey[thisStep] =
      steps > 0
        ? getPitchClassUpperNeighbor(lastKey)
        : getPitchClassLowerNeighbor(lastKey);
    alteredKey = newKey;
  }
  return alteredKey;
};
/** Alter any degrees of a list of keys by the given number of steps */
const alterKeys =
  (steps: number) =>
  (keys: Key[], ...degrees: number[]) => {
    return keys.map((key, i) =>
      alterKey(key, steps, ...degrees.map((d) => d + i))
    );
  };

export const raiseKeys = alterKeys(1);
export const lowerKeys = alterKeys(-1);
type Keyset = [ScaleObject[], Key[]];

// ------------------------------------------------------------
// Basic Scale Keys
// ------------------------------------------------------------

const chromatic: Keyset = [
  createScalesInAllKeys("scale_preset_chromatic"),
  majorKeys,
];
const major: Keyset = [createScalesInAllKeys("scale_preset_major"), majorKeys];
const minor: Keyset = [createScalesInAllKeys("scale_preset_minor"), minorKeys];
const harmonic_minor: Keyset = [
  createScalesInAllKeys("scale_preset_harmonic_minor"),
  raiseKeys(minorKeys, 11),
];
const melodic_minor: Keyset = [
  createScalesInAllKeys("scale_preset_melodic_minor"),
  raiseKeys(harmonic_minor[1], 8),
];

// ------------------------------------------------------------
// Diatonic Mode Keys
// ------------------------------------------------------------

const lydian: Keyset = [
  createScalesInAllKeys("scale_preset_lydian_scale"),
  raiseKeys(majorKeys, 6),
];
const mixolydian: Keyset = [
  createScalesInAllKeys("scale_preset_mixolydian_scale"),
  majorKeys,
];
const dorian: Keyset = [
  createScalesInAllKeys("scale_preset_dorian_scale"),
  raiseKeys(minorKeys, 8),
];
const phrygian: Keyset = [
  createScalesInAllKeys("scale_preset_phrygian_scale"),
  lowerKeys(minorKeys, 1),
];
const locrian: Keyset = [
  createScalesInAllKeys("scale_preset_locrian_scale"),
  lowerKeys(phrygian[1], 6),
];

// ------------------------------------------------------------
// Pentatonic Scale Keys
// ------------------------------------------------------------

const major_pentatonic: Keyset = [
  createScalesInAllKeys("scale_preset_major_pentatonic"),
  majorKeys,
];
const minor_pentatonic: Keyset = [
  createScalesInAllKeys("scale_preset_minor_pentatonic"),
  minorKeys,
];
const _in: Keyset = [
  createScalesInAllKeys("scale_preset_in"),
  lowerKeys(minorKeys, 1, 8),
];
const yo: Keyset = [createScalesInAllKeys("scale_preset_yo"), minorKeys];
const insen: Keyset = [
  createScalesInAllKeys("scale_preset_insen"),
  lowerKeys(minorKeys, 1),
];
const hirajoshi: Keyset = [
  createScalesInAllKeys("scale_preset_hirajoshi"),
  minorKeys,
];
const iwato: Keyset = [
  createScalesInAllKeys("scale_preset_iwato"),
  lowerKeys(minorKeys, 1, 6),
];

// ------------------------------------------------------------
// Hexatonic Scale Keys
// ------------------------------------------------------------

const major_hexatonic: Keyset = [
  createScalesInAllKeys("scale_preset_major_hexatonic"),
  majorKeys,
];
const minor_hexatonic: Keyset = [
  createScalesInAllKeys("scale_preset_minor_hexatonic"),
  minorKeys,
];
const major_no2: Keyset = [
  createScalesInAllKeys("scale_preset_major_no2"),
  majorKeys,
];
const minor_no2: Keyset = [
  createScalesInAllKeys("scale_preset_minor_no2"),
  minorKeys,
];
const major_no3: Keyset = [
  createScalesInAllKeys("scale_preset_major_no3"),
  majorKeys,
];
const minor_no3: Keyset = [
  createScalesInAllKeys("scale_preset_minor_no3"),
  minorKeys,
];
const major_no4: Keyset = [
  createScalesInAllKeys("scale_preset_major_no4"),
  majorKeys,
];
const minor_no4: Keyset = [
  createScalesInAllKeys("scale_preset_minor_no4"),
  minorKeys,
];
const major_no5: Keyset = [
  createScalesInAllKeys("scale_preset_major_no5"),
  majorKeys,
];
const minor_no5: Keyset = [
  createScalesInAllKeys("scale_preset_minor_no5"),
  minorKeys,
];
const major_no6: Keyset = [
  createScalesInAllKeys("scale_preset_major_no6"),
  majorKeys,
];
const minor_no6: Keyset = [
  createScalesInAllKeys("scale_preset_minor_no6"),
  minorKeys,
];
const blues: Keyset = [
  createScalesInAllKeys("scale_preset_blues"),
  raiseKeys(minorKeys, 6),
];
const augmented: Keyset = [
  createScalesInAllKeys("scale_preset_augmented"),
  majorKeys,
];
const prometheus: Keyset = [
  createScalesInAllKeys("scale_preset_prometheus"),
  majorKeys,
];
const tritone: Keyset = [
  createScalesInAllKeys("scale_preset_tritone"),
  majorKeys,
];
const whole_tone: Keyset = [
  createScalesInAllKeys("scale_preset_whole_tone"),
  raiseKeys(majorKeys, 6, 8, 10),
];

// ------------------------------------------------------------
// Octatonic Scale Keys
// ------------------------------------------------------------

const bebop_major: Keyset = [
  createScalesInAllKeys("scale_preset_bebop_major"),
  raiseKeys(majorKeys, 8),
];
const bebop_minor: Keyset = [
  createScalesInAllKeys("scale_preset_bebop_minor"),
  raiseKeys(dorian[1], 4),
];
const bebop_harmonic_minor: Keyset = [
  createScalesInAllKeys("scale_preset_bebop_harmonic_minor"),
  lowerKeys(harmonic_minor[1], 10),
];
const bebop_melodic_minor: Keyset = [
  createScalesInAllKeys("scale_preset_bebop_melodic_minor"),
  raiseKeys(melodic_minor[1], 8),
];
const bebop_dominant: Keyset = [
  createScalesInAllKeys("scale_preset_bebop_dominant"),
  raiseKeys(mixolydian[1], 11),
];
const octatonic_wh: Keyset = [
  createScalesInAllKeys("scale_preset_octatonic_wh"),
  majorKeys,
];
const octatonic_hw: Keyset = [
  createScalesInAllKeys("scale_preset_octatonic_hw"),
  majorKeys,
];

// ------------------------------------------------------------
// Eleven Note Scale Keys
// ------------------------------------------------------------

const chromatic_no2: Keyset = [
  createScalesInAllKeys("scale_preset_chromatic_no2"),
  majorKeys,
];
const chromatic_no3: Keyset = [
  createScalesInAllKeys("scale_preset_chromatic_no3"),
  majorKeys,
];
const chromatic_no4: Keyset = [
  createScalesInAllKeys("scale_preset_chromatic_no4"),
  majorKeys,
];
const chromatic_no5: Keyset = [
  createScalesInAllKeys("scale_preset_chromatic_no5"),
  majorKeys,
];
const chromatic_no6: Keyset = [
  createScalesInAllKeys("scale_preset_chromatic_no6"),
  majorKeys,
];
const chromatic_no7: Keyset = [
  createScalesInAllKeys("scale_preset_chromatic_no7"),
  majorKeys,
];
const chromatic_no8: Keyset = [
  createScalesInAllKeys("scale_preset_chromatic_no8"),
  majorKeys,
];
const chromatic_no9: Keyset = [
  createScalesInAllKeys("scale_preset_chromatic_no9"),
  majorKeys,
];
const chromatic_no10: Keyset = [
  createScalesInAllKeys("scale_preset_chromatic_no10"),
  majorKeys,
];
const chromatic_no11: Keyset = [
  createScalesInAllKeys("scale_preset_chromatic_no11"),
  majorKeys,
];
const chromatic_no12: Keyset = [
  createScalesInAllKeys("scale_preset_chromatic_no12"),
  majorKeys,
];

// ------------------------------------------------------------
// Melodic Minor Mode Keys
// ------------------------------------------------------------

const dorian_b2: Keyset = [
  createScalesInAllKeys("scale_preset_dorian_b2"),
  lowerKeys(dorian[1], 1),
];
const lydian_augmented: Keyset = [
  createScalesInAllKeys("scale_preset_lydian_augmented"),
  raiseKeys(lydian[1], 8),
];
const acoustic: Keyset = [
  createScalesInAllKeys("scale_preset_acoustic"),
  lowerKeys(lydian[1], 10),
];
const aeolian_dominant: Keyset = [
  createScalesInAllKeys("scale_preset_aeolian_dominant"),
  raiseKeys(minorKeys, 4),
];
const half_diminished: Keyset = [
  createScalesInAllKeys("scale_preset_half_diminished"),
  lowerKeys(minorKeys, 6),
];
const super_locrian: Keyset = [
  createScalesInAllKeys("scale_preset_super_locrian"),
  lowerKeys(locrian[1], 4),
];

// ------------------------------------------------------------
// Harmonic Minor Mode Keys
// ------------------------------------------------------------

const locrian_h6: Keyset = [
  createScalesInAllKeys("scale_preset_locrian_#6"),
  raiseKeys(locrian[1], 9),
];
const ionian_h5: Keyset = [
  createScalesInAllKeys("scale_preset_ionian_#5"),
  raiseKeys(majorKeys, 8),
];
const dorian_h4: Keyset = [
  createScalesInAllKeys("scale_preset_dorian_#4"),
  raiseKeys(dorian[1], 6),
];
const phrygian_dominant: Keyset = [
  createScalesInAllKeys("scale_preset_phrygian_dominant"),
  raiseKeys(phrygian[1], 4),
];
const lydian_h2: Keyset = [
  createScalesInAllKeys("scale_preset_lydian_#2"),
  raiseKeys(lydian[1], 3),
];
const ultra_locrian: Keyset = [
  createScalesInAllKeys("scale_preset_ultra_locrian"),
  lowerKeys(super_locrian[1], 9),
];

// ------------------------------------------------------------
// Harmonic Major Mode Keys
// ------------------------------------------------------------

const harmonic_major: Keyset = [
  createScalesInAllKeys("scale_preset_harmonic_major"),
  lowerKeys(majorKeys, 8),
];
const dorian_b5: Keyset = [
  createScalesInAllKeys("scale_preset_dorian_b5"),
  lowerKeys(dorian[1], 6),
];
const phrygian_b4: Keyset = [
  createScalesInAllKeys("scale_preset_phrygian_b4"),
  lowerKeys(phrygian[1], 4),
];
const lydian_b3: Keyset = [
  createScalesInAllKeys("scale_preset_lydian_b3"),
  lowerKeys(lydian[1], 3),
];
const mixolydian_b2: Keyset = [
  createScalesInAllKeys("scale_preset_mixolydian_b2"),
  lowerKeys(mixolydian[1], 1),
];
const lydian_augmented_h2: Keyset = [
  createScalesInAllKeys("scale_preset_lydian_augmented_#2"),
  raiseKeys(lydian_augmented[1], 3),
];
const locrian_bb7: Keyset = [
  createScalesInAllKeys("scale_preset_locrian_bb7"),
  lowerKeys(locrian[1], 9),
];

// ------------------------------------------------------------
// Double Harmonic Keys
// ------------------------------------------------------------

const double_harmonic: Keyset = [
  createScalesInAllKeys("scale_preset_double_harmonic"),
  lowerKeys(harmonic_major[1], 1),
];
const lydian_h2_h6: Keyset = [
  createScalesInAllKeys("scale_preset_lydian_#2_#6"),
  raiseKeys(lydian_h2[1], 10),
];
const ultra_locrian_h5: Keyset = [
  createScalesInAllKeys("scale_preset_ultra_locrian_#5"),
  raiseKeys(ultra_locrian[1], 7),
];
const double_harmonic_minor: Keyset = [
  createScalesInAllKeys("scale_preset_double_harmonic_minor"),
  raiseKeys(harmonic_minor[1], 6),
];
const mixolydian_b5_b2: Keyset = [
  createScalesInAllKeys("scale_preset_mixolydian_b5_b2"),
  lowerKeys(mixolydian[1], 6),
];
const ionian_h5_h2: Keyset = [
  createScalesInAllKeys("scale_preset_ionian_#5_#2"),
  raiseKeys(ionian_h5[1], 3),
];
const locrian_bb3_bb7: Keyset = [
  createScalesInAllKeys("scale_preset_locrian_bb3_bb7"),
  lowerKeys(locrian_bb7[1], 2),
];

// ------------------------------------------------------------
// Neapolitan Minor Keys
// ------------------------------------------------------------

const neapolitan_minor: Keyset = [
  createScalesInAllKeys("scale_preset_neapolitan_minor"),
  lowerKeys(harmonic_minor[1], 1),
];
const lydian_h6: Keyset = [
  createScalesInAllKeys("scale_preset_lydian_#6"),
  raiseKeys(lydian[1], 10),
];
const mixolydian_aug: Keyset = [
  createScalesInAllKeys("scale_preset_mixolydian_aug"),
  raiseKeys(mixolydian[1], 8),
];
const aeolian_h4: Keyset = [
  createScalesInAllKeys("scale_preset_aeolian_#4"),
  raiseKeys(minorKeys, 6),
];
const locrian_dominant: Keyset = [
  createScalesInAllKeys("scale_preset_locrian_dominant"),
  raiseKeys(locrian[1], 4),
];
const ionian_h2: Keyset = [
  createScalesInAllKeys("scale_preset_ionian_#2"),
  raiseKeys(majorKeys, 3),
];
const ultra_locrian_bb3: Keyset = [
  createScalesInAllKeys("scale_preset_ultra_locrian_bb3"),
  lowerKeys(ultra_locrian[1], 2),
];

// ------------------------------------------------------------
// Neapolitan Major Keys
// ------------------------------------------------------------

const neapolitan_major: Keyset = [
  createScalesInAllKeys("scale_preset_neapolitan_major"),
  lowerKeys(majorKeys, 1, 3),
];
const leading_whole_tone: Keyset = [
  createScalesInAllKeys("scale_preset_leading_whole_tone"),
  raiseKeys(lydian_augmented[1], 10),
];
const lydian_aug_dom: Keyset = [
  createScalesInAllKeys("scale_preset_lydian_aug_dom"),
  raiseKeys(acoustic[1], 8),
];
const lydian_minor: Keyset = [
  createScalesInAllKeys("scale_preset_lydian_minor"),
  lowerKeys(acoustic[1], 8),
];
const major_locrian: Keyset = [
  createScalesInAllKeys("scale_preset_major_locrian"),
  raiseKeys(locrian[1], 2, 4),
];
const super_locrian_h2: Keyset = [
  createScalesInAllKeys("scale_preset_super_locrian_#2"),
  lowerKeys(half_diminished[1], 3, 4),
];
const super_locrian_bb3: Keyset = [
  createScalesInAllKeys("scale_preset_super_locrian_bb3"),
  lowerKeys(super_locrian[1], 2),
];

// ------------------------------------------------------------
// Messiaen Mode Keys
// ------------------------------------------------------------

const messiaen1: Keyset = [
  createScalesInAllKeys("scale_preset_messiaen_mode_1"),
  majorKeys,
];
const messiaen2: Keyset = [
  createScalesInAllKeys("scale_preset_messiaen_mode_2"),
  majorKeys,
];
const messiaen3: Keyset = [
  createScalesInAllKeys("scale_preset_messiaen_mode_3"),
  majorKeys,
];
const messiaen4: Keyset = [
  createScalesInAllKeys("scale_preset_messiaen_mode_4"),
  majorKeys,
];
const messiaen5: Keyset = [
  createScalesInAllKeys("scale_preset_messiaen_mode_5"),
  majorKeys,
];
const messiaen6: Keyset = [
  createScalesInAllKeys("scale_preset_messiaen_mode_6"),
  majorKeys,
];
const messiaen7: Keyset = [
  createScalesInAllKeys("scale_preset_messiaen_mode_7"),
  majorKeys,
];

// ------------------------------------------------------------
// Scale Key Sets
// ------------------------------------------------------------

export const SCALE_KEYSETS: Keyset[] = [
  // Chromatic Scales
  chromatic_no2,
  chromatic_no3,
  chromatic_no4,
  chromatic_no5,
  chromatic_no6,
  chromatic_no7,
  chromatic_no8,
  chromatic_no9,
  chromatic_no10,
  chromatic_no11,
  chromatic_no12,

  // Melodic Minor Modes
  melodic_minor,
  dorian_b2,
  lydian_augmented,
  acoustic,
  aeolian_dominant,
  half_diminished,
  super_locrian,

  // Harmonic Minor Modes
  locrian_h6,
  ionian_h5,
  dorian_h4,
  phrygian_dominant,
  lydian_h2,
  ultra_locrian,

  // Harmonic Major Modes
  harmonic_major,
  dorian_b5,
  phrygian_b4,
  lydian_b3,
  mixolydian_b2,
  lydian_augmented_h2,
  locrian_bb7,

  // Double Harmonic Modes
  double_harmonic,
  lydian_h2_h6,
  ultra_locrian_h5,
  double_harmonic_minor,
  mixolydian_b5_b2,
  ionian_h5_h2,
  locrian_bb3_bb7,

  // Neapolitan Minor Modes
  neapolitan_minor,
  lydian_h6,
  mixolydian_aug,
  aeolian_h4,
  locrian_dominant,
  ionian_h2,
  ultra_locrian_bb3,

  // Neapolitan Major Modes
  neapolitan_major,
  leading_whole_tone,
  lydian_aug_dom,
  lydian_minor,
  major_locrian,
  super_locrian_h2,
  super_locrian_bb3,

  // Messiaen Modes
  messiaen1,
  messiaen2,
  messiaen3,
  messiaen4,
  messiaen5,
  messiaen6,
  messiaen7,

  // Basic Scales
  chromatic,
  major,
  minor,
  harmonic_minor,
  melodic_minor,

  // Diatonic Modes
  lydian,
  dorian,
  phrygian,
  mixolydian,
  locrian,

  // Pentatonic Scales
  major_pentatonic,
  minor_pentatonic,
  _in,
  yo,
  insen,
  hirajoshi,
  iwato,

  // Hexatonic Scales
  major_hexatonic,
  minor_hexatonic,
  major_no2,
  minor_no2,
  major_no3,
  minor_no3,
  major_no4,
  minor_no4,
  major_no5,
  minor_no5,
  major_no6,
  minor_no6,
  blues,
  augmented,
  prometheus,
  tritone,
  whole_tone,

  // Octatonic Scales
  bebop_major,
  bebop_minor,
  bebop_harmonic_minor,
  bebop_melodic_minor,
  bebop_dominant,
  octatonic_wh,
  octatonic_hw,
];
