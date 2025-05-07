import { Id, PitchClass } from "types/units";
import { MidiNote, MidiObject, MidiScale, MidiValue } from "utils/midi";
import { createId, isNumber, isObject } from "types/utils";
import { EntityState } from "@reduxjs/toolkit";
import { Vector } from "utils/vector";
import { range } from "utils/array";

// ------------------------------------------------------------
// Scale Generics
// ------------------------------------------------------------

export type ScaleId = Id<"scale">;
export type ScaleMap = Record<ScaleId, ScaleObject>;
export type ScaleState = EntityState<ScaleObject, ScaleId>;

// ------------------------------------------------------------
// Scale Definitions
// ------------------------------------------------------------

/** A scalar vector can contain a transposition or voice leading. */
export type ScaleVector = Vector<ScaleVectorId>;
export type ScaleVectorId = "chromatic" | "octave" | PitchClass | ScaleId;

/**
 * A `NestedNote` is a note that indexes a parent by degree.
 * Each note can also store a transposition vector and a scale ID.
 */
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
  range(0, 7).map((i) => root + [0, 2, 4, 5, 7, 9, 11][i]);
export const createMinorNotes = (root: MidiValue): MidiScale =>
  range(0, 7).map((i) => root + [0, 2, 3, 5, 7, 8, 10][i]);

/** The chromatic scale is a ScaleObject containing MIDIValues.  */
export const chromaticScale: ScaleObject = {
  id: "scale_chromatic",
  name: "Chromatic Scale",
  notes: chromaticNotes,
};

/** The nested chromatic notes are an array of NestedNotes. */
export const nestedChromaticNotes: ScaleArray = range(0, 12).map((i) => ({
  degree: i,
  offset: { _chromatic: 0 },
}));

/** The nested chromatic scale is a ScaleObject containing NestedNotes. */
export const nestedChromaticScale: ScaleObject = {
  id: "scale_nested_chromatic",
  name: "Chromatic Scale",
  notes: nestedChromaticNotes,
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

export const isScaleId = (obj: unknown): obj is ScaleId => {
  return typeof obj === "string" && obj.startsWith("scale_");
};

export const isMidiValue = (obj: unknown): obj is MidiValue => {
  return isNumber(obj) && !isNaN(obj);
};

/** Checks if a given object is of type `MidiObject`. */
export const isMidiObject = (obj: unknown): obj is MidiObject => {
  return isObject(obj) && isNumber(obj.MIDI) && !isNaN(obj.MIDI);
};

/** Checks if a given object is of type `MidiNote`. */
export const isMidiNote = (obj: unknown): obj is MidiNote => {
  return isMidiObject(obj) || isMidiValue(obj);
};

/** Checks if a given object is of type `NestedNote`. */
export const isNestedNote = (obj: unknown): obj is NestedNote => {
  return isObject(obj) && "degree" in obj;
};

/** Checks if a given object is of type `ScaleNoteObject`. */
export const isScaleNoteObject = (obj: unknown): obj is ScaleNoteObject => {
  return isMidiObject(obj) || isNestedNote(obj);
};
