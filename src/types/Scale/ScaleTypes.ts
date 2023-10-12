import { Note } from "../units";
import { range } from "lodash";
import { nanoid } from "@reduxjs/toolkit";

// General Types
export type ScaleId = string;
export type ScaleMap = Record<ScaleId, ScaleObject>;
export type ScaleNoId = Omit<ScaleObject, "id">;
export type NestedScaleId = string;
export type NestedScaleMap = Record<NestedScaleId, NestedScaleObject>;
export type NestedScaleNoId = Omit<NestedScaleObject, "id">;

/**
 * A `ScaleArray` is an array of MIDI notes.
 */
export type ScaleArray = Note[];

/**
 * A `ScaleObject` is an object with a unique ID, name, and array of MIDI notes.
 */
export type ScaleObject = {
  id: ScaleId;
  name: string;
  notes: Note[];
};

/**
 * A `Scale` is a collection of MIDI notes stored as an array or object.
 * @example
 * // Array
 * const scale: Scale = [60, 62, 64, 65, 67, 69, 71];
 *
 * // Object
 * const scale: Scale = {
 *   id: "example-scale",
 *   name: "Example Scale",
 *   notes: [60, 62, 64, 65, 67, 69, 71],
 * };
 */
export type Scale = ScaleArray | ScaleObject;

/**
 * A `NestedNote` is defined by a degree and an offset.
 * @property degree: number - The degree of the note in the parent scale.
 * @property offset: number - The MIDI offset of the note.
 * @example
 * // The 3rd note of the parent scale shifted up one octave
 * [60, 61, 62, 63] { degree: 2, offset: 12 } = 74
 */
export type NestedNote = {
  degree: number;
  offset: number;
};

/**
 * A `NestedScaleArray` is an array of `NestedNote`s.
 */
export type NestedScaleArray = NestedNote[];

/**
 * A `NestedScaleObject` is an object with a unique ID, name, and array of `NestedNote`s.
 */
export type NestedScaleObject = {
  id: NestedScaleId;
  name: string;
  notes: NestedScaleArray;
};

/**
 * A nested scale is a collection of nested notes.
 * If no parent is defined, then the chromatic scale is used.
 * @example
 * // Array
 * const nestedScale: NestedScale = [
 *  { degree: 0, offset: 0 },
 *  { degree: 4, offset: 0 },
 *  { degree: 7, offset: 0 }
 * ]
 * // Object
 * const nestedScale: NestedScale = {
 *  id: "example-nested-scale",
 *  name: "Example Nested Scale",
 *  notes: [
 *    { degree: 0, offset: 0 },
 *    { degree: 4, offset: 0 },
 *    { degree: 7, offset: 0 }
 *  ]
 */
export type NestedScale = NestedScaleArray | NestedScaleObject;

/**
 * Initializes a `Scale` with a unique ID.
 * @param scale - Optional. `Partial<Scale>` to override default values.
 * @returns An initialized `Scale` with a unique ID.
 */
export const initializeScale = (
  scale: Partial<ScaleObject> = chromaticScale
): ScaleObject => ({
  ...chromaticScale,
  ...scale,
  id: nanoid(),
});

/**
 * Initializes a `NestedScale` with a unique ID.
 * @param scale - Optional. `Partial<NestedScale>` to override default values.
 * @returns An initialized `NestedScale` with a unique ID.
 */
export const initializeNestedScale = (
  scale: Partial<NestedScaleObject> = nestedChromaticScale
): NestedScaleObject => ({
  ...nestedChromaticScale,
  ...scale,
  id: nanoid(),
});

// The chromatic scale is globally available as an array and object
export const chromaticNotes: ScaleArray = range(60, 72);
export const chromaticScale: ScaleObject = {
  id: "chromatic-scale",
  name: "Chromatic Scale",
  notes: chromaticNotes,
};
export const defaultScale = { ...chromaticScale, id: "default-scale" };

// The nested chromatic scale is provided for convenience
export const nestedChromaticNotes: NestedScaleArray = range(12).map((i) => ({
  degree: i,
  offset: 0,
}));
export const nestedChromaticScale: NestedScaleObject = {
  id: "nested-chromatic-scale",
  name: "Chromatic Scale",
  notes: nestedChromaticNotes,
};
export const defaultNestedScale = {
  ...nestedChromaticScale,
  id: "default-nested-scale",
};

// Mocks used for testing
export const mockScale = {
  id: "mock-scale",
  name: "Mock Scale",
  notes: [60, 62, 64, 65, 67, 69, 71],
};
export const mockNestedScale = {
  id: "mock-nested-scale",
  name: "Mock Nested Scale",
  notes: [
    { degree: 0, offset: 0 },
    { degree: 4, offset: 0 },
    { degree: 7, offset: 0 },
  ],
};

/**
 * Checks if a given object is of type `Scale`.
 * @param obj The object to check.
 * @returns True if the object is a `Scale`, otherwise false.
 */
export const isScale = (obj: unknown): obj is Scale => {
  const candidate = obj as Scale;
  return isScaleArray(candidate) || isScaleObject(candidate);
};

/**
 * Checks if a given object is of type `ScaleObject`.
 * @param obj The object to check.
 * @returns True if the object is a `ScaleObject`, otherwise false.
 */
export const isScaleObject = (obj: unknown): obj is ScaleObject => {
  const candidate = obj as ScaleObject;
  return (
    candidate?.id !== undefined &&
    candidate?.name !== undefined &&
    candidate?.notes !== undefined
  );
};

/**
 * Checks if a given object is of type `ScaleArray`.
 * @param obj The object to check.
 * @returns True if the object is a `ScaleArray`, otherwise false.
 */
export const isScaleArray = (obj: unknown): obj is ScaleArray => {
  const candidate = obj as ScaleArray;
  return (
    Array.isArray(candidate) &&
    candidate.every((note) => typeof note === "number")
  );
};

/**
 * Checks if a given object is of type `NestedNote`.
 * @param obj The object to check.
 * @returns True if the object is a `NestedNote`, otherwise false.
 */
export const isNestedNote = (obj: unknown): obj is NestedNote => {
  const candidate = obj as NestedNote;
  return candidate?.degree !== undefined && candidate?.offset !== undefined;
};

/**
 * Checks if a given object is of type `NestedScale`.
 * @param obj The object to check.
 * @returns True if the object is a `NestedScale`, otherwise false.
 */
export const isNestedScale = (obj: unknown): obj is NestedScale => {
  const candidate = obj as NestedScale;
  return isNestedScaleArray(candidate) || isNestedScaleObject(candidate);
};

/**
 * Checks if a given object is of type `NestedScaleArray`.
 * @param obj The object to check.
 * @returns True if the object is a `NestedScaleArray`, otherwise false.
 */
export const isNestedScaleArray = (obj: unknown): obj is NestedScaleArray => {
  const candidate = obj as NestedScaleArray;
  return Array.isArray(candidate) && candidate.every(isNestedNote);
};

/**
 * Checks if a given object is of type `NestedScaleObject`.
 * @param obj The object to check.
 * @returns True if the object is a `NestedScaleObject`, otherwise false.
 */
export const isNestedScaleObject = (obj: unknown): obj is NestedScaleObject => {
  const candidate = obj as NestedScaleObject;
  return (
    candidate?.id !== undefined &&
    candidate?.name !== undefined &&
    isNestedScaleArray(candidate.notes)
  );
};
