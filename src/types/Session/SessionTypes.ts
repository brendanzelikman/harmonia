import { NormalizedState, initializeState } from "../util";
import { ClipId } from "../Clip";
import { TrackId, TrackType } from "../Track";
import { TranspositionId } from "../Transposition";

/**
 * A `SessionEntity` refers to a track and its media + children
 * @property `id` - The unique ID of the track.
 * @property `type` - The type of the track.
 * @property `depth` - The depth of the track in the session map.
 * @property `trackIds` - The IDs of the child tracks.
 * @property `clipIds` - The IDs of the clips in the track.
 * @property `transpositionIds` - The IDs of the transpositions in the track.
 * @property `collapsed` - Optional. Whether the track is collapsed.
 */
export interface SessionEntity {
  id: TrackId;
  type: TrackType;
  depth: number;
  trackIds: TrackId[];
  clipIds: ClipId[];
  transpositionIds: TranspositionId[];
  collapsed?: boolean;
}

export const defaultScaleTrackEntity: SessionEntity = {
  id: "default-scale-track",
  type: "scaleTrack",
  depth: 0,
  trackIds: ["default-pattern-track"],
  clipIds: [],
  transpositionIds: [],
};
export const mockScaleTrackEntity: SessionEntity = {
  id: "mock-scale-track",
  type: "scaleTrack",
  depth: 0,
  trackIds: ["mock-pattern-track"],
  clipIds: [],
  transpositionIds: [],
};

export const defaultPatternTrackEntity: SessionEntity = {
  id: "default-pattern-track",
  type: "patternTrack",
  depth: 1,
  trackIds: [],
  clipIds: [],
  transpositionIds: [],
};
export const mockPatternTrackEntity: SessionEntity = {
  id: "mock-pattern-track",
  type: "patternTrack",
  depth: 1,
  trackIds: [],
  clipIds: ["mock-clip"],
  transpositionIds: ["mock-transposition"],
};

/**
 * A `Session` is built upon a normalized state of `SessionEntity` objects.
 * @property `allIds` - The IDs of all the tracks.
 * @property `byId` - The map of track IDs to `SessionEntity` objects.
 * @property `topLevelIds` - The IDs of the top-level tracks.
 */
export interface Session extends NormalizedState<TrackId, SessionEntity> {
  topLevelIds: TrackId[];
}
export type SessionMap = Record<TrackId, SessionEntity>;

/**
 * The default session is initialized with a default scale track and a default pattern track.
 */
export const defaultSession: Session = {
  ...initializeState<TrackId, SessionEntity>([
    defaultScaleTrackEntity,
    defaultPatternTrackEntity,
  ]),
  topLevelIds: [defaultScaleTrackEntity.id],
};

/**
 * Checks if a given object is of type `Session`.
 * @param obj The object to check.
 * @returns True if the object is a `Session`, otherwise false.
 */
export const isSession = (obj: unknown): obj is Session => {
  const candidate = obj as Session;
  return (
    candidate?.allIds !== undefined &&
    candidate?.byId !== undefined &&
    candidate?.topLevelIds !== undefined &&
    Object.values(candidate.byId).every(isSessionEntity)
  );
};

/**
 * Checks if a given object is of type `SessionEntity`.
 * @param obj The object to check.
 * @returns True if the object is a `SessionEntity`, otherwise false.
 */
export const isSessionEntity = (obj: unknown): obj is SessionEntity => {
  const candidate = obj as SessionEntity;
  return (
    candidate?.id !== undefined &&
    candidate?.type !== undefined &&
    candidate?.depth !== undefined &&
    candidate?.trackIds !== undefined &&
    candidate?.clipIds !== undefined &&
    candidate?.transpositionIds !== undefined
  );
};

/**
 * Checks if a given object is of type `SessionMap`.
 * @param obj The object to check.
 * @returns True if the object is a `SessionMap`, otherwise false.
 */
export const isSessionMap = (obj: unknown): obj is SessionMap => {
  const candidate = obj as SessionMap;
  return (
    candidate != undefined && Object.values(candidate).every(isSessionEntity)
  );
};
