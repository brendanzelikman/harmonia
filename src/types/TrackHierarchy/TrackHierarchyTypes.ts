import { NormalState, createNormalState } from "utils/normalizedState";
import { ClipId } from "../Clip";
import { TrackId, TrackType } from "../Track";
import { TranspositionId } from "../Transposition";
import { isArray, isPlainObject, isString } from "lodash";
import {
  areObjectKeysTyped,
  areObjectValuesTyped,
  isBoundedNumber,
  isFiniteNumber,
  isTypedArray,
} from "types/util";

// ------------------------------------------------------------
// Track Hierarchy Generics
// ------------------------------------------------------------

export type TrackNodeState = NormalState<TrackNodeMap>;

// ------------------------------------------------------------
// Track Hierarchy Definitions
// ------------------------------------------------------------

/** The `TrackRenderData` interface stores essential information needed to render a track. */
export interface TrackRenderData {
  id: TrackId;
  trackIds: TrackId[];
  type: TrackType;
  depth: number;
}

/** A `TrackNode` stores track render data and additional dependencies. */
export interface TrackNode extends TrackRenderData {
  clipIds: ClipId[];
  transpositionIds: TranspositionId[];
  collapsed?: boolean;
}

/** A `TrackRenderMap` is a record of track render data stored by ID. */
export type TrackRenderMap = Record<TrackId, TrackRenderData>;

/** A `TrackNodeMap` is a record of track nodes stored by ID.  */
export type TrackNodeMap = Record<TrackId, TrackNode>;

/** The `TrackRenderDependencies` is built upon a normalized state of `TrackRenderData` */
export interface TrackRenderDependencies extends NormalState<TrackRenderMap> {
  topLevelIds: TrackId[];
}

/** A `TrackHierarchy` is built upon a normalized state of `TrackNodes` */
export interface TrackHierarchy extends NormalState<TrackNodeMap> {
  topLevelIds: TrackId[];
}

// ------------------------------------------------------------
// Track Hierarchy Initialization
// ------------------------------------------------------------

/** Create a track hierarchy. */
export const initializeTrackHierarchy = (): TrackHierarchy => ({
  ...createNormalState<TrackNodeMap>(),
  topLevelIds: [] as string[],
});

/** The default scale track node corresponds to the default scale track. */
export const defaultScaleTrackNode: TrackNode = {
  id: "default-scale-track",
  type: "scaleTrack",
  depth: 0,
  trackIds: ["default-pattern-track"],
  clipIds: [],
  transpositionIds: [],
};

/** The default pattern track node corresponds to the default pattern track. */
export const defaultPatternTrackNode: TrackNode = {
  id: "default-pattern-track",
  type: "patternTrack",
  depth: 1,
  trackIds: [],
  clipIds: [],
  transpositionIds: [],
};

/** The mock scale track node is used for testing. */
export const mockScaleTrackNode: TrackNode = {
  id: "mock-scale-track",
  type: "scaleTrack",
  depth: 0,
  trackIds: ["mock-pattern-track"],
  clipIds: [],
  transpositionIds: [],
};

/** The mock pattern track node is used for testing. */
export const mockPatternTrackNode: TrackNode = {
  id: "mock-pattern-track",
  type: "patternTrack",
  depth: 1,
  trackIds: [],
  clipIds: ["mock-clip"],
  transpositionIds: ["mock-transposition"],
};

/** The default track node state is used for initialization. */
export const defaultTrackNodeState: TrackNodeState =
  createNormalState<TrackNodeMap>([
    defaultScaleTrackNode,
    defaultPatternTrackNode,
  ]);

/** The default track hierarchy is used for Redux. */
export const defaultTrackHierarchy: TrackHierarchy = {
  ...defaultTrackNodeState,
  topLevelIds: [defaultScaleTrackNode.id],
};

// ------------------------------------------------------------
// Track Hierarchy Type Guards
// ------------------------------------------------------------

/** Checks if a given object is of type `TrackNode`. */
export const isTrackNode = (obj: unknown): obj is TrackNode => {
  const candidate = obj as TrackNode;
  return (
    isString(candidate.id) &&
    isString(candidate.type) &&
    isFiniteNumber(candidate.depth) &&
    isTypedArray(candidate.trackIds, isString) &&
    isTypedArray(candidate.clipIds, isString) &&
    isTypedArray(candidate.transpositionIds, isString)
  );
};

/** Checks if a given object is of type `TrackHierarchy`. */
export const isTrackHierarchy = (obj: unknown): obj is TrackHierarchy => {
  const candidate = obj as TrackHierarchy;
  return (
    isPlainObject(candidate) &&
    isTypedArray(candidate.allIds, isString) &&
    isTypedArray(candidate.topLevelIds, isString) &&
    areObjectKeysTyped(candidate.byId, isString) &&
    areObjectValuesTyped(candidate.byId, isTrackNode)
  );
};
