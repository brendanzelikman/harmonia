import {
  isArray,
  isNumber,
  isObject,
  isPlainObject,
  isString,
  range,
} from "lodash";
import { Id, PitchClass } from "types/units";
import { MidiNote, MidiObject, MidiScale, MidiValue } from "utils/midi";
import { createId } from "types/util";
import { Dictionary, EntityState } from "@reduxjs/toolkit";
import { Vector } from "utils/vector";
import { TrackId } from "types/Track/TrackTypes";

// ------------------------------------------------------------
// Scale Generics
// ------------------------------------------------------------

export type ScaleId = Id<"scale">;
export type ScaleMap = Dictionary<ScaleObject>;
export type ScaleState = EntityState<ScaleObject>;

// ------------------------------------------------------------
// Scale Definitions
// ------------------------------------------------------------

/** A scalar vector can contain a transposition or voice leading. */
export type ScaleVector = Vector<ScaleVectorId>;
export type ScaleVectorId = "chromatic" | "octave" | PitchClass | ScaleId;

/** A `NestedNote` references a scale by degree. */
export type NestedNote = {
  degree: number;
  offset?: ScaleVector;
  scaleId?: ScaleId;
};

/** A `ScaleNote` is either a `MidiNote` or a `NestedNote`. */
export type ScaleNote = MidiNote | NestedNote;

/** A `ScaleNoteObject` is a `ScaleNote` that is an object. */
export type ScaleNoteObject = MidiObject | NestedNote;

/** A `ScaleArray` is an array of `ScaleNotes`. */
export type ScaleArray = ScaleNote[];

/** A `ScaleObject` is an object with an ID and array of notes. */
export type ScaleObject = {
  id: ScaleId;
  notes: ScaleArray;
  name?: string;
  aliases?: string[];
  trackId?: TrackId;
};

/** A `Scale` is either a `ScaleObject` or a `ScaleArray`. */
export type Scale = ScaleObject | ScaleArray;
export type ScaleChain = ScaleObject[];

/** A `PresetScale` has its id prefixed */
export type PresetScale = ScaleObject & { id: `scale_preset_${string}` };

// ------------------------------------------------------------
// Scale Initialization
// ------------------------------------------------------------

/** Create a scale with a unique ID. */
export const initializeScale = (scale?: Partial<ScaleObject>): ScaleObject => ({
  ...emptyScale,
  ...scale,
  id: createId("scale"),
});

export const emptyScale: ScaleObject = { id: "scale_empty", notes: [] };
export const chromaticNotes: MidiScale = range(60, 72);
export const majorNotes: MidiScale = [60, 62, 64, 65, 67, 69, 71];
export const minorNotes: MidiScale = [60, 62, 63, 65, 67, 68, 70];
export const createMajorNotes = (root: MidiValue): MidiScale =>
  range(7).map((i) => root + [0, 2, 4, 5, 7, 9, 11][i]);
export const createMinorNotes = (root: MidiValue): MidiScale =>
  range(7).map((i) => root + [0, 2, 3, 5, 7, 8, 10][i]);

/** The chromatic scale is a ScaleObject containing MIDIValues.  */
export const chromaticScale: ScaleObject = {
  id: "scale_chromatic",
  name: "Chromatic Scale",
  notes: chromaticNotes,
};

/** The nested chromatic notes are an array of NestedNotes. */
export const nestedChromaticNotes: ScaleArray = range(12).map((i) => ({
  degree: i,
  offset: { _chromatic: 0 },
}));

/** The nested chromatic scale is a ScaleObject containing NestedNotes. */
export const nestedChromaticScale: ScaleObject = {
  id: "scale_nested_chromatic",
  name: "Chromatic Scale",
  notes: nestedChromaticNotes,
};

/** The default scale is a ScaleObject with nested notes. */
export const defaultScale: ScaleObject = {
  ...nestedChromaticScale,
  id: createId("scale"),
  name: "New Scale",
};

/** The mock scale is used for testing. */
export const mockScale: ScaleObject = {
  id: "scale_nested_mock",
  name: "Mock Scale",
  notes: [0, 2, 4, 5, 7, 9, 11].map((degree) => ({ degree })),
};

// ------------------------------------------------------------
// Scale Type Guards
// ------------------------------------------------------------

/** Checks if a given object is of type `ScaleVector`. */
export const isScaleVector = (obj: unknown): obj is ScaleVector => {
  const candidate = obj as ScaleVector;
  return isPlainObject(candidate);
};

/** Checks if a given object is of type `MidiValue`. */
export const isMidiValue = (obj: unknown): obj is MidiValue => {
  const candidate = obj as MidiNote;
  return isNumber(candidate);
};

/** Checks if a given object is of type `MidiObject`. */
export const isMidiObject = (obj: unknown): obj is MidiObject => {
  const candidate = obj as MidiObject;
  return isMidiValue(candidate?.MIDI);
};

/** Checks if a given object is of type `MidiNote`. */
export const isMidiNote = (obj: unknown): obj is MidiNote => {
  return isNumber(obj) || isNumber((obj as MidiObject)?.MIDI);
};

/** Checks if a given object is of type `NestedNote`. */
export const isNestedNote = (obj: unknown): obj is NestedNote => {
  const candidate = obj as NestedNote;
  return isObject(candidate) && "degree" in candidate;
};

/** Checks if a given object is of type `ScaleNote`. */
export const isScaleNote = (obj: unknown): obj is ScaleNote => {
  return isMidiNote(obj) || isNestedNote(obj);
};

/** Checks if a given object is of type `ScaleNoteObject`. */
export const isScaleNoteObject = (obj: unknown): obj is ScaleNoteObject => {
  return isMidiObject(obj) || isNestedNote(obj);
};

/** Checks if a given object is of type `ScaleArray`. */
export const isScaleArray = (obj: unknown): obj is ScaleArray => {
  const candidate = obj as ScaleArray;
  return isArray(candidate) && candidate.every(isScaleNote);
};

/** Checks if a given object is of type `ScaleObject`. */
export const isScaleObject = (obj: unknown): obj is ScaleObject => {
  const candidate = obj as ScaleObject;
  return (
    isPlainObject(candidate) &&
    isString(candidate.id) &&
    isScaleArray(candidate.notes)
  );
};

/** Checks if a given object is of type `Scale`. */
export const isScale = (obj: unknown): obj is Scale => {
  const candidate = obj as Scale;
  return isScaleArray(candidate) || isScaleObject(candidate);
};

/** Checks if a given object is of type `MidiScale`. */
export const isMidiScale = (obj: unknown): obj is MidiScale => {
  const candidate = obj as MidiScale;
  return isArray(candidate) && candidate.every(isMidiNote);
};

// Checks if a given object is of type `ScaleId`.
export const isScaleId = (obj: unknown): obj is ScaleId =>
  isString(obj) && obj.startsWith("scale");
