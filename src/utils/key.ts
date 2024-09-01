import { ChromaticKey } from "presets/keys";
import { mod } from "./math";
import { Key, MIDI } from "types/units";
import {
  chromaticNotes,
  isMidiNote,
  isScaleObject,
  Scale,
  ScaleNote,
} from "types/Scale/ScaleTypes";
import { MidiValue } from "types/units";
import {
  getMidiNoteValue,
  getScaleNotes,
  getTonicPitchClass,
} from "types/Scale/ScaleFunctions";
import {
  getRotatedScale,
  getTransposedScale,
} from "types/Scale/ScaleTransformers";
import { Chords } from "presets/patterns";
import {
  isPatternMidiChord,
  PatternMidiNote,
} from "types/Pattern/PatternTypes";
import { SCALE_KEYSETS } from "presets/keys/Keysets";
import { getMidiChromaticNumber } from "./midi";
import { majorKeys } from "presets/keys/MajorKeys";
import { minorKeys } from "presets/keys/MinorKeys";

// ------------------------------------------------------------
// Key Helpers
// ------------------------------------------------------------

/** Get a modded version of a scale. */
export const getBaseScale = (notes: ScaleNote[]) => {
  return notes.map((n) =>
    isMidiNote(n) ? getMidiChromaticNumber(getMidiNoteValue(n)) : n
  );
};

/** Convert a scale to its canonical form */
export const getCanonicalScale = (notes: ScaleNote[]) => {
  return JSON.stringify(getBaseScale(notes));
};

/** Get the preferred key based on the tonic note and scale name */
export const getPreferredKey = (midi: MIDI, name?: string): Key => {
  if (!name) return ChromaticKey;
  const n = mod(midi, 12);
  const key = name.toLowerCase();

  // Check for major keys
  const majorNames = ["ionian", "major", "lydian", "mixolydian"];
  if (majorNames.some((n) => key.includes(n))) return majorKeys[n];

  // Check for minor keys
  const minorNames = ["minor", "dorian", "phrygian", "aeolian", "locrian"];
  if (minorNames.some((n) => key.includes(n))) return minorKeys[n];

  // Return chromatic by default
  return ChromaticKey;
};

// ------------------------------------------------------------
// Key Maps
// ------------------------------------------------------------

// The key map precomputes the key of a scale based on its notes
type KeyMapEntry = {
  key: Key;
  name?: string;
  inversion?: number;
};
const SCALE_KEY_MAP = new Map<string, KeyMapEntry>();
const PATTERN_KEY_MAP = new Map<string, KeyMapEntry>();

/* Add all preset scales to the key map */
for (const [scales, keys] of SCALE_KEYSETS) {
  for (let i = 0; i < 12; i++) {
    const notes = getScaleNotes(scales[i]);
    const size = notes.length;

    // Iterate over all modes
    for (let t = 0; t < size; t++) {
      const mode = getRotatedScale(notes, t);
      const canon = `${getCanonicalScale(mode)}`;
      const tonic = getTonicPitchClass(notes, keys[i]);
      const inversion = t > 0 ? ` (t${t})` : "";
      const name = `${tonic} ${scales[i].name}${inversion}`;

      // Add the scale (or mode if there is no scale yet)
      if (t === 0 || !SCALE_KEY_MAP.has(canon)) {
        SCALE_KEY_MAP.set(canon, { key: keys[i], name, inversion: t });
      }
    }
  }
}

/** Add all preset pattern chords to the key map */
for (const chord of Object.values(Chords).flat()) {
  const flatStream = chord.stream.flat();
  const chords = flatStream.filter(isPatternMidiChord) as PatternMidiNote[];
  const midi = chords.map((n) => mod(getMidiNoteValue(n), 12));
  const size = midi.length;

  // Iterate over all transpositions
  for (let i = 0; i < 12; i++) {
    const transposition = getTransposedScale(midi, i);

    // Iterate over all modes of all transpositions
    for (let t = 0; t < size; t++) {
      const mode = getRotatedScale(transposition, t);
      const canon = getCanonicalScale(mode);
      const key = getPreferredKey(transposition[0], chord.name);
      const tonic = getTonicPitchClass(transposition, key);
      const inversion = t > 0 ? ` (t${t})` : "";
      const name = `${tonic} ${chord.name}${inversion}`;

      // Add the pattern if there are no entries yet
      const isScale = SCALE_KEY_MAP.has(canon);
      const isPattern = PATTERN_KEY_MAP.has(canon);
      if (!isScale && (t === 0 || !isPattern)) {
        PATTERN_KEY_MAP.set(canon, { key, name, inversion: t });
      }
    }
  }
}

// ------------------------------------------------------------
// Scale Name and Key
// ------------------------------------------------------------

const KEY_MAP = new Map<string, KeyMapEntry>([
  ...PATTERN_KEY_MAP.entries(),
  ...SCALE_KEY_MAP.entries(),
]);

/** Get the name of a scale by looking it up in the key map. */
export const getScaleName = (scale?: Scale) => {
  const notes = getScaleNotes(scale) as MidiValue[];
  if (!notes.length) return "Empty Scale";

  // Return the scale name if it exists and the scale is not in a track
  if (isScaleObject(scale) && scale.name && scale.scaleTrackId) {
    return scale.name;
  }

  // Otherwise, try to find a matching preset scale
  const canon = getCanonicalScale(notes);
  if (canon === getCanonicalScale(chromaticNotes)) return "Chromatic Scale";
  return KEY_MAP.get(canon)?.name || getCanonicalScale(notes);
};

/** Get the key of a scale by looking it up in the key map. */
export const getScaleKey = (scale?: Scale): Key => {
  const notes = getScaleNotes(scale);
  const canon = getCanonicalScale(notes);
  return KEY_MAP.get(canon)?.key || ChromaticKey;
};
