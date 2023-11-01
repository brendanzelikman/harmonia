import { ID } from "types/units";
import { nanoid } from "@reduxjs/toolkit";
import {
  PatternTrack,
  PatternTrackType,
  isPatternTrack,
} from "types/PatternTrack";
import { ScaleTrack, ScaleTrackType, isScaleTrack } from "types/ScaleTrack";
import { isPlainObject, isString } from "lodash";

// ------------------------------------------------------------
// Track Generics
// ------------------------------------------------------------

export type Track = ScaleTrack | PatternTrack;
export type TrackId = ID;
export type TrackNoId = Omit<Track, "id">;
export type EmptyTrackType = "emptyTrack";
export type TrackType = ScaleTrackType | PatternTrackType | EmptyTrackType;
export type TrackMap = Record<TrackId, Track>;

// ------------------------------------------------------------
// Track Definitions
// ------------------------------------------------------------

/** A track interface represents a generic track in the arrangement. */
export interface TrackInterface {
  id: TrackId;
  parentId?: TrackId;
  name: string;
  type: TrackType;
  collapsed?: boolean;
}

// ------------------------------------------------------------
// Track Initialization
// ------------------------------------------------------------

export const initializeTrackInterface = (
  track: Partial<TrackInterface> = defaultTrackInterface
): TrackInterface => ({ ...defaultTrackInterface, ...track, id: nanoid() });

export const defaultTrackInterface: TrackInterface = {
  id: "default-track",
  type: "emptyTrack",
  name: "",
};

export const mockTrackInterface: TrackInterface = {
  id: "mock-track",
  type: "emptyTrack",
  name: "Mock Track",
};

// ------------------------------------------------------------
// Track Type Guards
// ------------------------------------------------------------

/** Checks if a given object is of type `Track` */
export const isTrack = (obj: unknown): obj is Track => {
  const candidate = obj as Track;
  return isScaleTrack(candidate) || isPatternTrack(candidate);
};

/** Checks if a given object is of type `TrackInterface` */
export const isTrackInterface = (obj: unknown): obj is TrackInterface => {
  const candidate = obj as TrackInterface;
  return (
    isPlainObject(obj) &&
    isString(candidate.id) &&
    isString(candidate.name) &&
    isString(candidate.type)
  );
};

/** Checks if a given object is of type TrackMap. */
export const isTrackMap = (obj: unknown): obj is TrackMap => {
  const candidate = obj as TrackMap;
  return isPlainObject(obj) && Object.values(candidate).every(isTrack);
};
