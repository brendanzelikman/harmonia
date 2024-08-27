// ------------------------------------------------------------
// Clip Type Helpers
// ------------------------------------------------------------

import {
  isPatternTrack,
  isScaleTrack,
  ITrack,
  ITrackId,
  ITrackUpdate,
  Track,
  TrackId,
  TrackType,
  TrackUpdate,
} from "types/Track/TrackTypes";
import { Update } from "types/units";
import {
  PatternTrack,
  PatternTrackId,
  isPatternTrackId,
} from "./PatternTrack/PatternTrackTypes";
import {
  ScaleTrack,
  ScaleTrackId,
  isScaleTrackId,
} from "./ScaleTrack/ScaleTrackTypes";

export type TracksByType = { [T in TrackType]: ITrack<T>[] };

/** Convert an array of tracks to a record of tracks by type */
export const getTracksByType = (tracks: Track[]): TracksByType => {
  const pattern: PatternTrack[] = [];
  const scale: ScaleTrack[] = [];

  for (const track of tracks) {
    if (isPatternTrack(track)) pattern.push(track);
    else if (isScaleTrack(track)) scale.push(track);
  }

  return { pattern, scale };
};

// ------------------------------------------------------------
// Track Update Type Helpers
// ------------------------------------------------------------

export type TrackUpdatesByType = { [T in TrackType]: ITrackUpdate<T>[] };

/** Convert an array of tracks to a record of tracks by type */
export const getTrackUpdatesByType = (
  tracks: TrackUpdate[]
): TrackUpdatesByType => {
  const pattern: Update<PatternTrack>[] = [];
  const scale: Update<ScaleTrack>[] = [];

  for (const track of tracks) {
    if (isPatternTrack(track)) pattern.push(track);
    else if (isScaleTrack(track)) scale.push(track);
  }

  return { pattern, scale };
};

// ------------------------------------------------------------
// Track Id Type Helpers
// ------------------------------------------------------------

export type TrackIdsByType = { [T in TrackType]: ITrackId<T>[] };

/** Convert an array of ids to a record of ids by type */
export const getTrackIdsByType = (ids: TrackId[]): TrackIdsByType => {
  const pattern: PatternTrackId[] = [];
  const scale: ScaleTrackId[] = [];

  for (const id of ids) {
    if (isPatternTrackId(id)) pattern.push(id);
    else if (isScaleTrackId(id)) scale.push(id);
  }

  return { pattern, scale };
};
