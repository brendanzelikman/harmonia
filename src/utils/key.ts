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
    const lastStep = mod(d + step, 12);
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
const harmonicMinorKeys = raiseKeys(minorKeys, 10);
const melodicMinorKeys = raiseKeys(harmonicMinorKeys, 8);

// ------------------------------------------------------------
// Basic Mode Keys
// ------------------------------------------------------------

const lydianScales = createScalesInAllKeys("lydian-scale");
const mixolydianScales = createScalesInAllKeys("mixolydian-scale");
const dorianScales = createScalesInAllKeys("dorian-scale");
const phrygianScales = createScalesInAllKeys("phrygian-scale");
const locrianScales = createScalesInAllKeys("locrian-scale");

const lydianKeys = raiseKeys(majorKeys, 6);
const mixolydianKeys = lowerKeys(majorKeys, 10);
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
const hirajoshiKeys = lowerKeys(minorKeys, 9);
const iwatoKeys = lowerKeys(minorKeys, 1, 6);

// ------------------------------------------------------------
// Hexatonic Scale Keys
// ------------------------------------------------------------

const majorHexatonicScales = createScalesInAllKeys("major-hexatonic");
const minorHexatonicScales = createScalesInAllKeys("minor-hexatonic");
const bluesScales = createScalesInAllKeys("blues-scale");
const augmentedScales = createScalesInAllKeys("prometheus-scale");
const prometheusScales = createScalesInAllKeys("augmented-scale");
const tritoneScales = createScalesInAllKeys("tritone-scale");
const wholetoneScales = createScalesInAllKeys("whole-tone-scale");

const majorHexatonicKeys = majorKeys;
const minorHexatonicKeys = minorKeys;
const bluesKeys = raiseKeys(minorKeys, 6);
const augmentedKeys = majorKeys;
const prometheusKeys = majorKeys;
const tritoneKeys = majorKeys;
const wholetoneKeys = raiseKeys(majorKeys, 6, 8, 10);

// ------------------------------------------------------------
// Octatonic Scale Keys
// ------------------------------------------------------------

const bebopMajorScales = createScalesInAllKeys("bebop-major-scale");
const bebopDorianScales = createScalesInAllKeys("bebop-dorian-scale");
const bebopHarmonicMinorScales = createScalesInAllKeys(
  "bebop-harmonic-minor-scale"
);
const bebopMelodicMinorScales = createScalesInAllKeys(
  "bebop-melodic-minor-scale"
);
const bebopDominantScales = createScalesInAllKeys("bebop-dominant-scale");
const octatonicWHScales = createScalesInAllKeys("octatonic-wh-scale");
const octatonicHWScales = createScalesInAllKeys("octatonic-hw-scale");

const bebopMajorKeys = majorKeys;
const bebopDorianKeys = dorianKeys;
const bebopHarmonicMinorKeys = lowerKeys(harmonicMinorKeys, 10);
const bebopMelodicMinorKeys = melodicMinorKeys;
const bebopDominantKeys = mixolydianKeys;
const octatonicWHKeys = majorKeys;
const octatonicHWKeys = majorKeys;

// ------------------------------------------------------------
// Uncommon Scale Keys
// ------------------------------------------------------------

const acousticScales = createScalesInAllKeys("acoustic-scale");
const alteredScales = createScalesInAllKeys("altered-scale");
const persianScales = createScalesInAllKeys("persian-scale");
const harmonicMajorScales = createScalesInAllKeys("harmonic-major-scale");
const doubleHarmonicMajorScales = createScalesInAllKeys(
  "double-harmonic-major-scale"
);
const hungarianMinorScales = createScalesInAllKeys("hungarian-minor-scale");
const hungarianMajorScales = createScalesInAllKeys("hungarian-major-scale");
const neapolitanMajorScales = createScalesInAllKeys("neapolitan-major-scale");
const neapolitanMinorScales = createScalesInAllKeys("neapolitan-minor-scale");

const acousticKeys = majorKeys;
const alteredKeys = lowerKeys(locrianKeys, 4);
const persianKeys = locrianKeys;
const harmonicMajorKeys = minorKeys;
const doubleHarmonicMajorKeys = minorKeys;
const hungarianMinorKeys = raiseKeys(harmonicMinorKeys, 6);
const hungarianMajorKeys = octatonicHWKeys;
const neapolitanMajorKeys = phrygianKeys;
const neapolitanMinorKeys = phrygianKeys;

// ------------------------------------------------------------
// Scale Key List
// ------------------------------------------------------------

const SCALES_BY_KEYS = [
  // Basic Scales
  [majorScales, majorKeys],
  [minorScales, minorKeys],
  [harmonicMinorScales, harmonicMinorKeys],
  [melodicMinorScales, melodicMinorKeys],

  // Basic Modes
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
  [bluesScales, bluesKeys],
  [augmentedScales, augmentedKeys],
  [prometheusScales, prometheusKeys],
  [tritoneScales, tritoneKeys],
  [wholetoneScales, wholetoneKeys],

  // Octatonic Scales
  [bebopMajorScales, bebopMajorKeys],
  [bebopDorianScales, bebopDorianKeys],
  [bebopHarmonicMinorScales, bebopHarmonicMinorKeys],
  [bebopMelodicMinorScales, bebopMelodicMinorKeys],
  [bebopDominantScales, bebopDominantKeys],
  [octatonicWHScales, octatonicWHKeys],
  [octatonicHWScales, octatonicHWKeys],

  // Uncommon Scales
  [acousticScales, acousticKeys],
  [alteredScales, alteredKeys],
  [persianScales, persianKeys],
  [harmonicMajorScales, harmonicMajorKeys],
  [doubleHarmonicMajorScales, doubleHarmonicMajorKeys],
  [hungarianMinorScales, hungarianMinorKeys],
  [hungarianMajorScales, hungarianMajorKeys],
  [neapolitanMajorScales, neapolitanMajorKeys],
  [neapolitanMinorScales, neapolitanMinorKeys],
] as [Scale[], Key[]][];
