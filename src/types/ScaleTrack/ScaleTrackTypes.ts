import { nanoid } from "@reduxjs/toolkit";
import { NestedScaleId, ScaleId } from "types/Scale";
import { TrackId, TrackInterface, isTrackInterface } from "types/Track";

// Types
export type ScaleTrackType = "scaleTrack";
export type ScaleTrackNoId = Omit<ScaleTrack, "id">;
export type ScaleTrackMap = Record<TrackId, ScaleTrack>;
export const ScaleTrackScaleName = "$$$$$_track_scale_$$$$$";

/**
 * A `ScaleTrack` represents a `Track` with its own `NestedScale`.
 * @property `id` - The unique ID of the track.
 * @property `parentId` - Optional. The ID of the parent track.
 * @property `name` - The name of the track.
 * @property `type` - The type of the track.
 * @property `collapsed` - Optional. Whether the track is collapsed.
 * @property `scaleId` - The ID of the track's `NestedScale`.
 */
export interface ScaleTrack extends TrackInterface {
  scaleId: NestedScaleId;
}

/**
 * Initializes a `ScaleTrack with a unique ID.
 * @param clip - Optional. `Partial<ScaleTrack>` to override default values.
 * @returns An initialized `ScaleTrack` with a unique ID.
 */
export const initializeScaleTrack = (
  scaleTrack: Partial<ScaleTrackNoId> = defaultScaleTrack
): ScaleTrack => ({ ...defaultScaleTrack, ...scaleTrack, id: nanoid() });

export const defaultScaleTrack: ScaleTrack = {
  id: "default-scale-track",
  type: "scaleTrack",
  name: "",
  parentId: undefined,
  scaleId: "default-nested-scale",
};

export const mockScaleTrack: ScaleTrack = {
  id: "mock-scale-track",
  type: "scaleTrack",
  name: "Mock Scale Track",
  parentId: undefined,
  scaleId: "mock-nested-scale",
};

/**
 * Checks if a given object is of type `ScaleTrack`.
 * @param obj The object to check.
 * @returns True if the object is a `ScaleTrack`, otherwise false.
 */
export const isScaleTrack = (obj: unknown): obj is ScaleTrack => {
  const candidate = obj as ScaleTrack;
  return (
    isTrackInterface(candidate) &&
    candidate.type === "scaleTrack" &&
    candidate.scaleId !== undefined
  );
};

/**
 * Checks if a given object is of type `ScaleTrackMap`.
 * @param obj The object to check.
 * @returns True if the object is a `ScaleTrackMap`, otherwise false.
 */
export const isScaleTrackMap = (obj: unknown): obj is ScaleTrackMap => {
  const candidate = obj as ScaleTrackMap;
  return (
    candidate !== undefined &&
    Object.values(candidate).every((track) => isScaleTrack(track))
  );
};
