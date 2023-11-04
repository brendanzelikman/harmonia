import { isPlainObject } from "lodash";
import { ClipMap, ClipState, defaultClipState, isClip } from "types/Clip";
import {
  InstrumentState,
  defaultInstrumentState,
  isInstrument,
} from "types/Instrument";
import {
  PatternTrackMap,
  PatternTrackState,
  defaultPatternTrackState,
  isPatternTrack,
} from "types/PatternTrack";
import { PortalState, defaultPortalState, isPortal } from "types/Portal";
import {
  ScaleTrackMap,
  ScaleTrackState,
  defaultScaleTrackState,
  isScaleTrack,
} from "types/ScaleTrack";
import {
  TrackHierarchy,
  TrackNodeMap,
  defaultTrackHierarchy,
  isTrackHierarchy,
  isTrackNode,
} from "types/TrackHierarchy";
import {
  TranspositionMap,
  TranspositionState,
  defaultTranspositionState,
  isTransposition,
} from "types/Transposition";
import { isNormalRecord, isNormalState } from "utils/normalizedState";
import { UndoableHistory, createUndoableHistory } from "utils/undoableHistory";

// ------------------------------------------------------------
// Arrangement Definitions
// ------------------------------------------------------------

/** A track arrangement stores track/media object maps. */
export interface TrackArrangement {
  tracks: TrackNodeMap;
  scaleTracks: ScaleTrackMap;
  patternTracks: PatternTrackMap;
  clips: ClipMap;
  transpositions: TranspositionMap;
}

/** A live arrangement stores the full track arrangement with instruments and portals. */
export interface LiveArrangement {
  hierarchy: TrackHierarchy;
  scaleTracks: ScaleTrackState;
  patternTracks: PatternTrackState;
  clips: ClipState;
  transpositions: TranspositionState;
  portals: PortalState;
  instruments: InstrumentState;
}

/** An undoable arrangement history is used for Redux. */
export type ArrangementHistory = UndoableHistory<LiveArrangement>;

// ------------------------------------------------------------
// Arrangement Initialization
// ------------------------------------------------------------

/** The default live arrangement is used for initialization. */
export const defaultArrangement: LiveArrangement = {
  hierarchy: defaultTrackHierarchy,
  scaleTracks: defaultScaleTrackState,
  patternTracks: defaultPatternTrackState,
  clips: defaultClipState,
  transpositions: defaultTranspositionState,
  portals: defaultPortalState,
  instruments: defaultInstrumentState,
};

/** The undoable arrangement history is used for Redux. */
export const defaultArrangementHistory: ArrangementHistory =
  createUndoableHistory(defaultArrangement);

// ------------------------------------------------------------
// Arrangement Type Guards
// ------------------------------------------------------------

/** Checks if a given object is of type `Arrangement`. */
export const isArrangement = (obj: unknown): obj is TrackArrangement => {
  const candidate = obj as TrackArrangement;
  return (
    isPlainObject(candidate) &&
    isNormalRecord(candidate.tracks, isTrackNode) &&
    isNormalRecord(candidate.scaleTracks, isScaleTrack) &&
    isNormalRecord(candidate.patternTracks, isPatternTrack) &&
    isNormalRecord(candidate.clips, isClip) &&
    isNormalRecord(candidate.transpositions, isTransposition)
  );
};

/** Checks if a given object is of type `NormalLiveArrangement`. */
export const isLiveArrangement = (obj: unknown): obj is LiveArrangement => {
  const candidate = obj as LiveArrangement;
  return (
    isPlainObject(candidate) &&
    isNormalState(candidate.scaleTracks, isScaleTrack) &&
    isNormalState(candidate.patternTracks, isPatternTrack) &&
    isNormalState(candidate.clips, isClip) &&
    isNormalState(candidate.transpositions, isTransposition) &&
    isTrackHierarchy(candidate.hierarchy) &&
    isNormalState(candidate.instruments, isInstrument) &&
    isNormalState(candidate.portals, isPortal)
  );
};
