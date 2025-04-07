import {
  getScaleNotes,
  getScalePitchClasses,
  getScaleNoteMidiValue,
} from "./ScaleFunctions";
import { Scale } from "./ScaleTypes";
import { isEqual } from "lodash";
import { mod } from "utils/math";

// ------------------------------------------------------------
// Equality Checks
// ------------------------------------------------------------

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
