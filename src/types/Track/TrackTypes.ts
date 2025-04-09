import { Id, Update } from "types/units";
import { isPlainObject } from "lodash";
import {
  initializePatternTrack,
  isPatternTrackId,
  PatternTrack,
  PatternTrackId,
} from "./PatternTrack/PatternTrackTypes";
import {
  initializeScaleTrack,
  isScaleTrackId,
  ScaleTrack,
  ScaleTrackId,
} from "./ScaleTrack/ScaleTrackTypes";
import { InstrumentId } from "types/Instrument/InstrumentTypes";
import { ScaleId } from "types/Scale/ScaleTypes";
import { EntityState, nanoid } from "@reduxjs/toolkit";
import { PoseVector } from "types/Pose/PoseTypes";

// ------------------------------------------------------------
// Typed Track Definitions
// ------------------------------------------------------------

export const TRACK_TYPES = ["scale", "pattern"] as const;
export type TrackType = (typeof TRACK_TYPES)[number];

export type Track = ScaleTrack | PatternTrack;
export type TrackId = ScaleTrackId | PatternTrackId;

export type TrackUpdate = Update<Track>;
export type TrackMap = Record<TrackId, Track>;
export type TrackState = EntityState<Track, TrackId>;

// ------------------------------------------------------------
// Generic Track Definitions
// ------------------------------------------------------------

/** The `TrackRowData` interface stores essential information needed to render a track. */
export interface TrackRowData {
  id: TrackId;
  trackIds: TrackId[];
}
export type TrackRowMap = Record<TrackId, TrackRowData>;

/** A `TrackInterface` represents a generic track in the arrangement. */
export type ITrack<T extends TrackType = TrackType> = {
  id: ITrackId<T>;
  trackIds: TrackId[];
  type: T;
  name?: string;
  parentId?: TrackId;
  order?: number;
  collapsed?: boolean;
  port?: number;
  vector?: PoseVector;
  instrumentId?: InstrumentId;
  scaleId?: ScaleId;
} & ITrackProps<T>;

/** A `Track` can have extra props based on its type. */
export type ITrackProps<T extends TrackType> = T extends "pattern"
  ? { instrumentId: InstrumentId }
  : T extends "scale"
  ? { scaleId: ScaleId }
  : never;

export type ITrackId<T extends TrackType> = Id<`${T}-track`>;
export type ITrackUpdate<T extends TrackType> = Update<ITrack<T>>;

// ------------------------------------------------------------
// Track Initialization
// ------------------------------------------------------------

/** Re-initialize a track with a new ID. */
export const initializeTrack = (track: Partial<Track>): Track => {
  if (track.type === "scale") return initializeScaleTrack(track);
  if (track.type === "pattern") return initializePatternTrack(track);
  return { ...track, id: nanoid() } as Track;
};

// ------------------------------------------------------------
// Track Type Guards
// ------------------------------------------------------------

/** Checks if a given object is of type `Track` */
export const isTrack = (obj: unknown): obj is Track => {
  const candidate = obj as Track;
  return isPlainObject(candidate) && isTrackId(candidate.id);
};

/** Checks if a given ID is a `TrackId` */
export const isTrackId = (id: unknown): id is TrackId => {
  return isScaleTrackId(id) || isPatternTrackId(id);
};

/** Checks if a given track has a `ScaleTrackId` */
export const isScaleTrack = (track?: Partial<Track>): track is ScaleTrack => {
  return isScaleTrackId(track?.id);
};

/** Checks if a given track has a `PatternTrackId` */
export const isPatternTrack = (
  track?: Partial<Track>
): track is PatternTrack => {
  return isPatternTrackId(track?.id);
};
