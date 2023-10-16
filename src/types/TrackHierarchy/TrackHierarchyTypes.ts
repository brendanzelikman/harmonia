import { NormalizedState, initializeState } from "../util";
import { ClipId } from "../Clip";
import { TrackId, TrackType } from "../Track";
import { TranspositionId } from "../Transposition";

/**
 * A `TrackNode` refers to a track and its media + children
 * @property `id` - The unique ID of the track.
 * @property `type` - The type of the track.
 * @property `depth` - The depth of the track in the TrackHierarchy map.
 * @property `trackIds` - The IDs of the child tracks.
 * @property `clipIds` - The IDs of the clips in the track.
 * @property `transpositionIds` - The IDs of the transpositions in the track.
 * @property `collapsed` - Optional. Whether the track is collapsed.
 */
export interface TrackNode {
  id: TrackId;
  type: TrackType;
  depth: number;
  trackIds: TrackId[];
  clipIds: ClipId[];
  transpositionIds: TranspositionId[];
  collapsed?: boolean;
}

export const defaultScaleTrackNode: TrackNode = {
  id: "default-scale-track",
  type: "scaleTrack",
  depth: 0,
  trackIds: ["default-pattern-track"],
  clipIds: [],
  transpositionIds: [],
};
export const mockScaleTrackNode: TrackNode = {
  id: "mock-scale-track",
  type: "scaleTrack",
  depth: 0,
  trackIds: ["mock-pattern-track"],
  clipIds: [],
  transpositionIds: [],
};

export const defaultPatternTrackNode: TrackNode = {
  id: "default-pattern-track",
  type: "patternTrack",
  depth: 1,
  trackIds: [],
  clipIds: [],
  transpositionIds: [],
};
export const mockPatternTrackNode: TrackNode = {
  id: "mock-pattern-track",
  type: "patternTrack",
  depth: 1,
  trackIds: [],
  clipIds: ["mock-clip"],
  transpositionIds: ["mock-transposition"],
};

/**
 * A `TrackHierarchy` is built upon a normalized state of `TrackNode` objects.
 * @property `allIds` - The IDs of all the tracks.
 * @property `byId` - The map of track IDs to `TrackNode` objects.
 * @property `topLevelIds` - The IDs of the top-level tracks.
 */
export interface TrackHierarchy extends NormalizedState<TrackId, TrackNode> {
  topLevelIds: TrackId[];
}
export type TrackNodeMap = Record<TrackId, TrackNode>;

/**
 * The default hierarchy is initialized with the default scale track and default pattern track.
 */
export const defaultTrackHierarchy: TrackHierarchy = {
  ...initializeState<TrackId, TrackNode>([
    defaultScaleTrackNode,
    defaultPatternTrackNode,
  ]),
  topLevelIds: [defaultScaleTrackNode.id],
};

/**
 * Checks if a given object is of type `TrackHierarchy`.
 * @param obj The object to check.
 * @returns True if the object is a `TrackHierarchy`, otherwise false.
 */
export const isTrackHierarchy = (obj: unknown): obj is TrackHierarchy => {
  const candidate = obj as TrackHierarchy;
  return (
    candidate?.allIds !== undefined &&
    candidate?.byId !== undefined &&
    candidate?.topLevelIds !== undefined &&
    Object.values(candidate.byId).every(isTrackNode)
  );
};

/**
 * Checks if a given object is of type `TrackNode`.
 * @param obj The object to check.
 * @returns True if the object is a `TrackNode`, otherwise false.
 */
export const isTrackNode = (obj: unknown): obj is TrackNode => {
  const candidate = obj as TrackNode;
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
 * Checks if a given object is of type `TrackNodeMap`.
 * @param obj The object to check.
 * @returns True if the object is a `TrackNodeMap`, otherwise false.
 */
export const isTrackNodeMap = (obj: unknown): obj is TrackNodeMap => {
  const candidate = obj as TrackNodeMap;
  return candidate != undefined && Object.values(candidate).every(isTrackNode);
};
