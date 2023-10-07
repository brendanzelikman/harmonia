import { Clip, isClip } from "types/Clip";
import { Transposition, isTransposition } from "types/Transposition";

/**
 * A `Media` refers to a clip or transposition.
 */
export type Media = Clip | Transposition;

/**
 * A `MediaPayload` refers to a payload containing clips and/or transpositions.
 * @property clips - Optional. A list of clips.
 * @property transpositions - Optional. A list of transpositions.
 */
export type MediaPayload = {
  clips?: Clip[];
  transpositions?: Transposition[];
};

/**
 * A `PartialMediaPayload` refers to a payload containing partial clips and/or transpositions.
 * @property clips - Optional. A list of partial clips.
 * @property transpositions - Optional. A list of partial transpositions.
 */
export type PartialMediaPayload = {
  clips?: Partial<Clip>[];
  transpositions?: Partial<Transposition>[];
};

/**
 * Checks if a given object is of type `Media`.
 * @param obj The object to check.
 * @returns True if the object is a `Media`, otherwise false.
 */
export const isMedia = (obj: unknown): obj is Media => {
  const candidate = obj as Media;
  return candidate !== undefined && (isClip(obj) || isTransposition(obj));
};
