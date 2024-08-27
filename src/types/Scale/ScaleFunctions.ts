import { Key, PitchClass } from "types/units";
import {
  PresetScaleGroupList,
  PresetScaleGroupMap,
  PresetScaleList,
} from "presets/scales";
import { getMidiOctaveDistance, getMidiPitchClass } from "utils/midi";
import { TRACK_SCALE_NAME } from "utils/constants";
import { Chords } from "presets/patterns";
import { getMidiStreamScale } from "types/Pattern/PatternUtils";
import { PatternMidiStream } from "types/Pattern/PatternTypes";
import {
  areScalesRelated,
  areScalesEqual,
  areScalesModes,
  isChromaticScale,
} from "./ScaleUtils";
import {
  MidiNote,
  ScaleNote,
  isNestedNote,
  ScaleArray,
  isMidiNote,
  isMidiValue,
  MidiValue,
  chromaticNotes,
  isScaleArray,
  isScale,
  isScaleObject,
  ScaleChain,
  Scale,
} from "./ScaleTypes";
import { resolveScaleToMidi, resolveScaleChainToMidi } from "./ScaleResolvers";
import {
  getRotatedScale,
  getScaleWithNewNotes,
  getTransposedScale,
} from "./ScaleTransformers";
import { ChromaticKey, getPreferredKey } from "presets/keys";
import { mod } from "utils/math";

// ------------------------------------------------------------
// Scale Aggregate Functions
// ------------------------------------------------------------

/** Get a `Scale` as an array of notes. */
export const getScaleNotes = (scale?: Scale): ScaleArray => {
  if (!scale) return [];
  return isScaleArray(scale) ? scale : scale.notes ?? [];
};

/** Get a `Scale` as a list of pitch classes. */
export const getScalePitchClasses = (scale: Scale): Key => {
  const notes = getScaleNotes(scale);
  return notes.map((note) => getScaleNotePitchClass(note));
};

/** Gets the tonic note as a pitch class. */
export const getTonicPitchClass = (
  notes: ScaleArray,
  key: Key = ChromaticKey
): PitchClass => {
  return getScaleNotePitchClass(notes[0], key);
};

/** Convert the notes of a scale to degrees of a scale chain. */
export const getParentAsNewScale = (chain: ScaleChain, scale?: Scale) => {
  const midiChain = resolveScaleChainToMidi(chain);
  if (!scale) return midiChain ?? chromaticNotes;

  // Get the notes of the scale and the parent chain
  const notes = resolveScaleToMidi(scale).map((n) => n % 12);
  const baseParent = midiChain.length ? midiChain : chromaticNotes;

  // Get the offset based on the distance to the parent tonic
  const parentTonic = baseParent[0];
  const givenTonic = notes[0];
  const tonicOffset = parentTonic - givenTonic;
  const parent = baseParent.map((n) => (n - tonicOffset) % 12);

  // Get the degrees of the notes
  return notes
    .map((note) => {
      const midi = getMidiNoteValue(note);
      const degree = parent.findIndex((n) => n === midi);
      if (degree === -1) return undefined;
      const octave = getMidiOctaveDistance(parent[degree], midi);
      return { degree, offset: { octave } };
    })
    .filter(Boolean) as ScaleArray;
};

// ------------------------------------------------------------
// Scale Note Properties and Functions
// ------------------------------------------------------------

/** Get a `MidiNote` as a number. */
export const getMidiNoteValue = (note?: MidiNote) => {
  if (!isMidiNote(note)) return 0;
  return isMidiValue(note) ? note : note.MIDI ?? 0;
};

/** Get the degree of a `ScaleNote` or chromatic number */
export const getScaleNoteDegree = (note?: ScaleNote) => {
  if (!note) return -1;
  if (isNestedNote(note)) return note.degree;
  return getMidiNoteValue(note) % 12;
};

/** Get the octave offset of a `ScaleNote` relative to MIDI = 60. */
export const getScaleNoteOctave = (note?: ScaleNote) => {
  if (!note) return 0;
  if (isNestedNote(note)) return note.offset?.octave ?? 0;
  return Math.floor((getMidiNoteValue(note) - 60) / 12);
};

/** Get a `ScaleNote` as a `MidiValue`, assuming the chromatic scale as a parent. */
export const getScaleNoteMidiValue = (note?: ScaleNote): MidiValue => {
  if (!note) return 0;
  if (isMidiNote(note)) return getMidiNoteValue(note);
  const { degree, offset } = note;
  const chromatic = offset?.chromatic || 0;
  const octave = offset?.octave || 0;
  return chromaticNotes[degree] + chromatic + octave * 12;
};

/** Get a `ScaleNote` as a pitch class (e.g. C#) */
export const getScaleNotePitchClass = (
  note: ScaleNote,
  key: Key = ChromaticKey
): PitchClass => {
  const midi = getScaleNoteMidiValue(note);
  return getMidiPitchClass(midi, key);
};

// ------------------------------------------------------------
// Scale Name and Category
// ------------------------------------------------------------

/** Gets the name of a scale by matching it to presets. */
export const getScaleName = (scale?: Scale, midiScale?: MidiValue[]) => {
  if (!scale) return "No Scale";
  if (midiScale === undefined && getScaleNotes(scale).every(isMidiValue)) {
    midiScale = getScaleNotes(scale) as MidiValue[];
  }

  // Return "Empty Scale" if the scale is empty
  const scaleNotes = getScaleNotes(scale);
  if (!scaleNotes.length) return "Empty Scale";
  if (scaleNotes.length === 1) return `MIDI = ${scaleNotes[0]}`;

  // Return the scale name if it exists and is not equal to the track name
  if (isScaleObject(scale) && scale.name && scale.name !== TRACK_SCALE_NAME) {
    return scale.name;
  }

  // Try to find a matching preset scale
  const matchingScaleName = getMatchingPresetScaleName(midiScale);
  if (matchingScaleName) return matchingScaleName;

  // Otherwise, try to find a matching pattern stream
  const matchingPatternName = getMatchingPatternScaleName(midiScale);
  if (matchingPatternName) return matchingPatternName;

  // Return "Custom Scale" if no matches are found
  return "Custom Scale";
};

/** Get the name of a scale by matching it to a preset scale. */
export const getMatchingPresetScaleName = (midi?: MidiValue[]) => {
  if (!midi) return;

  // Try to find a matching preset scale
  const matchingScale = PresetScaleList.find((s) => areScalesRelated(s, midi));

  // Return the scale name if it exists
  if (matchingScale) {
    const name = matchingScale.name;
    const key = getPreferredKey(midi[0], name);
    const tonic = getTonicPitchClass(midi, key);
    return isChromaticScale(matchingScale) ? name : `${tonic} ${name}`;
  }
};

/** Get the name of a scale by matching it to a preset pattern stream. */
export const getMatchingPatternScaleName = (midi?: MidiValue[]) => {
  if (!midi) return;
  const patterns = Object.values(Chords).flat();

  let relatedChamp: string | undefined;
  let modalChamp: string | undefined;

  // Iterate through each preset pattern's intrinsic scale
  for (let i = 0; i < patterns.length; i++) {
    const preset = patterns[i];
    const patternMidi = getMidiStreamScale(preset.stream as PatternMidiStream);
    const key = getPreferredKey(midi[0], preset.name);

    // Check if the pattern's scale is completely equal
    if (areScalesEqual(patternMidi, midi)) {
      const tonic = getTonicPitchClass(patternMidi, key);
      return `${tonic} ${preset.name}`;
    }

    // Check if the pattern's scale is transpositionally related
    if (areScalesRelated(patternMidi, midi)) {
      const tonic = getScaleNotePitchClass(midi[0], key);
      relatedChamp = `${tonic} ${preset.name}`;
    }

    // Check if each transposition of the pattern is a mode of the scale
    for (let i = 0; i < 12; i++) {
      const transposedScale = getTransposedScale(patternMidi, i);
      if (areScalesModes(transposedScale, midi)) {
        const index = transposedScale.findIndex((n) => n % 12 === midi[0] % 12);
        const key = getPreferredKey(transposedScale[0], preset.name);
        const firstPatternPitch = getTonicPitchClass(transposedScale, key);
        const inversion = index === 0 ? "" : ` (t${index})`;
        modalChamp = `${firstPatternPitch} ${preset.name}${inversion}`;
      }
    }
  }
  return relatedChamp || modalChamp;
};

/** Gets the category of a preset scale matching the given scale. */
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
