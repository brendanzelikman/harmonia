import { MajorKeys, ChromaticKey, MinorKeys } from "presets/keys";
import { Scale, areScalesEqual, areScalesModes } from "types/Scale";
import { mod } from "./math";
import { getRaisedPitchClass, getLoweredPitchClass } from "./pitch";
import { createScalesInAllKeys } from "types/Scale/ScaleFunctions";
import { Key } from "types/units";

// ------------------------------------------------------------
// Key Finders
// ------------------------------------------------------------

/** Get the key of a scale by matching it to a preset */
export const getScaleKey = (scale: Scale): Key => {
  for (const [scales, keys] of SCALES_BY_KEYS) {
    for (let j = 0; j < 12; j++) {
      if (areScalesEqual(scale, scales[j])) return keys[j];
    }
  }
  for (const [scales, keys] of SCALES_BY_KEYS) {
    for (let j = 0; j < 12; j++) {
      if (areScalesModes(scale, scales[j])) return keys[j];
    }
  }
  return ChromaticKey;
};

// ------------------------------------------------------------
// Key Helpers
// ------------------------------------------------------------

/** Alter any degrees of a key by the given step. */
const alterKey = (key: Key, step: number, ...degrees: number[]) => {
  let alteredKey = [...key];
  for (const d of degrees) {
    const newKey = [...alteredKey];
    const lastStep = mod(d - step, 12);
    const lastKey = key[lastStep];
    const thisStep = mod(d, 12);
    newKey[thisStep] =
      step > 0 ? getRaisedPitchClass(lastKey) : getLoweredPitchClass(lastKey);
    alteredKey = newKey;
  }
  return alteredKey;
};

/** Alter any degrees of a list of keys */
const alterKeys = (keys: Key[], step: number, ...degrees: number[]) => {
  return keys.map((key, i) =>
    alterKey(key, step, ...degrees.map((d) => d + i))
  );
};

/** Raise any degrees of a list of keys. */
const raiseKeys = (keys: Key[], ...i: number[]) => alterKeys(keys, 1, ...i);

/** Lower any degrees of a list of keys. */
const lowerKeys = (keys: Key[], ...i: number[]) => alterKeys(keys, -1, ...i);

// ------------------------------------------------------------
// Basic Scale Keys
// ------------------------------------------------------------

const majorScales = createScalesInAllKeys("major-scale");
const minorScales = createScalesInAllKeys("minor-scale");
const harmonicMinorScales = createScalesInAllKeys("harmonic-minor-scale");
const melodicMinorScales = createScalesInAllKeys("melodic-minor-scale");

const majorKeys = Object.values(MajorKeys) as Key[];
const minorKeys = Object.values(MinorKeys) as Key[];
const harmonicMinorKeys = raiseKeys(minorKeys, 11);
const melodicMinorKeys = raiseKeys(harmonicMinorKeys, 8);

// ------------------------------------------------------------
// Diatonic Mode Keys
// ------------------------------------------------------------

const lydianScales = createScalesInAllKeys("lydian-scale");
const mixolydianScales = createScalesInAllKeys("mixolydian-scale");
const dorianScales = createScalesInAllKeys("dorian-scale");
const phrygianScales = createScalesInAllKeys("phrygian-scale");
const locrianScales = createScalesInAllKeys("locrian-scale");

const lydianKeys = raiseKeys(majorKeys, 6);
const mixolydianKeys = majorKeys;
const dorianKeys = raiseKeys(minorKeys, 8);
const phrygianKeys = lowerKeys(minorKeys, 1);
const locrianKeys = lowerKeys(phrygianKeys, 6);

// ------------------------------------------------------------
// Pentatonic Scale Keys
// ------------------------------------------------------------

const majorPentatonicScales = createScalesInAllKeys("major-pentatonic-scale");
const minorPentatonicScales = createScalesInAllKeys("minor-pentatonic-scale");
const inScales = createScalesInAllKeys("in-scale");
const yoScales = createScalesInAllKeys("yo-scale");
const insenScales = createScalesInAllKeys("insen-scale");
const hirajoshiScales = createScalesInAllKeys("hirajoshi-scale");
const iwatoScales = createScalesInAllKeys("iwato-scale");

const majorPentatonicKeys = majorKeys;
const minorPentatonicKeys = minorKeys;
const inKeys = lowerKeys(minorKeys, 1, 8);
const yoKeys = minorKeys;
const insenKeys = lowerKeys(minorKeys, 1);
const hirajoshiKeys = minorKeys;
const iwatoKeys = lowerKeys(minorKeys, 1, 6);

// ------------------------------------------------------------
// Hexatonic Scale Keys
// ------------------------------------------------------------

const majorHexatonicScales = createScalesInAllKeys("major-hexatonic");
const minorHexatonicScales = createScalesInAllKeys("minor-hexatonic");
const majorNoFourScales = createScalesInAllKeys("major-scale-no-4th");
const minorNoFourScales = createScalesInAllKeys("minor-scale-no-4th");
const bluesScales = createScalesInAllKeys("blues-scale");
const augmentedScales = createScalesInAllKeys("prometheus-scale");
const prometheusScales = createScalesInAllKeys("augmented-scale");
const tritoneScales = createScalesInAllKeys("tritone-scale");
const wholetoneScales = createScalesInAllKeys("whole-tone-scale");

const majorHexatonicKeys = majorKeys;
const minorHexatonicKeys = minorKeys;
const majorNoFourKeys = majorKeys;
const minorNoFourKeys = minorKeys;
const bluesKeys = raiseKeys(minorKeys, 6);
const augmentedKeys = majorKeys;
const prometheusKeys = majorKeys;
const tritoneKeys = majorKeys;
const wholetoneKeys = raiseKeys(majorKeys, 6, 8, 10);

// ------------------------------------------------------------
// Octatonic Scale Keys
// ------------------------------------------------------------

const bebopMajorScales = createScalesInAllKeys("bebop-major-scale");
const bebopMinorScales = createScalesInAllKeys("bebop-minor-scale");
const bebopHarmonicMinorScales = createScalesInAllKeys(
  "bebop-harmonic-minor-scale"
);
const bebopMelodicMinorScales = createScalesInAllKeys(
  "bebop-melodic-minor-scale"
);
const bebopDominantScales = createScalesInAllKeys("bebop-dominant-scale");
const octatonicWHScales = createScalesInAllKeys("octatonic-wh-scale");
const octatonicHWScales = createScalesInAllKeys("octatonic-hw-scale");

const bebopMajorKeys = raiseKeys(majorKeys, 8);
const bebopMinorKeys = raiseKeys(dorianKeys, 4);
const bebopHarmonicMinorKeys = lowerKeys(harmonicMinorKeys, 10);
const bebopMelodicMinorKeys = raiseKeys(melodicMinorKeys, 8);
const bebopDominantKeys = raiseKeys(mixolydianKeys, 11);
const octatonicWHKeys = majorKeys;
const octatonicHWKeys = majorKeys;

// ------------------------------------------------------------
// Melodic Minor Mode Keys
// ------------------------------------------------------------

const dorianFlat2Scales = createScalesInAllKeys("dorian-flat-2-scale");
const lydianAugmentedScales = createScalesInAllKeys("lydian-augmented-scale");
const acousticScales = createScalesInAllKeys("acoustic-scale");
const aeolianDominantScales = createScalesInAllKeys("aeolian-dominant-scale");
const halfDiminishedScales = createScalesInAllKeys("half-diminished-scale");
const superLocrianScales = createScalesInAllKeys("super-locrian-scale");

const dorianFlat2Keys = lowerKeys(dorianKeys, 1);
const lydianAugmentedKeys = raiseKeys(lydianKeys, 8);
const acousticKeys = lowerKeys(lydianKeys, 10);
const aeolianDominantKeys = raiseKeys(minorKeys, 4);
const halfDiminishedKeys = lowerKeys(minorKeys, 6);
const superLocrianKeys = lowerKeys(locrianKeys, 4);

// ------------------------------------------------------------
// Harmonic Minor Mode Keys
// ------------------------------------------------------------

const locrianSharp6Scales = createScalesInAllKeys("locrian-sharp-6-scale");
const ionianSharp5Scales = createScalesInAllKeys("ionian-sharp-5-scale");
const dorianSharp4Scales = createScalesInAllKeys("dorian-sharp-4-scale");
const phrygianDominantScales = createScalesInAllKeys("phrygian-dominant-scale");
const lydianSharp2Scales = createScalesInAllKeys("lydian-sharp-2-scale");
const ultraLocrianScales = createScalesInAllKeys("ultra-locrian-scale");

const locrianSharp6Keys = raiseKeys(locrianKeys, 9);
const ionianSharp5Keys = raiseKeys(majorKeys, 8);
const dorianSharp4Keys = raiseKeys(dorianKeys, 6);
const phrygianDominantKeys = raiseKeys(phrygianKeys, 4);
const lydianSharp2Keys = raiseKeys(lydianKeys, 3);
const ultraLocrianKeys = lowerKeys(superLocrianKeys, 9);

// ------------------------------------------------------------
// Harmonic Major Mode Keys
// ------------------------------------------------------------

const harmonicMajorScales = createScalesInAllKeys("harmonic-major-scale");
const dorianFlat5Scales = createScalesInAllKeys("dorian-flat-5-scale");
const phrygianFlat4Scales = createScalesInAllKeys("phrygian-flat-4-scale");
const lydianFlat3Scales = createScalesInAllKeys("lydian-flat-3-scale");
const mixolydianFlat2Scales = createScalesInAllKeys("mixolydian-flat-2-scale");
const lydianAugmentedSharp2Scales = createScalesInAllKeys(
  "lydian-augmented-sharp-2-scale"
);
const locrianDoubleFlat7Scales = createScalesInAllKeys(
  "locrian-double-flat-7-scale"
);

const harmonicMajorKeys = lowerKeys(majorKeys, 8);
const dorianFlat5Keys = lowerKeys(dorianKeys, 6);
const phrygianFlat4Keys = lowerKeys(phrygianKeys, 4);
const lydianFlat3Keys = lowerKeys(lydianKeys, 3);
const mixolydianFlat2Keys = lowerKeys(mixolydianKeys, 1);
const lydianAugmentedSharp2Keys = raiseKeys(lydianAugmentedKeys, 3);
const locrianDoubleFlat7Keys = lowerKeys(locrianKeys, 9);

// ------------------------------------------------------------
// Double Harmonic Keys
// ------------------------------------------------------------

const doubleHarmonicScales = createScalesInAllKeys("double-harmonic-scale");
const lydianSharp2Sharp6Scales = createScalesInAllKeys(
  "lydian-sharp-2-sharp-6-scale"
);
const ultraLocrianSharp5Scales = createScalesInAllKeys(
  "ultra-locrian-sharp-5-scale"
);
const doubleHarmonicMinorScales = createScalesInAllKeys(
  "double-harmonic-minor-scale"
);
const mixolydianFlat5Flat2Scales = createScalesInAllKeys(
  "mixolydian-flat-5-flat-2-scale"
);
const ionianSharp5Sharp2Scales = createScalesInAllKeys(
  "ionian-sharp-5-sharp-2-scale"
);
const locrianDoubleFlat3DoubleFlat7Scales = createScalesInAllKeys(
  "locrian-double-flat-3-double-flat-7-scale"
);

const doubleHarmonicKeys = lowerKeys(harmonicMajorKeys, 1);
const lydianSharp2Sharp6Keys = raiseKeys(lydianSharp2Keys, 10);
const ultraLocrianSharp5Keys = raiseKeys(ultraLocrianKeys, 7);
const doubleHarmonicMinorKeys = raiseKeys(harmonicMinorKeys, 6);
const mixolydianFlat5Flat2Keys = lowerKeys(mixolydianFlat2Keys, 6);
const ionianSharp5Sharp2Keys = raiseKeys(ionianSharp5Keys, 3);
const locrianDoubleFlat3DoubleFlat7Keys = lowerKeys(locrianDoubleFlat7Keys, 2);

// ------------------------------------------------------------
// Neapolitan Minor Keys
// ------------------------------------------------------------

const neapolitanMinorScales = createScalesInAllKeys("neapolitan-minor-scale");
const lydianSharp6Scales = createScalesInAllKeys("lydian-sharp-6-scale");
const mixolydianAugmentedScales = createScalesInAllKeys(
  "mixolydian-augmented-scale"
);
const aeolianSharp4Scales = createScalesInAllKeys("aeolian-sharp-4-scale");
const locrianDominantScales = createScalesInAllKeys("locrian-dominant-scale");
const ionianSharp2Scales = createScalesInAllKeys("ionian-sharp-2-scale");
const ultraLocrianDoubleFlat3Scales = createScalesInAllKeys(
  "ultra-locrian-double-flat-3-scale"
);

const neapolitanMinorKeys = lowerKeys(harmonicMinorKeys, 1);
const lydianSharp6Keys = raiseKeys(lydianKeys, 10);
const mixolydianAugmentedKeys = raiseKeys(mixolydianKeys, 8);
const aeolianSharp4Keys = raiseKeys(minorKeys, 6);
const locrianDominantKeys = raiseKeys(locrianKeys, 4);
const ionianSharp2Keys = raiseKeys(majorKeys, 3);
const ultraLocrianDoubleFlat3Keys = lowerKeys(ultraLocrianKeys, 2);

// ------------------------------------------------------------
// Neapolitan Major Keys
// ------------------------------------------------------------

const neapolitanMajorScales = createScalesInAllKeys("neapolitan-major-scale");
const leadingWholeToneScales = createScalesInAllKeys(
  "leading-whole-tone-scale"
);
const lydianAugmentedDominantScales = createScalesInAllKeys(
  "lydian-augmented-dominant-scale"
);
const lydianMinorScales = createScalesInAllKeys("lydian-minor-scale");
const majorLocrianScales = createScalesInAllKeys("major-locrian-scale");
const superLocrianSharp2Scales = createScalesInAllKeys(
  "super-locrian-sharp-2-scale"
);
const superLocrianDoubleFlat3Scales = createScalesInAllKeys(
  "super-locrian-double-flat-3-scale"
);

const neapolitanMajorKeys = lowerKeys(majorKeys, 1, 3);
const leadingWholeToneKeys = raiseKeys(lydianAugmentedKeys, 10);
const lydianAugmentedDominantKeys = raiseKeys(acousticKeys, 8);
const lydianDominantFlat6Keys = lowerKeys(acousticKeys, 8);
const majorLocrianKeys = raiseKeys(locrianKeys, 2, 4);
const superLocrianSharp2Keys = lowerKeys(halfDiminishedKeys, 3, 4);
const superLocrianDoubleFlat3Keys = lowerKeys(superLocrianKeys, 2);

// ------------------------------------------------------------
// Scale Key List
// ------------------------------------------------------------

const SCALES_BY_KEYS = [
  // Basic Scales
  [majorScales, majorKeys],
  [minorScales, minorKeys],
  [harmonicMinorScales, harmonicMinorKeys],
  [melodicMinorScales, melodicMinorKeys],

  // Diatonic Modes
  [lydianScales, lydianKeys],
  [dorianScales, dorianKeys],
  [phrygianScales, phrygianKeys],
  [mixolydianScales, mixolydianKeys],
  [locrianScales, locrianKeys],

  // Pentatonic Scales
  [majorPentatonicScales, majorPentatonicKeys],
  [minorPentatonicScales, minorPentatonicKeys],
  [inScales, inKeys],
  [yoScales, yoKeys],
  [insenScales, insenKeys],
  [hirajoshiScales, hirajoshiKeys],
  [iwatoScales, iwatoKeys],

  // Hexatonic Scales
  [majorHexatonicScales, majorHexatonicKeys],
  [minorHexatonicScales, minorHexatonicKeys],
  [majorNoFourScales, majorNoFourKeys],
  [minorNoFourScales, minorNoFourKeys],
  [bluesScales, bluesKeys],
  [augmentedScales, augmentedKeys],
  [prometheusScales, prometheusKeys],
  [tritoneScales, tritoneKeys],
  [wholetoneScales, wholetoneKeys],

  // Octatonic Scales
  [bebopMajorScales, bebopMajorKeys],
  [bebopMinorScales, bebopMinorKeys],
  [bebopHarmonicMinorScales, bebopHarmonicMinorKeys],
  [bebopMelodicMinorScales, bebopMelodicMinorKeys],
  [bebopDominantScales, bebopDominantKeys],
  [octatonicWHScales, octatonicWHKeys],
  [octatonicHWScales, octatonicHWKeys],

  // Melodic Minor Modes
  [melodicMinorScales, melodicMinorKeys],
  [dorianFlat2Scales, dorianFlat2Keys],
  [lydianAugmentedScales, lydianAugmentedKeys],
  [acousticScales, acousticKeys],
  [aeolianDominantScales, aeolianDominantKeys],
  [halfDiminishedScales, halfDiminishedKeys],
  [superLocrianScales, superLocrianKeys],

  // Harmonic Minor Modes
  [locrianSharp6Scales, locrianSharp6Keys],
  [ionianSharp5Scales, ionianSharp5Keys],
  [dorianSharp4Scales, dorianSharp4Keys],
  [phrygianDominantScales, phrygianDominantKeys],
  [lydianSharp2Scales, lydianSharp2Keys],
  [ultraLocrianScales, ultraLocrianKeys],

  // Harmonic Major Modes
  [harmonicMajorScales, harmonicMajorKeys],
  [dorianFlat5Scales, dorianFlat5Keys],
  [phrygianFlat4Scales, phrygianFlat4Keys],
  [lydianFlat3Scales, lydianFlat3Keys],
  [mixolydianFlat2Scales, mixolydianFlat2Keys],
  [lydianAugmentedSharp2Scales, lydianAugmentedSharp2Keys],
  [locrianDoubleFlat7Scales, locrianDoubleFlat7Keys],

  // Double Harmonic Modes
  [doubleHarmonicScales, doubleHarmonicKeys],
  [lydianSharp2Sharp6Scales, lydianSharp2Sharp6Keys],
  [ultraLocrianSharp5Scales, ultraLocrianSharp5Keys],
  [doubleHarmonicMinorScales, doubleHarmonicMinorKeys],
  [mixolydianFlat5Flat2Scales, mixolydianFlat5Flat2Keys],
  [ionianSharp5Sharp2Scales, ionianSharp5Sharp2Keys],
  [locrianDoubleFlat3DoubleFlat7Scales, locrianDoubleFlat3DoubleFlat7Keys],

  // Neapolitan Minor Modes
  [neapolitanMinorScales, neapolitanMinorKeys],
  [lydianSharp6Scales, lydianSharp6Keys],
  [mixolydianAugmentedScales, mixolydianAugmentedKeys],
  [aeolianSharp4Scales, aeolianSharp4Keys],
  [locrianDominantScales, locrianDominantKeys],
  [ionianSharp2Scales, ionianSharp2Keys],
  [ultraLocrianDoubleFlat3Scales, ultraLocrianDoubleFlat3Keys],

  // Neapolitan Major Modes
  [neapolitanMajorScales, neapolitanMajorKeys],
  [leadingWholeToneScales, leadingWholeToneKeys],
  [lydianAugmentedDominantScales, lydianAugmentedDominantKeys],
  [lydianMinorScales, lydianDominantFlat6Keys],
  [majorLocrianScales, majorLocrianKeys],
  [superLocrianSharp2Scales, superLocrianSharp2Keys],
  [superLocrianDoubleFlat3Scales, superLocrianDoubleFlat3Keys],
] as [Scale[], Key[]][];
