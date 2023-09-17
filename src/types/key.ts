import { mod } from "utils";
import { ChromaticKey, MajorKeys, MinorKeys } from "./presets/keys";
import { PresetScaleMap as Presets } from "./presets/scales";
import Scales, { Scale, ScaleId } from "./scale";
import { Key, Pitch } from "./units";

export const raisePitch = (pitch: Pitch) => {
  if (pitch === "C") return "C#";
  if (pitch === "D") return "D#";
  if (pitch === "E") return "E#";
  if (pitch === "F") return "F#";
  if (pitch === "G") return "G#";
  if (pitch === "A") return "A#";
  if (pitch === "B") return "B#";

  if (pitch === "C#") return "C##";
  if (pitch === "D#") return "D##";
  if (pitch === "E#") return "E";
  if (pitch === "F#") return "F##";
  if (pitch === "G#") return "G##";
  if (pitch === "A#") return "A##";
  if (pitch === "B#") return "B##";

  if (pitch === "Cb") return "C";
  if (pitch === "Db") return "D";
  if (pitch === "Eb") return "E";
  if (pitch === "Fb") return "F";
  if (pitch === "Gb") return "G";
  if (pitch === "Ab") return "A";
  if (pitch === "Bb") return "B";

  if (pitch === "C##") return "D#";
  if (pitch === "D##") return "E#";
  if (pitch === "E##") return "F##";
  if (pitch === "F##") return "G#";
  if (pitch === "G##") return "A#";
  if (pitch === "A##") return "B#";
  if (pitch === "B##") return "C##";

  if (pitch === "Cbb") return "Cb";
  if (pitch === "Dbb") return "Db";
  if (pitch === "Ebb") return "Eb";
  if (pitch === "Fbb") return "Fb";
  if (pitch === "Gbb") return "Gb";
  if (pitch === "Abb") return "Ab";
  if (pitch === "Bbb") return "Bb";

  throw new Error(`Invalid pitch: ${pitch}`);
};

export const lowerPitch = (pitch: Pitch) => {
  if (pitch === "C") return "Cb";
  if (pitch === "D") return "Db";
  if (pitch === "E") return "Eb";
  if (pitch === "F") return "Fb";
  if (pitch === "G") return "Gb";
  if (pitch === "A") return "Ab";
  if (pitch === "B") return "Bb";

  if (pitch === "C#") return "C";
  if (pitch === "D#") return "D";
  if (pitch === "E#") return "E";
  if (pitch === "F#") return "F";
  if (pitch === "G#") return "G";
  if (pitch === "A#") return "A";
  if (pitch === "B#") return "B";

  if (pitch === "Cb") return "Cbb";
  if (pitch === "Db") return "Dbb";
  if (pitch === "Eb") return "Ebb";
  if (pitch === "Fb") return "Fbb";
  if (pitch === "Gb") return "Gbb";
  if (pitch === "Ab") return "Abb";
  if (pitch === "Bb") return "Bbb";

  if (pitch === "C##") return "C#";
  if (pitch === "D##") return "D#";
  if (pitch === "E##") return "E#";
  if (pitch === "F##") return "F#";
  if (pitch === "G##") return "G#";
  if (pitch === "A##") return "A#";
  if (pitch === "B##") return "B#";

  if (pitch === "Cbb") return "Bbb";
  if (pitch === "Dbb") return "Db";
  if (pitch === "Ebb") return "Eb";
  if (pitch === "Fbb") return "Ebb";
  if (pitch === "Gbb") return "Gb";
  if (pitch === "Abb") return "Ab";
  if (pitch === "Bbb") return "Bb";

  throw new Error(`Invalid pitch: ${pitch}`);
};

export const raiseKey = (key: Key, degree: number | number[]) => {
  let degrees = typeof degree === "number" ? [degree] : degree;
  let raisedKey = [...key];

  for (const d of degrees) {
    const newKey = [...raisedKey];
    const lastStep = mod(d - 1, 12);
    const lastKey = key[lastStep];
    const thisStep = mod(d, 12);
    newKey[thisStep] = raisePitch(lastKey);
    raisedKey = newKey;
  }
  return raisedKey;
};

const raiseKeys = (keys: Key[], degree: number | number[]) => {
  let degrees = typeof degree === "number" ? [degree] : degree;

  return keys.map((key, i) =>
    raiseKey(
      key,
      degrees.map((d) => d + i)
    )
  );
};

export const lowerKey = (key: Key, degree: number | number[]) => {
  let degrees = typeof degree === "number" ? [degree] : degree;
  let loweredKey = [...key];

  for (const d of degrees) {
    const newKey = [...loweredKey];
    const lastStep = mod(d + 1, 12);
    const lastKey = key[lastStep];
    const thisStep = mod(d, 12);
    newKey[thisStep] = lowerPitch(lastKey);
    loweredKey = newKey;
  }
  return loweredKey;
};
const lowerKeys = (keys: Key[], degree: number | number[]) => {
  let degrees = typeof degree === "number" ? [degree] : degree;

  return keys.map((key, i) =>
    lowerKey(
      key,
      degrees.map((d) => d + i)
    )
  );
};

const newScale = new Array(12).fill(0);
const createScales = (scaleId: ScaleId) => {
  const scale = Presets[scaleId];
  if (!scale) throw new Error(`Invalid scale id: ${scaleId}`);
  return newScale.map((_, i) => ({
    ...scale,
    notes: scale.notes.map((x) => x + i),
  }));
};

// Basic Scales
const majorScales = createScales("major-scale");
const minorScales = createScales("minor-scale");
const harmonicMinorScales = createScales("harmonic-minor-scale");
const melodicMinorScales = createScales("melodic-minor-scale");

// Modes
const dorianScales = createScales("dorian-scale");
const phrygianScales = createScales("phrygian-scale");
const lydianScales = createScales("lydian-scale");
const mixolydianScales = createScales("mixolydian-scale");
const locrianScales = createScales("locrian-scale");

// Pentatonic Scales
const majorPentatonicScales = createScales("major-pentatonic-scale");
const minorPentatonicScales = createScales("minor-pentatonic-scale");
const inScales = createScales("in-scale");
const yoScales = createScales("yo-scale");
const insenScales = createScales("insen-scale");
const hirajoshiScales = createScales("hirajoshi-scale");
const iwatoScales = createScales("iwato-scale");

// Hexatonic Scales
const majorHexatonicScales = createScales("major-hexatonic");
const minorHexatonicScales = createScales("minor-hexatonic");
const bluesScales = createScales("blues-scale");
const augmentedScales = createScales("prometheus-scale");
const prometheusScales = createScales("augmented-scale");
const tritoneScales = createScales("tritone-scale");
const wholetoneScales = createScales("whole-tone-scale");

// Octatonic Scales
const bebopMajorScales = createScales("bebop-major-scale");
const bebopDorianScales = createScales("bebop-dorian-scale");
const bebopHarmonicMinorScales = createScales("bebop-harmonic-minor-scale");
const bebopMelodicMinorScales = createScales("bebop-melodic-minor-scale");
const bebopDominantScales = createScales("bebop-dominant-scale");
const octatonicWHScales = createScales("octatonic-wh-scale");
const octatonicHWScales = createScales("octatonic-hw-scale");

// Uncommon Scales
const acousticScales = createScales("acoustic-scale");
const alteredScales = createScales("altered-scale");
const persianScales = createScales("persian-scale");
const harmonicMajorScales = createScales("harmonic-major-scale");
const doubleHarmonicMajorScales = createScales("double-harmonic-major-scale");
const hungarianMinorScales = createScales("hungarian-minor-scale");
const hungarianMajorScales = createScales("hungarian-major-scale");
const neapolitanMajorScales = createScales("neapolitan-major-scale");
const neapolitanMinorScales = createScales("neapolitan-minor-scale");

// Major Keys
const majorKeys = Object.values(MajorKeys) as Key[];
const minorKeys = Object.values(MinorKeys) as Key[];
const harmonicMinorKeys = raiseKeys(minorKeys, 10);
const melodicMinorKeys = raiseKeys(harmonicMinorKeys, 8);

// Mode Keys
const lydianKeys = raiseKeys(majorKeys, 6);
const mixolydianKeys = lowerKeys(majorKeys, 10);
const dorianKeys = raiseKeys(minorKeys, 8);
const phrygianKeys = lowerKeys(minorKeys, 1);
const locrianKeys = lowerKeys(phrygianKeys, 6);

// Pentatonic Keys
const majorPentatonicKeys = majorKeys;
const minorPentatonicKeys = minorKeys;
const inKeys = lowerKeys(minorKeys, [1, 8]);
const yoKeys = minorKeys;
const insenKeys = lowerKeys(minorKeys, 1);
const hirajoshiKeys = lowerKeys(minorKeys, 8);
const iwatoKeys = lowerKeys(minorKeys, [1, 6]);

// Hexatonic Keys
const majorHexatonicKeys = majorKeys;
const minorHexatonicKeys = minorKeys;
const bluesKeys = raiseKeys(minorKeys, 6);
const augmentedKeys = majorKeys;
const prometheusKeys = majorKeys;
const tritoneKeys = majorKeys;
const wholetoneKeys = raiseKeys(majorKeys, [6, 8, 10]);

// Octatonic Keys
const bebopMajorKeys = majorKeys;
const bebopDorianKeys = dorianKeys;
const bebopHarmonicMinorKeys = lowerKeys(harmonicMinorKeys, 10);
const bebopMelodicMinorKeys = melodicMinorKeys;
const bebopDominantKeys = mixolydianKeys;
const octatonicWHKeys = majorKeys;
const octatonicHWKeys = majorKeys;

// Uncommon Keys
const acousticKeys = majorKeys;
const alteredKeys = lowerKeys(locrianKeys, 4);
const persianKeys = locrianKeys;
const harmonicMajorKeys = minorKeys;
const doubleHarmonicMajorKeys = minorKeys;
const hungarianMinorKeys = raiseKeys(harmonicMinorKeys, 6);
const hungarianMajorKeys = octatonicHWKeys;
const neapolitanMajorKeys = phrygianKeys;
const neapolitanMinorKeys = phrygianKeys;

const scalesToKeys = [
  // Basic Scales
  [majorScales, majorKeys],
  [minorScales, minorKeys],
  [harmonicMinorScales, harmonicMinorKeys],
  [melodicMinorScales, melodicMinorKeys],

  // Modes
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

export const getScaleKey = (scale: Scale): Key => {
  if (scale === undefined) return MajorKeys.cMajorKey;

  // Check for strict equality
  for (const [scales, keys] of scalesToKeys) {
    for (let j = 0; j < 12; j++) {
      if (Scales.areEqual(scale, scales[j])) return keys[j];
    }
  }

  // Check for mode equality
  for (const [scales, keys] of scalesToKeys) {
    for (let j = 0; j < 12; j++) {
      if (Scales.areModes(scale, scales[j])) return keys[j];
    }
  }

  return ChromaticKey;
};
