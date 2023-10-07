import { Note } from "../units";
import { getRotatedScale } from "./ScaleFunctions";
import { mod } from "utils";
import { range } from "lodash";
import { nanoid } from "@reduxjs/toolkit";

// Types
export type ScaleId = string;
export type ScaleArray = Note[];
export type ScaleObject = {
  notes: Note[];
  id: ScaleId;
  name: string;
};
export type ScaleMap = Record<ScaleId, ScaleObject>;
export type ScaleNoId = Omit<ScaleObject, "id">;

/**
 * The track scale name is used to identify the scale within a track.
 */
export const TrackScaleName = "$$$$$_track_scale_$$$$$";

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
 * Initializes a `Scale` with a unique ID.
 * @param clip - Optional. `Partial<Scale>` to override default values.
 * @returns An initialized `Scale` with a unique ID.
 */
export const initializeScale = (
  scale: Partial<Scale> = defaultScale
): ScaleObject => ({
  ...defaultScale,
  ...scale,
  id: nanoid(),
});

export const chromaticNotes: ScaleArray = range(60, 72);
export const chromaticScale: ScaleObject = {
  id: "chromatic-scale",
  name: "Chromatic Scale",
  notes: chromaticNotes,
};

export const defaultScale = {
  id: "default-scale",
  name: TrackScaleName,
  notes: chromaticNotes,
};
export const mockScale = {
  id: "mock-scale",
  name: "Mock Scale",
  notes: [60, 62, 64, 65, 67, 69, 71],
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
 * Unpacks the notes of a `Scale`.
 * @param scale The `Scale` to unpack.
 * @returns An array of MIDI notes. If the `Scale` is invalid, return an empty array.
 */
export const unpackScale = (scale?: Scale) => {
  if (isScaleArray(scale)) return scale;
  if (isScaleObject(scale)) return scale.notes;
  return [];
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
  const scale1Notes = unpackScale(scale1);
  const scale2Notes = unpackScale(scale2);

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
  const scale1Notes = unpackScale(scale1);
  const scale2Notes = unpackScale(scale2);

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
  const scale1Notes = unpackScale(scale1);
  const scale2Notes = unpackScale(scale2);

  // Check the lengths of the scales
  if (scale1Notes.length !== scale2Notes.length) return false;

  // Return true if some rotation of the first scale is equal to the second scale
  return scale1Notes.some((_, i) => {
    const mode = getRotatedScale(scale1, i);
    return areScalesEqual(mode, scale2);
  });
};
