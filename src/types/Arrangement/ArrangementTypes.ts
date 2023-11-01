import { isPlainObject } from "lodash";
import { ClipMap, defaultClipState, isClip } from "types/Clip";
import {
  InstrumentMap,
  defaultInstrumentState,
  isInstrument,
} from "types/Instrument";
import {
  PatternTrackMap,
  defaultPatternTrackState,
  isPatternTrack,
} from "types/PatternTrack";
import {
  ScaleTrackMap,
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
  defaultTranspositionState,
  isTransposition,
} from "types/Transposition";
import {
  NormalState,
  isNormalRecord,
  isNormalState,
} from "utils/normalizedState";
import { UndoableHistory, createUndoableHistory } from "utils/undoableHistory";

// ------------------------------------------------------------
// Arrangement Definitions
// ------------------------------------------------------------

/** An arrangement stores track/media information in `NormalRecords` */
export interface Arrangement {
  tracks: TrackNodeMap;
  scaleTracks: ScaleTrackMap;
  patternTracks: PatternTrackMap;
  clips: ClipMap;
  transpositions: TranspositionMap;
}

/** The live arrangement stores track/media/instrument information. */
export interface LiveArrangement extends Arrangement {
  instruments: InstrumentMap;
}

/** A normal arrangement stores `NormalStates` instead of `NormalRecords` */
export interface NormalArrangement {
  scaleTracks: NormalState<ScaleTrackMap>;
  patternTracks: NormalState<PatternTrackMap>;
  clips: NormalState<ClipMap>;
  transpositions: NormalState<TranspositionMap>;
  hierarchy: TrackHierarchy;
}

/** A normal live arrangement stores a `NormalState` of the instruments as well. */
export interface NormalLiveArrangement extends NormalArrangement {
  instruments: NormalState<InstrumentMap>;
}

/** An undoable arrangement history is used for Redux. */
export type ArrangementHistory = UndoableHistory<NormalLiveArrangement>;

// ------------------------------------------------------------
// Arrangement Initialization
// ------------------------------------------------------------

/** The default live arrangement is used for initialization. */
export const defaultArrangement: NormalLiveArrangement = {
  scaleTracks: defaultScaleTrackState,
  patternTracks: defaultPatternTrackState,
  instruments: defaultInstrumentState,
  clips: defaultClipState,
  transpositions: defaultTranspositionState,
  hierarchy: defaultTrackHierarchy,
};

/** The undoable arrangement history is used for Redux. */
export const defaultArrangementHistory: ArrangementHistory =
  createUndoableHistory(defaultArrangement);

// ------------------------------------------------------------
// Arrangement Type Guards
// ------------------------------------------------------------

/** Checks if a given object is of type `Arrangement`. */
export const isArrangement = (obj: unknown): obj is Arrangement => {
  const candidate = obj as Arrangement;
  return (
    isPlainObject(candidate) &&
    isNormalRecord(candidate.tracks, isTrackNode) &&
    isNormalRecord(candidate.scaleTracks, isScaleTrack) &&
    isNormalRecord(candidate.patternTracks, isPatternTrack) &&
    isNormalRecord(candidate.clips, isClip) &&
    isNormalRecord(candidate.transpositions, isTransposition)
  );
};

/** Checks if a given object is of type `LiveArrangement`. */
export const isLiveArrangement = (obj: unknown): obj is LiveArrangement => {
  const candidate = obj as LiveArrangement;
  return (
    isArrangement(candidate) &&
    isNormalRecord(candidate.instruments, isInstrument)
  );
};

/** Checks if a given object is of type `NormalArrangement`. */
export const isNormalArrangement = (obj: unknown): obj is NormalArrangement => {
  const candidate = obj as NormalArrangement;
  return (
    isPlainObject(candidate) &&
    isNormalState(candidate.scaleTracks, isScaleTrack) &&
    isNormalState(candidate.patternTracks, isPatternTrack) &&
    isNormalState(candidate.clips, isClip) &&
    isNormalState(candidate.transpositions, isTransposition) &&
    isTrackHierarchy(candidate.hierarchy)
  );
};

/** Checks if a given object is of type `NormalLiveArrangement`. */
export const isNormalLiveArrangement = (
  obj: unknown
): obj is NormalLiveArrangement => {
  const candidate = obj as NormalLiveArrangement;
  return (
    isNormalArrangement(candidate) &&
    isNormalState(candidate.instruments, isInstrument)
  );
};
