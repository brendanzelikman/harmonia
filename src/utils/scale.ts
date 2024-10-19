import { ChromaticKey } from "assets/keys";
import { Key } from "types/units";
import { MidiNote, MidiScale } from "./midi";
import {
  chromaticNotes,
  isMidiNote,
  isScale,
  isScaleObject,
  Scale,
  ScaleNote,
} from "types/Scale/ScaleTypes";
import { getScaleNotes, getTonicPitchClass } from "types/Scale/ScaleFunctions";
import { getMidiNoteValue } from "./midi";
import {
  getRotatedScale,
  getTransposedScale,
} from "types/Scale/ScaleTransformers";
import {
  isPatternMidiChord,
  PatternMidiNote,
} from "types/Pattern/PatternTypes";
import { SCALE_KEYSETS } from "assets/keys/Keysets";
import { getMidiDegree } from "./midi";
import { majorKeys } from "assets/keys/MajorKeys";
import { minorKeys } from "assets/keys/MinorKeys";
import { PresetScaleGroupList, PresetScaleGroupMap } from "assets/scales";
import { areScalesRelated } from "types/Scale/ScaleUtils";
import { PatternChords } from "types/Pattern/PatternUtils";

// ------------------------------------------------------------
// Scale Helpers
// ------------------------------------------------------------

/** Get the base values of a scale from 0 to 11. */
export const getBaseScale = (notes: ScaleNote[]) => {
  return notes.map((n) => (isMidiNote(n) ? getMidiDegree(n) : n));
};

/** Convert a scale to its canonical form */
export const getCanonicalScale = (notes: ScaleNote[]) => {
  return getBaseScale(notes).join(",");
};

/** Get the preferred key for a note based on the given scale name */
export const getPreferredKey = (note: MidiNote, name?: string): Key => {
  if (name === undefined) return ChromaticKey;
  const n = getMidiDegree(note);
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
for (const chord of PatternChords) {
  const flatStream = chord.stream.flat();
  const chords = flatStream.filter(isPatternMidiChord) as PatternMidiNote[];
  const midi = chords.map(getMidiDegree);
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

// Merge the scales and patterns into a single key map
const KEY_MAP = new Map<string, KeyMapEntry>([
  ...PATTERN_KEY_MAP.entries(),
  ...SCALE_KEY_MAP.entries(),
]);

// ------------------------------------------------------------
// Scale Properties
// ------------------------------------------------------------

/** Get the name of a scale by looking it up in the key map. */
export const getScaleName = (scale?: Scale) => {
  const notes = getScaleNotes(scale) as MidiScale;
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

/** Get the category of a scale based on the presets. */
export const getScaleCategory = (scale?: Scale) => {
  if (!isScale(scale)) return "No Category";

  // Try to find a matching preset scale in each group
  for (const group of PresetScaleGroupList) {
    const scales = PresetScaleGroupMap[group];

    // Return the group if the scale is related to any of the scales
    if (scales.some((m) => areScalesRelated(m, scale))) {
      return group;
    }
  }

  // Return "Custom Scales" if no matches are found
  return "Custom Scales";
};
