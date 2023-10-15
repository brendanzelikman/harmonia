import { Note, Pitch } from "types/units";
import { MIDI } from "../midi";
import {
  PresetScaleGroupList,
  PresetScaleGroupMap,
  PresetScaleList,
} from "presets/scales";
import {
  Scale,
  isScale,
  isScaleArray,
  isScaleObject,
  NestedScale,
  chromaticNotes,
  isNestedScaleArray,
  isNestedScale,
  ScaleArray,
  isNestedNote,
  NestedNote,
  chromaticScale,
  nestedChromaticScale,
  ScaleTrackScaleName,
} from "./ScaleTypes";
import { mod } from "utils";

import {
  Transposition,
  getChordalOffset,
  getChromaticOffset,
} from "types/Transposition";
import { isEqual } from "lodash";

/**
 * Get the unique tag of a given `Scale`.
 * @param scale Optional. The `Scale` object.
 * @returns Unique tag string.
 */
export const getScaleTag = (scale: Partial<Scale>) => {
  if (Array.isArray(scale) || isScaleArray(scale)) return scale.join(",");
  const { id, name, notes } = scale;
  return `${id}@${name}@${notes?.join(",")}`;
};

/**
 * Get the unique tag of a given `NestedScale`.
 * @param scale Optional. The `NestedScale` object.
 * @returns Unique tag string.
 */
export const getNestedScaleTag = (scale: Partial<NestedScale>) => {
  if (Array.isArray(scale) || isNestedScaleArray(scale)) return scale.join(",");
  const { id, name, notes } = scale;
  const noteTag = notes ? notes.map(getNestedNoteTag).join(",") : "";
  return `${id}@${name}@${noteTag}`;
};

/**
 * Get the unique tag of a given NestedNote.
 * @param note Optional. The NestedNote object.
 * @returns Unique tag string.
 */
export const getNestedNoteTag = (note: Partial<NestedNote>) => {
  const { degree, offset } = note;
  return `${degree}@${offset}`;
};

/**
 * Unpacks the notes of a `Scale`.
 * @param scale The `Scale` to unpack.
 * @returns An array of MIDI notes. If the `Scale` is invalid, return an empty array.
 */
export const getScaleNotes = (scale?: Scale): ScaleArray => {
  if (isScaleArray(scale)) return [...scale];
  if (isScaleObject(scale)) return [...scale.notes];
  return [];
};

/**
 * Unpacks the notes of a `NestedScale`.
 * @param scale The `NestedScale` to unpack.
 * @returns An array of `NestedNotes`. If the `NestedScale` is invalid, return an empty array.
 */
export const getNestedScaleNotes = (scale?: NestedScale): NestedNote[] => {
  if (isNestedScaleArray(scale)) return [...scale];
  if (isNestedScale(scale)) return [...scale.notes];
  return [];
};

/**
 * Resolves the notes of a `NestedScale` by applying the chromatic scale
 * @param scale The `NestedScale` to extract.
 * @returns An array of MIDI notes. If the `NestedScale` is invalid, return an empty array.
 */
export const resolveNestedScale = (scale: NestedScale): ScaleArray => {
  const notes = getNestedScaleNotes(scale);
  return notes.map(({ degree, offset }) => chromaticNotes[degree] + offset);
};

/**
 * Applies a `NestedNote` to a `NestedScale` to get another `NestedNote`.
 * @param scale The `NestedScale` to apply the `NestedNote` to.
 * @param note Optional. The `NestedNote` to apply.
 * @returns A `NestedNote`. If the `NestedScale` or `NestedNote` is invalid, return an empty array.
 */
export const applyNestedNote = (
  scale: NestedScale,
  note?: NestedNote
): NestedNote => {
  if (!isNestedScale(scale) || !isNestedNote) return { degree: 0, offset: 0 };
  const notes = getNestedScaleNotes(scale);
  const { degree, offset } = note || { degree: 0, offset: 0 };
  const appliedNote = notes[degree];
  if (!appliedNote) return { degree, offset };
  return { degree: appliedNote.degree, offset: appliedNote.offset + offset };
};

/**
 * Maps a MIDI note to a corresponding NestedNote within the chromatic scale.
 * @param Note The MIDI note.
 * @returns The mapped NestedNote.
 * */
export const mapNestedNote = (note: Note): NestedNote => {
  // Get the pitch class of the note
  const pitch = MIDI.toPitchClass(note);
  const chromaticNotes = getScaleNotes(chromaticScale);
  const chromaticPitches = chromaticNotes.map((n) => MIDI.toPitchClass(n));

  // Get the degree and offset of the note
  const degree = chromaticPitches.indexOf(pitch);
  if (degree < 0) return { degree: 0, offset: 0 };
  const offset = MIDI.OctaveDistance(chromaticNotes[degree], note) * 12;

  // Return the scale track note
  return { degree, offset };
};

/**
 * Uses a Scale to map a ScaleTrackNote to a corresponding MIDI note.
 * @param scale - The array of notes.
 * @param trackNote - Optional. The ScaleTrackNote. If undefined, return the root note of the scale.
 * @returns The mapped MIDI note.
 */
export const getNestedNoteAsMidi = (
  scale: Scale,
  trackNote?: NestedNote
): Note => {
  const notes = getScaleNotes(scale);
  return notes[trackNote?.degree || 0] + (trackNote?.offset || 0);
};

/**
 * Realizes the notes of the last `NestedScale` within the array provided,
 * using precedent `NestedScale`s as parents.
 * @param scaleOrArray The `NestedScale` or `NestedScale`s to unpack.
 * @returns An array of MIDI notes. If the `NestedScale` is invalid, return an empty array.
 */

export const realizeNestedScaleNotes = (
  scaleOrArray: NestedScale | NestedScale[]
): ScaleArray => {
  // If a single scale is provided, return the resolved scale notes
  if (isNestedScale(scaleOrArray)) {
    return resolveNestedScale(scaleOrArray);
  }

  // Otherwise, spread the array into a new set of scales
  const scales = [...scaleOrArray];
  const scaleCount = scales.length;
  if (scaleCount === 0) return [];

  // Get the last scale
  let scale = scales.pop();
  if (!scale) return [];

  // Keep chaining the scales until there are no more
  while (scales.length) {
    const parent = scales.pop();
    if (!parent) break;

    // Unpack the scale notes
    const notes = getNestedScaleNotes(scale);

    // Map the scale notes to the parent
    scale = notes.map((note) => applyNestedNote(parent, note));
  }

  // Return the notes of the last scale applied to the chromatic scale
  return resolveNestedScale(scale);
};

/**
 * Gets the scale as a list of pitch classes.
 * @param scale The Scale to convert.
 * @returns An array of pitch classes. If the Scale is invalid, return an empty array.
 */
export const getScalePitchClasses = (scale: Scale) => {
  if (!isScale(scale)) return [];
  const notes = getScaleNotes(scale);
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
  const scaleNotes = getScaleNotes(scale);
  if (!scaleNotes.length) return "Empty Scale";

  // Return the scale name if it exists and is not equal to the track name
  if (isScaleObject(scale)) {
    if (scale.name && scale.name !== ScaleTrackScaleName) return scale.name;
  }

  // Find the matching preset scales
  const matchingScale = PresetScaleList.find((s) => areScalesRelated(s, scale));

  // Get the name of the scale from the matching scale, NOT the underlying scale
  const firstScaleNote = scaleNotes?.[0];
  const firstPitch = firstScaleNote ? MIDI.toPitchClass(firstScaleNote) : "";

  // Construct the scale name with the first pitch and matching scale name
  const scaleName = matchingScale
    ? isEqual(matchingScale, chromaticScale)
      ? matchingScale.name
      : `${!!firstPitch ? `${firstPitch}` : ""} ${matchingScale.name}`
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
  const notes = getScaleNotes(scale);
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
  const notes = getScaleNotes(scale);
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

/**
 * Offset the `NestedScale` using the given chromatic offset.
 * @param scale The NestedScale.
 * @param offset The offset to transpose the nested scale by.
 * @returns The chromatically transposed `NestedScale`.
 */
export const getOffsettedNestedScale = (scale: NestedScale, offset = 0) => {
  // Avoid unnecessary work
  if (offset === 0) return scale;

  // Offset the scale
  const notes = getNestedScaleNotes(scale);
  const offsetedNotes = notes.map((n) => ({ ...n, offset: n.offset + offset }));

  // Return the offseted scale
  if (isNestedScaleArray(scale)) return offsetedNotes;
  return { ...scale, notes: offsetedNotes };
};

/**
 * Rotate the `NestedScale` using the given chordal offset.
 * @param scale The NestedScale.
 * @param offset The offset to rotate the nested scale by.
 * @returns The chordally transposed `NestedScale`.
 */
export const getRotatedNestedScale = (scale: NestedScale, offset = 0) => {
  // Avoid unnecessary work
  if (offset === 0) return scale;

  // Unpack the scale
  const notes = getNestedScaleNotes(scale);
  const modulus = notes.length;

  // Rotate the track scale
  const rotatedScale = notes.map((note, i) => {
    // Get the new degree
    const summedIndex = i + offset;
    const newIndex = mod(summedIndex, modulus);
    const newDegree = notes[newIndex].degree;

    // Get the new offset
    const octaveWrap = notes[newIndex].degree < note.degree ? 1 : 0;
    const octaveDistance = octaveWrap + Math.floor(offset / modulus);
    const newOffset = note.offset + octaveDistance * 12;

    // Return the new note
    return { degree: newDegree, offset: newOffset } as NestedNote;
  });

  // Return the transposed track scale
  if (isNestedScaleArray(scale)) return rotatedScale;
  return { ...scale, notes: rotatedScale };
};

/**
 * Transpose the `NestedScale` using the given scalar offset and parent scale.
 * @param scale The `NestedScale`.
 * @param offset The offset to transpose the nested scale by.
 * @param parent The parent `NestedScale` to use for transposition.
 * @returns The scalarly transposed `NestedScale`.
 */
export const getTransposedNestedScale = (
  scale: NestedScale,
  offset: number,
  parent: NestedScale
) => {
  // Avoid unnecessary work
  if (offset === 0) return scale;

  // Get the notes of the scale and its parent
  const scaleNotes = getNestedScaleNotes(scale);
  const parentNotes = getNestedScaleNotes(parent);

  // Transpose the track scale along the parent scale
  const modulus = parentNotes.length;
  const transposedScale = scaleNotes.map((note) => {
    // Get the new degree
    const summedDegree = note.degree + offset;
    const newDegree = mod(summedDegree, modulus);

    // Get the new offset
    const octaveDistance = Math.floor(summedDegree / modulus);
    const newOffset = note.offset + octaveDistance * 12;

    // Return the new note
    return { degree: newDegree, offset: newOffset } as NestedNote;
  });

  // Return the transposed track scale
  if (isNestedScaleArray(scale)) return transposedScale;
  return { ...scale, notes: transposedScale };
};

/**
 * Gets the transposed `NestedScale` with chromatic and chordal offsets applied.
 * @param scale The NestedScale to transpose.
 * @param transposition The Transposition to apply.
 * @returns A transposed and rotated `NestedScale`.
 */
export const applyTranspositionToNestedScale = (
  scale?: NestedScale,
  transposition?: Transposition
): NestedScale => {
  if (!scale) return nestedChromaticScale;
  if (!transposition) return scale;
  const { offsets } = transposition;

  // Transpose the track scale chromatically
  const N = getChromaticOffset(offsets);
  const s1 = getOffsettedNestedScale(scale, N);

  // Transpose the track scale chordally
  const t = getChordalOffset(offsets);
  const s2 = getRotatedNestedScale(s1, t);

  // Return the transposed scale
  const transposedTrackScale = s2;
  return transposedTrackScale;
};

/**
 * Returns true if two `Scales` are exactly equal.
 * @param scale1 The first scale.
 * @param scale2 The second scale.
 * @returns True if the two `Scales` are equal, otherwise false.
 */
export const areScalesEqual = (scale1: Scale, scale2: Scale) => {
  if (!isScale(scale1) || !isScale(scale2)) return false;

  // Unpack the scales
  const scale1Notes = getScaleNotes(scale1);
  const scale2Notes = getScaleNotes(scale2);

  // Return false if the scales are different lengths
  if (scale1Notes.length !== scale2Notes.length) return false;

  // Return true if the chromatic number of notes is the same in both scales
  return scale1Notes.every(
    (_, i) => mod(scale1Notes[i], 12) === mod(scale2Notes[i], 12)
  );
};

/**
 * Returns true if two `Scales` are related by transposition.
 * @param scale1 The first scale.
 * @param scale2 The second scale.
 * @returns True if the two `Scales` are related, otherwise false.
 */
export const areScalesRelated = (scale1: Scale, scale2: Scale) => {
  if (!isScale(scale1) || !isScale(scale2)) return false;

  // Unpack the scales
  const scale1Notes = getScaleNotes(scale1);
  const scale2Notes = getScaleNotes(scale2);

  // Return false if the scales are different lengths
  if (scale1Notes.length !== scale2Notes.length) return false;

  // Get the tonics of the two scales
  const scale1Tonic = scale1Notes[0];
  const scale2Tonic = scale2Notes[0];
  if (scale1Tonic === undefined || scale2Tonic === undefined) return false;

  // Get the distance between the two tonics
  const offset = scale2Tonic - scale1Tonic;

  // Return true if the distance between all notes is the same in both scales
  return scale1Notes.every(
    (_, i) => scale1Notes[i] + offset === scale2Notes[i]
  );
};

/**
 * Returns true if the two `Scales` are related by rotation.
 * @param scale1 The first scale.
 * @param scale2 The second scale.
 * @returns True if the two `Scales` are related, otherwise false.
 */
export const areScalesModes = (scale1: Scale, scale2: Scale) => {
  if (!isScale(scale1) || !isScale(scale2)) return false;

  // Unpack the scales
  const scale1Notes = getScaleNotes(scale1);
  const scale2Notes = getScaleNotes(scale2);

  // Check the lengths of the scales
  if (scale1Notes.length !== scale2Notes.length) return false;

  // Return true if some rotation of the first scale is equal to the second scale
  return scale1Notes.some((_, i) => {
    const mode = getRotatedScale(scale1, i);
    return areScalesEqual(mode, scale2);
  });
};
