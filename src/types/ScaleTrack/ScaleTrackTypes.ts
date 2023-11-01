import { nanoid } from "@reduxjs/toolkit";
import { isPlainObject, isString } from "lodash";
import { ScaleId } from "types/Scale";
import { TrackId, TrackInterface } from "types/Track";
import {
  NormalRecord,
  NormalState,
  createNormalState,
} from "utils/normalizedState";

// ------------------------------------------------------------
// Scale Track Generics
// ------------------------------------------------------------

export type ScaleTrackType = "scaleTrack";
export type ScaleTrackNoId = Omit<ScaleTrack, "id">;
export type ScaleTrackPartial = Partial<ScaleTrack>;
export type ScaleTrackUpdate = Partial<ScaleTrack> & { id: TrackId };
export type ScaleTrackMap = NormalRecord<TrackId, ScaleTrack>;
export type ScaleTrackState = NormalState<ScaleTrackMap>;

// ------------------------------------------------------------
// Scale Track Definitions
// ------------------------------------------------------------

/** A `ScaleTrack` is a `Track` with its own `Scale`. */
export interface ScaleTrack extends TrackInterface {
  type: "scaleTrack";
  scaleId: ScaleId;
}

// ------------------------------------------------------------
// Scale Track Initialization
// ------------------------------------------------------------

/** Create a scale track with a unique ID. */
export const initializeScaleTrack = (
  scaleTrack: Partial<ScaleTrackNoId> = defaultScaleTrack
): ScaleTrack => ({
  ...defaultScaleTrack,
  ...scaleTrack,
  type: "scaleTrack",
  id: nanoid(),
});

/** The default scale track is used for initialization. */
export const defaultScaleTrack: ScaleTrack = {
  id: "default-scale-track",
  type: "scaleTrack",
  name: "",
  parentId: undefined,
  scaleId: "default-nested-scale",
};

/** The mock scale track is used for testing. */
export const mockScaleTrack: ScaleTrack = {
  id: "mock-scale-track",
  type: "scaleTrack",
  name: "Mock Scale Track",
  parentId: undefined,
  scaleId: "mock-nested-scale",
};

//* The default scale track state is used for Redux. */
export const defaultScaleTrackState: ScaleTrackState =
  createNormalState<ScaleTrackMap>([defaultScaleTrack]);

// ------------------------------------------------------------
// Scale Track Type Guards
// ------------------------------------------------------------

/** Checks if a given object is of type `ScaleTrack`. */
export const isScaleTrack = (obj: unknown): obj is ScaleTrack => {
  const candidate = obj as ScaleTrack;
  return (
    isPlainObject(candidate) &&
    isString(candidate.id) &&
    candidate.type === "scaleTrack" &&
    isString(candidate.scaleId)
  );
};

/** Checks if a given object is of type `ScaleTrackMap`. */
export const isScaleTrackMap = (obj: unknown): obj is ScaleTrackMap => {
  const candidate = obj as ScaleTrackMap;
  return (
    isPlainObject(candidate) && Object.values(candidate).every(isScaleTrack)
  );
};
