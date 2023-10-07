import { nanoid } from "@reduxjs/toolkit";
import { PatternId } from "types/Pattern";
import { TrackId } from "types/Track";
import { ID, Tick } from "types/units";
import { ClipColor } from "./ClipThemes";

// Clip Types
export type ClipId = ID;
export type ClipNoId = Omit<Clip, "id">;
export type ClipMap = Record<ClipId, Clip>;

/**
 * A `Clip` is an instance of a `Pattern` that is played at a time in a `Track`.
 *
 * @property `id` - The id of the clip.
 * @property `patternId` - The id of the pattern that the clip points to.
 * @property `trackId` - The id of the track that the clip is in.
 * @property `tick` - The tick that the clip starts at.
 * @property `offset` - The offset of the clip from the start of the pattern.
 * @property `duration` - The duration of the clip.
 * @property `color` - The color of the clip.
 *
 */
export interface Clip {
  id: ClipId;
  patternId: PatternId;
  trackId: TrackId;

  tick: Tick;
  offset: Tick;
  duration?: Tick;

  color?: ClipColor;
}

/**
 * Initializes a `Clip` with a unique ID.
 * @param clip - Optional. `Partial<ClipNoId>` to override default values.
 * @returns An initialized `Clip` with a unique ID.
 */
export const initializeClip = (
  clip: Partial<ClipNoId> = defaultClip
): Clip => ({
  ...defaultClip,
  ...clip,
  id: nanoid(),
});

export const defaultClip: Clip = {
  id: "default-clip",
  patternId: "default-pattern",
  trackId: "default-track",
  tick: 0,
  offset: 0,
};

export const mockClip: Clip = {
  id: "mock-clip",
  patternId: "mock-pattern",
  trackId: "mock-pattern-track",
  tick: 12,
  offset: 3,
  duration: 2,
};

/**
 * Checks if a given object is of type `Clip`.
 * @param obj The object to check.
 * @returns True if the object is a `Clip`, otherwise false.
 */
export const isClip = (obj: unknown): obj is Clip => {
  const candidate = obj as Clip;
  return (
    candidate?.id !== undefined &&
    candidate?.patternId !== undefined &&
    candidate?.trackId !== undefined &&
    candidate?.tick !== undefined &&
    candidate?.offset !== undefined
  );
};

/**
 * Checks if a given object is of type `ClipMap`.
 * @param obj The object to check.
 * @returns True if the object is a `ClipMap`, otherwise false.
 */
export const isClipMap = (obj: unknown): obj is ClipMap => {
  const candidate = obj as ClipMap;
  return candidate !== undefined && Object.values(candidate).every(isClip);
};
