import { isPlainObject } from "lodash";
import { ClipMap, ClipState, defaultClipState, isClip } from "types/Clip";
import {
  InstrumentState,
  defaultInstrumentState,
  isInstrument,
} from "types/Instrument";
import { PortalState, defaultPortalState, isPortal } from "types/Portal";
import { isNormalRecord, isNormalState } from "utils/normalizedState";
import { UndoableHistory, createUndoableHistory } from "utils/undoableHistory";
import { TrackMap, TrackState, defaultTrackState, isTrack } from "types/Track";

// ------------------------------------------------------------
// Arrangement Definitions
// ------------------------------------------------------------

/** A track arrangement stores track/clip object maps. */
export interface TrackArrangement {
  tracks: TrackMap;
  clips: ClipMap;
}

/** A live arrangement stores the full track arrangement with instruments and portals. */
export interface LiveArrangement {
  tracks: TrackState;
  clips: ClipState;
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
  tracks: defaultTrackState,
  clips: defaultClipState,
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
    isNormalRecord(candidate.tracks, isTrack) &&
    isNormalRecord(candidate.clips, isClip)
  );
};

/** Checks if a given object is of type `NormalLiveArrangement`. */
export const isLiveArrangement = (obj: unknown): obj is LiveArrangement => {
  const candidate = obj as LiveArrangement;
  return (
    isPlainObject(candidate) &&
    isNormalState(candidate.tracks, isTrack) &&
    isNormalState(candidate.clips, isClip) &&
    isNormalState(candidate.instruments, isInstrument) &&
    isNormalState(candidate.portals, isPortal)
  );
};
