import { ERROR_TAG, Pitch } from "types/units";
import { MIDI } from "../midi";
import {
  PresetScaleGroupList,
  PresetScaleGroupMap,
  PresetScaleList,
} from "../../presets/scales";
import {
  Scale,
  TrackScaleName,
  areScalesRelated,
  isScale,
  isScaleArray,
  isScaleObject,
  unpackScale,
} from "./ScaleTypes";
import { mod } from "utils";

/**
 * Get the unique tag for a given Scale.
 * @param clip Optional. The Scale object.
 * @returns Unique tag string. If the Scale is invalid, return the error tag.
 */
export const getScaleTag = (scale: Partial<Scale>) => {
  if (!isScale(scale)) return ERROR_TAG;
  if (isScaleArray(scale)) return scale.join(",");
  const { id, name, notes } = scale;
  return `${id}@${name}@${notes.join(",")}`;
};

/**
 * Gets the scale as a list of pitch classes.
 * @param scale The Scale to convert.
 * @returns An array of pitch classes. If the Scale is invalid, return an empty array.
 */
export const getScalePitchClasses = (scale: Scale) => {
  if (!isScale(scale)) return [];
  const notes = unpackScale(scale);
  return notes.map((note) => MIDI.toPitchClass(note));
};

/**
 * Sorts the list of pitch classes by chromatic number.
 * @param pitches The pitches to sort.
 * @returns A sorted array of pitch classes.
 */
export const getSortedPitchClasses = (pitches: Pitch[]) => {
  return pitches.sort(
    (a, b) => MIDI.ChromaticNumber(a) - MIDI.ChromaticNumber(b)
  );
};

/**
 * Gets the name of a preset scale matching the given scale.
 * @param scale Optional. The scale to match.
 * @returns The name of the matching preset scale.
 */
export const getScaleName = (scale?: Scale) => {
  // Return "No Scale" if the scale is invalid
  if (!isScale(scale)) return "No Scale";

  // Return "Empty Scale" if the scale is empty
  const scaleNotes = unpackScale(scale);
  if (!scaleNotes.length) return "Empty Scale";

  // Return the scale name if it exists and is not equal to the track name
  if (isScaleObject(scale)) {
    if (scale.name && scale.name !== TrackScaleName) return scale.name;
  }

  // Find the matching preset scales
  const matchingScales = PresetScaleList.filter((p) =>
    areScalesRelated(scale, p)
  );
  const matchingScale = matchingScales.find((s) => areScalesRelated(s, scale));

  // Get the name of the scale from the matching scale, NOT the underlying scale
  const firstScaleNote = scaleNotes?.[0];
  const firstPitch = firstScaleNote ? MIDI.toPitchClass(firstScaleNote) : "";

  // Construct the scale name with the first pitch and matching scale name
  const scaleName = matchingScale
    ? `${!!firstPitch ? `${firstPitch}` : ""} ${matchingScale.name}`
    : "Custom Scale";

  // Return the scale name
  return scaleName;
};

/**
 * Gets the category of a preset scale matching the given scale.
 * @param scale Optional. The scale to match.
 * @returns The category of the matching preset scale.
 */
export const getScaleCategory = (scale?: Scale) => {
  if (!isScale(scale)) return "No Category";
  return (
    PresetScaleGroupList.find((c) => {
      return PresetScaleGroupMap[c].some((m) => areScalesRelated(m, scale));
    }) ?? "Custom Scales"
  );
};
/**
 * Gets the scale transposed by the given offset.
 * @param scale Optional. The Scale to transpose.
 * @param offset Optional. The offset to transpose by.
 * @returns The transposed Scale. If the Scale is invalid, return an empty array.
 */
export const getTransposedScale = (
  scale?: Scale,
  offset: number = 0
): Scale => {
  // Return an empty array if the scale is invalid
  if (!isScale(scale)) return [];

  // Avoid unecessary work
  if (offset === 0) return scale;

  // Unpack the scale
  const notes = unpackScale(scale);
  if (!notes.length) return scale;

  // Transpose the scale notes
  const transposedNotes = notes.map((note) => note + offset);

  // Return the transposed scale
  if (isScaleArray(scale)) return transposedNotes;
  return { ...scale, notes: transposedNotes };
};

/**
 * Gets the scale rotated by the given offset.
 * @param scale Optional. The Scale to rotate.
 * @param offset Optional. The offset to rotate by.
 * @returns The rotated Scale. If the Scale is invalid, return an empty array.
 */
export const getRotatedScale = (scale?: Scale, offset: number = 0): Scale => {
  // Return an empty array if the scale is invalid
  if (!isScale(scale)) return [];

  // Avoid unecessary work
  if (offset === 0) return scale;

  // Unpack the scale
  const notes = unpackScale(scale);
  if (!notes.length) return scale;

  // Initialize loop variables
  const length = Math.abs(offset);
  const step = offset > 0 ? 1 : -1;
  const modulus = notes.length;

  // Rotate the scale notes
  const rotatedNotes = notes.map((_, i) => {
    let newIndex = i;
    let offset = 0;

    // Apply the rotation sequentially
    for (let j = 0; j < length; j++) {
      // Compute the next index, adjusting offset if necessary
      const nextIndex = mod(newIndex + step, modulus);
      if (step > 0 && nextIndex <= newIndex) offset += 12;
      if (step < 0 && nextIndex >= newIndex) offset -= 12;
      newIndex = nextIndex;
    }
    // Return the rotated note
    return notes[newIndex] + offset;
  });

  // Return the rotated scale
  if (isScaleArray(scale)) return rotatedNotes;
  return { ...scale, notes: rotatedNotes };
};
