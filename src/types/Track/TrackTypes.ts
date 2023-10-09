import { ID } from "types/units";
import { nanoid } from "@reduxjs/toolkit";
import { PatternTrack, PatternTrackType } from "types/PatternTrack";
import { ScaleTrack, ScaleTrackType } from "types/ScaleTrack";

// Types
export type Track = ScaleTrack | PatternTrack;
export type TrackId = ID;
export type TrackNoId = Omit<Track, "id">;
export type EmptyTrackType = "emptyTrack";
export type TrackType = ScaleTrackType | PatternTrackType | EmptyTrackType;
export type TrackMap = Record<TrackId, Track>;

/**
 * A track interface represents a generic track in the session.
 * @property id: {@link TrackId} - The unique ID of the track.
 * @property parentId: {@link TrackId} - Optional. The ID of the parent track.
 * @property name: string - The name of the track.
 * @property type: {@link TrackType} - The type of the track.
 * @property collapsed: boolean - Optional. Whether the track is collapsed.
 */
export interface TrackInterface {
  id: TrackId;
  parentId?: TrackId;
  name: string;
  type: TrackType;
  collapsed?: boolean;
}

/**
 * A track note is defined by a degree and an offset.
 * @property degree: number - The degree of the note in the parent scale.
 * @property offset: number - The MIDI offset of the note.
 * @example
 * // The 3rd note of the parent scale shifted up one octave
 * [60, 61, 62, 63] { degree: 2, offset: 12 } = 74
 */
export type TrackNote = {
  degree: number;
  offset: number;
};

/**
 * A track scale is a collection of track notes.
 * If a track has no parent, then its parent scale is the chromatic scale.
 */
export type TrackScale = TrackNote[];
export const defaultTrackScale: TrackScale = new Array(12)
  .fill(0)
  .map((_, i) => ({ degree: i, offset: 0 }));

/**
 * Initializes a TrackInterface with a unique ID.
 * @param track - Optional. Partial TrackInterfaec to override default values.
 * @returns An initialized TrackInterface with a unique ID.
 */
export const initializeTrack = (
  track: Partial<TrackNoId> = defaultTrack
): TrackInterface => ({
  ...defaultTrack,
  ...track,
  id: nanoid(),
});

export const defaultTrack: TrackInterface = {
  id: "default-track",
  type: "emptyTrack",
  name: "",
};

export const mockTrack: TrackInterface = {
  id: "mock-track",
  type: "emptyTrack",
  name: "Mock Track",
};

/**
 * Checks if a given object is of type Track.
 * @param obj The object to check.
 * @returns True if the object is a Track, otherwise false.
 */
export const isTrack = (obj: unknown): obj is Track => {
  const candidate = obj as Track;
  return isTrackInterface(candidate);
};

/**
 * Checks if a given object is of type TrackInterface.
 * @param obj The object to check.
 * @returns True if the object is a TrackInterface, otherwise false.
 */
export const isTrackInterface = (obj: unknown): obj is TrackInterface => {
  const candidate = obj as TrackInterface;
  return (
    candidate?.id !== undefined &&
    candidate?.name !== undefined &&
    candidate?.type !== undefined
  );
};

/**
 * Checks if a given object is of type TrackMap.
 * @param obj The object to check.
 * @returns True if the object is a TrackMap, otherwise false.
 */
export const isTrackMap = (obj: unknown): obj is TrackMap => {
  const candidate = obj as TrackMap;
  return (
    candidate !== undefined &&
    Object.values(candidate).every((track) => isTrack(track))
  );
};

/**
 * Checks if a given object is of type ScaleTrackNote.
 * @param obj The object to check.
 * @returns True if the object is a ScaleTrackNote, otherwise false.
 */
export const isTrackNote = (obj: unknown): obj is TrackNote => {
  const candidate = obj as TrackNote;
  return candidate?.degree !== undefined && candidate?.offset !== undefined;
};

/**
 * Checks if a given object is of type ScaleTrackScale.
 * @param obj The object to check.
 * @returns True if the object is a ScaleTrackScale, otherwise false.
 */
export const isTrackScale = (obj: unknown): obj is TrackScale => {
  const candidate = obj as TrackScale;
  return candidate !== undefined && candidate?.every(isTrackNote);
};
