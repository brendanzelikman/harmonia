import { ID, Tick } from "types/units";
import { nanoid } from "@reduxjs/toolkit";
import { isPlainObject, isString } from "lodash";
import { NormalState, createNormalState } from "utils/normalizedState";
import { isOptionalType, isTypedArray } from "types/util";
import { ScaleId } from "types/Scale";
import { InstrumentId } from "types/Instrument";

// ------------------------------------------------------------
// Track Generics
// ------------------------------------------------------------

export type Track = ScaleTrack | PatternTrack;
export type TrackId = ID;
export type TrackNoId = Omit<Track, "id">;
export type TrackMap = Record<TrackId, Track>;
export type TrackState = NormalState<TrackMap>;

// ------------------------------------------------------------
// Track Definitions
// ------------------------------------------------------------

/** A `Tracked` object is either a track or an object placed at a tick in a track. */
export type Tracked<T> = T extends Track
  ? T
  : T & { id: ID; tick: Tick; trackId: TrackId };

/** The `TrackRowData` interface stores essential information needed to render a track. */
export interface TrackRowData {
  id: TrackId;
  trackIds: TrackId[];
}
export type TrackRowMap = Record<TrackId, TrackRowData>;
export type TrackRowDependencies = NormalState<TrackRowMap>;

/** A `TrackInterface` represents a generic track in the arrangement. */
export interface TrackInterface extends TrackRowData {
  name?: string;
  parentId?: TrackId;
  collapsed?: boolean;
  port?: number;
}

// ------------------------------------------------------------
// Scale Track Definitions
// ------------------------------------------------------------

export type ScaleTrackId = `scaleTrack-${TrackId}`;
export type ScaleTrackNoId = Omit<ScaleTrack, "id">;

/** A `ScaleTrack` is a `Track` with its own `Scale`. */
export interface ScaleTrack extends TrackInterface {
  id: ScaleTrackId;
  scaleId: ScaleId;
}

// ------------------------------------------------------------
// Pattern Track Definitions
// ------------------------------------------------------------

export type PatternTrackId = `patternTrack-${TrackId}`;
export type PatternTrackNoId = Omit<PatternTrack, "id">;

/** A `PatternTrack` is a `Track` with its own instrument. */
export interface PatternTrack extends TrackInterface {
  id: PatternTrackId;
  instrumentId: InstrumentId;
}

// ------------------------------------------------------------
// Track Initialization
// ------------------------------------------------------------

/** Create a scale track with a unique ID. */
export const initializeScaleTrack = (
  scaleTrack: Partial<ScaleTrackNoId> = defaultScaleTrack
): ScaleTrack => ({
  ...defaultScaleTrack,
  trackIds: [],
  ...scaleTrack,
  id: `scaleTrack-${nanoid()}`,
});

/** Create a pattern track with a unique ID. */
export const initializePatternTrack = (
  track: Partial<PatternTrackNoId> = defaultPatternTrack
): PatternTrack => ({
  ...defaultPatternTrack,
  ...track,
  id: `patternTrack-${nanoid()}`,
});

/** Re-initialize a track with a new ID. */
export const initializeTrack = (track: TrackNoId): Track => {
  return isScaleTrack(track)
    ? initializeScaleTrack(track)
    : initializePatternTrack(track);
};

/** The default scale track is used for initialization. */
export const defaultScaleTrack: ScaleTrack = {
  id: "scaleTrack-1",
  scaleId: "default-nested-scale",
  trackIds: ["patternTrack-1"],
};

/** The default pattern track is used for initialization. */
export const defaultPatternTrack: PatternTrack = {
  id: "patternTrack-1",
  parentId: "scaleTrack-1",
  instrumentId: "default-instrument",
  trackIds: [],
};

/** The default track state is used for Redux. */
export const defaultTrackState: TrackState = createNormalState<TrackMap>([
  defaultScaleTrack,
  defaultPatternTrack,
]);

// ------------------------------------------------------------
// Track Type Guards
// ------------------------------------------------------------

/** Checks if a given object is of type `TrackInterface` */
export const isTrackInterface = (obj: unknown): obj is TrackInterface => {
  const candidate = obj as TrackInterface;
  return (
    isPlainObject(obj) &&
    isString(candidate.id) &&
    isTypedArray(candidate.trackIds, isString) &&
    isOptionalType(candidate.name, isString)
  );
};

/** Checks if a given object is of type `ScaleTrack`. */
export const isScaleTrack = (obj: unknown): obj is ScaleTrack => {
  const candidate = obj as ScaleTrack;
  return (
    isTrackInterface(candidate) &&
    candidate.id.startsWith("scaleTrack-") &&
    isString(candidate.scaleId)
  );
};

/** Checks if a given object is of type `PatternTrack`. */
export const isPatternTrack = (obj: unknown): obj is PatternTrack => {
  const candidate = obj as PatternTrack;
  return (
    isTrackInterface(candidate) &&
    candidate.id.startsWith("patternTrack-") &&
    isString(candidate.instrumentId)
  );
};

/** Checks if a given object is of type `Track` */
export const isTrack = (obj: unknown): obj is Track => {
  const candidate = obj as Track;
  return isScaleTrack(candidate) || isPatternTrack(candidate);
};
