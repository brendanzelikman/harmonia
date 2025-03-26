import {
  getScaleNotes,
  getScalePitchClasses,
  getScaleNoteMidiValue,
  getScaleNoteDegree,
  getScaleNoteOctave,
} from "./ScaleFunctions";
import { isMidiInScale, MidiScale, MidiValue } from "utils/midi";
import { getRotatedScale } from "types/Scale/ScaleTransformers";
import { chromaticScale, NestedNote, Scale, ScaleArray } from "./ScaleTypes";
import { isEqual } from "lodash";
import { mod } from "utils/math";
import { getClosestPitchClass } from "utils/pitchClass";

// ------------------------------------------------------------
// Scale Sorters
// ------------------------------------------------------------

/** Sort a `ScaleArray` by degree. */
export const sortScaleNotesByDegree = (notes: ScaleArray) => {
  return notes.sort((a, b) => getScaleNoteDegree(a) - getScaleNoteDegree(b));
};

// ------------------------------------------------------------
// Scale Degrees
// ------------------------------------------------------------

/** Get the closest scale degree based on a given MIDI number */
export const getClosestScaleDegree = (scale: MidiScale, note: MidiValue) => {
  if (!isMidiInScale(note, scale)) return -1;
  const parentKey = getScalePitchClasses(scale);
  const closestPitch = getClosestPitchClass(scale, note);
  const degree = parentKey.findIndex((pitch) => pitch === closestPitch);
  return degree;
};

/** Get the closest nested note for the given scale based on the parent. */
export const getClosestNestedNote = (
  scale: MidiScale,
  note: MidiValue,
  parent: MidiScale
): NestedNote => {
  const degree = getClosestScaleDegree(parent, note);
  let octave = Math.floor((note - parent[degree]) / 12);
  const nestedNote = { degree, offset: { octave } };

  // Get the lowest and highest note in the scale
  const low = scale.at(0);
  const high = scale.at(-1);
  if (low === undefined || high === undefined) return nestedNote;

  // Get the lowest and highest degrees in the scale
  const lowDegree = getScaleNoteDegree(low);
  const highDegree = getScaleNoteDegree(high);
  if (lowDegree < 0 || highDegree < 0) return nestedNote;

  // Check if the scale currently does or will overshoot an octave
  const overshoots =
    Math.abs(high - low) > 11 ||
    Math.abs(note - low) > 11 ||
    Math.abs(high - note) > 11;

  // If the scale overshoots an octave, adjust the offset and try to stay in range
  if (overshoots && !!scale.length) {
    // If the note is higher than the scale, adjust the offset to be higher
    // only if the degree is less than the lowest degree in the scale
    if (note - low > 11) {
      octave = getScaleNoteOctave(low) + (degree < lowDegree ? 1 : 0);
    }

    // If the note is lower than the scale, adjust the offset to be lower
    // only if the degree is greater than the highest degree in the scale
    else if (high - note > 11) {
      octave = getScaleNoteOctave(high) + (degree > highDegree ? -1 : 0);
    }
  }

  return { ...nestedNote, offset: { octave } };
};
// ------------------------------------------------------------
// Equality Checks
// ------------------------------------------------------------

/** Returns true if a scale is chromatic. */
export const isChromaticScale = (scale?: Scale) => {
  return areScalesEqual(scale, chromaticScale);
};

/** Returns true if both objects have equivalent keys. */
export const areScalesEqual = (obj1?: Scale, obj2?: Scale) => {
  if (!obj1 || !obj2) return false;
  const key1 = getScalePitchClasses(obj1);
  const key2 = getScalePitchClasses(obj2);
  return isEqual(key1, key2);
};

/** Returns true if both objects are `Scales` related by transposition  */
export const areScalesRelated = (obj1?: Scale, obj2?: Scale) => {
  if (!obj1 || !obj2) return false;
  if (areScalesEqual(obj1, obj2)) return true;

  // Unpack the scales
  const scale1Notes = getScaleNotes(obj1);
  const scale2Notes = getScaleNotes(obj2);
  if (scale1Notes.length !== scale2Notes.length) return false;

  // Get the tonics of the two scales
  const scale1Tonic = scale1Notes[0];
  const scale2Tonic = scale2Notes[0];
  if (scale1Tonic === undefined || scale2Tonic === undefined) return false;

  // Get the distance between the two tonics
  const midi1 = getScaleNoteMidiValue(scale1Tonic);
  const midi2 = getScaleNoteMidiValue(scale2Tonic);
  const offset = midi2 - midi1;

  // Return true if the distance between all notes is the same in both scales
  return scale1Notes.every((note, i) => {
    const thisMidi = getScaleNoteMidiValue(note);
    const thatMidi = getScaleNoteMidiValue(scale2Notes[i]);
    return mod(thatMidi - thisMidi, 12) === mod(offset, 12);
  });
};

/** Returns true if both objects are `Scales` related by mode. */
export const areScalesModes = (obj1?: Scale, obj2?: Scale) => {
  if (!obj1 || !obj2) return false;
  if (areScalesEqual(obj1, obj2)) return true;

  // Unpack the scales
  const scale1Notes = getScaleNotes(obj1);
  const scale2Notes = getScaleNotes(obj2);
  if (scale1Notes.length !== scale2Notes.length) return false;

  // Return true if some rotation of the first scale is equal to the second scale
  return scale1Notes.some((_, i) => {
    const mode = getRotatedScale(obj1, i);
    return areScalesEqual(mode, obj2);
  });
};
