import * as _ from "./ScaleTypes";
import * as ScaleFunctions from "./ScaleFunctions";
import { Key, PitchClass } from "types/units";
import {
  PresetScaleGroupList,
  PresetScaleGroupMap,
  PresetScaleList,
  PresetScaleMap,
} from "presets/scales";
import {
  Transposition,
  getChordalOffset,
  getChromaticOffset,
} from "types/Transposition";
import { isEqual, isUndefined, range } from "lodash";
import { mod } from "utils/math";
import { getMidiPitchClass } from "utils/midi";
import { SCALE_TRACK_SCALE_NAME } from "utils/constants";
import { isScale } from "./ScaleTypes";
import { getValueByKey } from "utils/objects";

// ------------------------------------------------------------
// Scale Serializers
// ------------------------------------------------------------

/** Get a `MidiNote` as a string. */
export const getMidiNoteAsString = (note: _.MidiNote) => {
  if (_.isMidiValue(note)) return note.toString();
  return note.MIDI.toString();
};

/** Get a `NestedNote` as a string. */
export const getNestedNoteAsString = (note: _.NestedNote) => {
  return `${note.degree}@${JSON.stringify(note.offset)}@${note.scaleId}`;
};

/** Get a `ScaleNote` as a string. */
export const getScaleNoteAsString = (note: _.ScaleNote) => {
  if (_.isMidiNote(note)) return getMidiNoteAsString(note);
  return getNestedNoteAsString(note);
};

/** Get a `ScaleArray` as a string. */
export const getScaleArrayAsString = (scale: _.ScaleArray) => {
  return scale.map(getScaleNoteAsString).join(",");
};

/** Get a `ScaleObject` as a string. */
export const getScaleObjectAsString = (scale: _.ScaleObject) => {
  return `${scale.id}@${scale.name}@${getScaleArrayAsString(scale.notes)}`;
};

/** Get a `Scale` as a string. */
export const getScaleAsString = (scale: _.Scale) => {
  if (_.isScaleArray(scale)) return getScaleArrayAsString(scale);
  return getScaleObjectAsString(scale);
};

/** Get a `ScaleUpdate` as a string. */
export const getScaleUpdateAsString = (scale: _.ScaleUpdate) => {
  return JSON.stringify(scale);
};

// ------------------------------------------------------------
// Scale Type Operations
// ------------------------------------------------------------

/** Sum a `MidiNote` with a number or array of numbers */
export const getTransposedMidiNote = (
  note: _.MidiNote,
  ...offsets: number[]
) => {
  const sum = offsets.flat().reduce((acc, cur) => acc + cur, 0);
  const value = getMidiNoteAsValue(note);
  const midi = value + sum;
  return _.isMidiObject(note) ? { ...note, MIDI: midi } : midi;
};

/** Sum an array of `ScaleVector`s together. */
export const sumScaleVectors = (offsets: (_.ScaleVector | undefined)[]) => {
  return offsets.reduce(
    (acc: _.ScaleVector, cur: _.ScaleVector | undefined) => {
      if (!cur) return acc;
      const keys = Object.keys(cur);
      keys.forEach((key) => {
        const value = cur[key];
        acc[key] = (acc[key] || 0) + value;
      });
      return acc;
    },
    {} as _.ScaleVector
  );
};

/** Get the degree of a `ScaleNote` */
export const getScaleNoteDegree = (note?: _.ScaleNote) => {
  if (!note) return 0;
  if (_.isNestedNote(note)) return note.degree;
  return getMidiNoteAsValue(note) % 12;
};

/** Get the octave offset of a `ScaleNote` */
export const getScaleNoteOctaveOffset = (note?: _.ScaleNote) => {
  if (!note) return 0;
  if (_.isNestedNote(note)) return note.offset?.octave || 0;
  return Math.floor((getMidiNoteAsValue(note) - 60) / 12);
};

// ------------------------------------------------------------
// Scale Type Conversions
// ------------------------------------------------------------

/** Get a `MidiNote` as a number. */
export const getMidiNoteAsValue = (note?: _.MidiNote) => {
  if (!_.isMidiNote(note)) return 0;
  return _.isMidiValue(note) ? note : note.MIDI;
};

/** Get a `MidiNote` as a `ScaleNote` (using the chromatic scale). */
export const getMidiNoteAsScaleNote = (note: _.MidiNote): _.ScaleNote => {
  const midi = getMidiNoteAsValue(note);
  const degree = mod(midi, 12);
  const octave = Math.floor((midi - 60) / 12);
  const offset = octave ? { octave } : undefined;
  return { degree, offset: offset };
};

/** Get a `ScaleNote` as a `MidiValue` (using the chromatic scale). */
export const getScaleNoteAsMidiValue = (note?: _.ScaleNote): _.MidiValue => {
  if (!note) return 0;
  if (_.isMidiNote(note)) return getMidiNoteAsValue(note);
  const { degree, offset } = note;
  const chromatic = offset?.chromatic || 0;
  const octave = offset?.octave || 0;
  return _.chromaticNotes[degree] + chromatic + octave * 12;
};

/** Get a `ScaleNote` as a pitch class (e.g. C#) */
export const getScaleNoteAsPitchClass = (note: _.ScaleNote): PitchClass => {
  const midi = getScaleNoteAsMidiValue(note);
  return getMidiPitchClass(midi);
};

/** Get a `Scale` as an array of notes. */
export const getScaleAsArray = (scale?: _.Scale): _.ScaleArray => {
  if (!scale) return [];
  return _.isScaleArray(scale) ? scale : scale.notes;
};

/** Get a `Scale` as a list of pitch classes. */
export const getScaleAsKey = (scale: _.Scale): Key => {
  const notes = getScaleAsArray(scale);
  return notes.map(getScaleNoteAsPitchClass);
};

// ------------------------------------------------------------
// Property Getters
// ------------------------------------------------------------

/** Gets the name of a preset scale matching the given scale. */
export const getScaleName = (scale?: _.Scale) => {
  // Return "No Scale" if the scale is invalid
  if (!_.isScale(scale)) return "No Scale";

  // Return "Empty Scale" if the scale is empty
  const scaleNotes = getScaleAsArray(scale);
  if (!scaleNotes.length) return "Empty Scale";

  // Return the scale name if it exists and is not equal to the track name
  if (_.isScaleObject(scale)) {
    if (scale.name && scale.name !== SCALE_TRACK_SCALE_NAME)
      return scale.name ?? "";
  }

  // Find the matching preset scales
  const matchingScale = PresetScaleList.find((s) =>
    ScaleFunctions.areScalesRelated(s, scale)
  );

  // Get the name of the scale from the matching scale, NOT the underlying scale
  const firstScaleNote = scaleNotes?.[0];
  const firstPitch = firstScaleNote
    ? getScaleNoteAsPitchClass(firstScaleNote)
    : "";

  // Construct the scale name with the first pitch and matching scale name
  const scaleName = matchingScale
    ? isEqual(matchingScale, _.chromaticScale)
      ? matchingScale.name
      : `${!!firstPitch ? `${firstPitch}` : ""} ${matchingScale.name}`
    : "Custom Scale";

  // Return the scale name
  return scaleName ?? "Custom Scale";
};

/** Gets the category of a preset scale matching the given scale. */
export const getScaleCategory = (scale?: _.Scale) => {
  if (!_.isScale(scale)) return "No Category";
  return (
    PresetScaleGroupList.find((c) => {
      return PresetScaleGroupMap[c].some((m) =>
        ScaleFunctions.areScalesRelated(m, scale)
      );
    }) ?? "Custom Scales"
  );
};

// ------------------------------------------------------------
// Scale Functions
// ------------------------------------------------------------

/** Create a list of scales in all 12 keys from a preset ID. */
export const createScalesInAllKeys = (scaleId: _.ScaleId) => {
  const scale = PresetScaleMap[scaleId];
  if (!scale) throw new Error(`Invalid scale id: ${scaleId}`);
  return new Array(12).fill(0).map((_, i) => getTransposedScale(scale, i));
};

/** Update a `Scale` with new notes. */
export const getUpdatedScale = <T extends _.Scale>(
  scale: T,
  notes: _.ScaleArray
): T => {
  if (_.isScaleArray(scale)) return notes as T;
  return { ...scale, notes };
};

/** Cycle a `ScaleNote` through a `Scale`, applying any relevant offsets. */
export const cycleNoteThroughScale = (
  note?: _.ScaleNote,
  scale?: _.Scale
): _.ScaleNote => {
  if (!note) return -1;
  if (!scale || _.isMidiNote(note)) return note;

  // Get the scale notes
  const notes = getScaleAsArray(scale);
  const modulus = notes.length;

  // Determine if there is an offset for the scale within the note
  const { degree, offset } = note;
  const hasOffset =
    !!offset &&
    _.isScaleObject(scale) &&
    (!isUndefined(offset?.[scale.id]) ||
      !isUndefined(getValueByKey(offset, note?.scaleId)));
  const scaleOffset = hasOffset ? offset?.[scale.id] : 0;

  // Get the parent note using the new degree
  let newDegree = degree + scaleOffset;
  let parentNote = notes[mod(newDegree, modulus)];
  if (!parentNote) return -1;

  // Adjust the octave displacement accordingly
  const octave = Math.floor(newDegree / modulus);

  // If the parent note is a MIDI note, add all displacements and return
  if (!_.isNestedNote(parentNote)) {
    const chromatic = offset?.chromatic ?? 0;
    const oldOctave = offset?.octave ?? 0;
    const midiOffset = chromatic + (oldOctave + octave) * 12;
    return getTransposedMidiNote(parentNote, midiOffset);
  }

  // If the parent note is a NestedNote, apply to the private displacement and return
  const newOffset = sumScaleVectors([
    note.offset,
    parentNote.offset,
    { octave },
  ]);
  return {
    ...parentNote,
    offset: newOffset,
  };
};

/** Chain a `ScaleNote` through the `Scales` provided, applying any relevant offsets. */
export const cycleNoteThroughScales = (
  note: _.ScaleNote,
  scales: _.Scale[]
): _.ScaleNote => {
  const scaleCount = scales.length;
  if (!scaleCount) return note;
  let chainedNote = note;
  for (let i = scaleCount - 1; i >= 0; i--) {
    const scale = scales[i];
    chainedNote = cycleNoteThroughScale(chainedNote, scale);
  }
  return chainedNote;
};

/** Resolve a `ScaleNote` to a `MidiNoteValue` using the `Scales` provided. */
export const resolveScaleNoteToMidi = (
  note: _.ScaleNote,
  scales: _.Scale[]
) => {
  const chainedNote = cycleNoteThroughScales(note, scales);
  return getScaleNoteAsMidiValue(chainedNote);
};

/** Resolve a `Scale` to an array of `MidiNoteValues`. */
export const resolveScaleToMidi = (scale?: _.Scale): _.MidiValue[] => {
  if (!scale) return [];
  const notes = getScaleAsArray(scale);
  return notes.map(getScaleNoteAsMidiValue);
};

/** Resolve a list of `Scales` to an array of `MidiNoteValues`, starting from the end. */
export const resolveScaleChainToMidi = (scales: _.Scale[]): _.MidiValue[] => {
  const allScales = [...scales];
  const scaleCount = allScales.length;
  if (scaleCount < 2) return resolveScaleToMidi(allScales[0]);

  // Get the last scale in the array
  let cur = allScales.pop();
  if (!cur) return [];

  // While there are parents, unpack the scale and apply offsets
  while (allScales.length) {
    const parent = allScales.pop();
    if (!parent) break;

    // Get a new scale by chaining the current notes through the parent
    const curNotes = getScaleAsArray(cur);
    cur = curNotes.map((note) => cycleNoteThroughScale(note, parent));
  }

  // Return the notes of the last scale applied to the chromatic scale
  return resolveScaleToMidi(cur);
};

/** Get a `Scale` tranposed by the given number of steps along the parent scale. */
export const getTransposedScale = <T extends _.Scale>(
  scale: T,
  steps = 0,
  parent?: _.Scale
): T => {
  if (steps === 0) return scale;

  // Get the notes of the scale and its parent
  const scaleNotes = getScaleAsArray(scale);
  const parentNotes = getScaleAsArray(parent);
  const modulus = parentNotes.length;

  // If no parent exists, just transpose the current scale chromatically
  // - If on a MIDI note, transpose by semitones
  // - Otherwise, chain the chromatic offset
  if (!parent || !modulus) {
    const transposedNotes = scaleNotes.map((note) => {
      if (_.isMidiNote(note)) return getTransposedMidiNote(note, steps);
      const offset = sumScaleVectors([note.offset, { chromatic: steps }]);
      return { ...note, offset };
    });
    return getUpdatedScale(scale, transposedNotes);
  }

  // Get the unique scale degrees that are available
  // - If the scale is its own parent, use a range of indices
  // - Otherwise, use the parent scale degrees
  const isParent = isEqual(scale, parent);
  const parentDegrees = parentNotes.map(getScaleNoteDegree);
  const degrees = [...new Set(isParent ? parentDegrees : range(modulus))];
  const degreeCount = degrees.length;

  // Iterate over the scale notes and transpose
  const transposedNotes = scaleNotes.map((note) => {
    // Find the index of the note within the available degrees
    const curIndex = degrees.findIndex((d) => d === getScaleNoteDegree(note));
    const summedIndex = curIndex + steps;
    const moddedIndex = mod(summedIndex, degreeCount);

    // Get the degree and octave of the new note
    const degree = degrees[moddedIndex];
    const octave = Math.floor(summedIndex / degreeCount);
    const parentNote = parentNotes[moddedIndex];

    // If the note and new note are both MIDI, return the new note
    if (_.isMidiNote(note) && _.isMidiNote(parentNote)) {
      return getTransposedMidiNote(parentNote, octave * 12);
    }

    // Otherwise, chain any old and new offsets to the new note
    const previousOffset = !_.isMidiNote(note) ? note.offset : {};
    const octaveOffset: _.ScaleVector = !!octave ? { octave } : {};
    const offset = sumScaleVectors([previousOffset, octaveOffset]);

    // Return the new note
    const hasOffsets = !!Object.keys(offset).length;
    return hasOffsets ? { degree, offset } : { degree };
  });

  // Return the transposed scale
  return getUpdatedScale(scale, transposedNotes);
};

/** Get a `Scale` rotated by a given number of steps along itself. */
export const getRotatedScale = <T extends _.Scale>(scale: T, steps = 0) => {
  return getTransposedScale(scale, steps, scale);
};

/** Get a `Scale` with chromatic and chordal offsets applied to it. */
export const getFullyTransposedScale = <T extends _.Scale>(
  scale?: T,
  transposition?: Transposition
): T => {
  if (!scale) return _.nestedChromaticScale as T;
  if (!transposition) return scale;
  const { vector } = transposition;

  // Transpose the track scale chromatically
  const N = getChromaticOffset(vector);
  const s1 = getTransposedScale(scale, N);

  // Transpose the track scale chordally
  const t = getChordalOffset(vector);
  const s2 = getRotatedScale(s1, t);

  // Return the transposed scale
  const transposedTrackScale = s2;
  return transposedTrackScale;
};

// ------------------------------------------------------------
// Scale Equality Checks
// ------------------------------------------------------------

/** Returns true if both objects are equivalent `Scales`. */
export const areScalesEqual = (obj1?: unknown, obj2?: unknown) => {
  if (!isScale(obj1) || !isScale(obj2)) return false;

  // Unpack the scales
  const scale1Notes = getScaleAsArray(obj1);
  const scale2Notes = getScaleAsArray(obj2);

  // Return false if the scales are different lengths
  if (scale1Notes.length !== scale2Notes.length) return false;

  // Return true if the scale keys are the same
  const key1 = getScaleAsKey(obj1);
  const key2 = getScaleAsKey(obj2);
  return isEqual(key1, key2);
};

/** Returns true if both objects are `Scales` related by transposition  */
export const areScalesRelated = (obj1?: unknown, obj2?: unknown) => {
  if (!isScale(obj1) || !isScale(obj2)) return false;

  // Unpack the scales
  const scale1Notes = getScaleAsArray(obj1);
  const scale2Notes = getScaleAsArray(obj2);

  // Return false if the scales are different lengths
  if (scale1Notes.length !== scale2Notes.length) return false;

  // Get the tonics of the two scales
  const scale1Tonic = scale1Notes[0];
  const scale2Tonic = scale2Notes[0];
  if (scale1Tonic === undefined || scale2Tonic === undefined) return false;

  // Get the distance between the two tonics
  const midi1 = getScaleNoteAsMidiValue(scale1Tonic);
  const midi2 = getScaleNoteAsMidiValue(scale2Tonic);
  const offset = midi2 - midi1;

  // Return true if the distance between all notes is the same in both scales
  return scale1Notes.every((note, i) => {
    const thisMidi = getScaleNoteAsMidiValue(note);
    const thatMidi = getScaleNoteAsMidiValue(scale2Notes[i]);
    return thatMidi - thisMidi === offset;
  });
};

/** Returns true if both objects are `Scales` related by mode. */
export const areScalesModes = (obj1?: unknown, obj2?: unknown) => {
  if (!isScale(obj1) || !isScale(obj2)) return false;

  // Unpack the scales
  const scale1Notes = getScaleAsArray(obj1);
  const scale2Notes = getScaleAsArray(obj2);

  // Check the lengths of the scales
  if (scale1Notes.length !== scale2Notes.length) return false;

  // Return true if some rotation of the first scale is equal to the second scale
  return scale1Notes.some((_, i) => {
    const mode = getRotatedScale(obj1, i);
    return areScalesEqual(mode, obj2);
  });
};
