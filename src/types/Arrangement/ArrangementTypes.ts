import {
  defaultPatternClipState,
  defaultPoseClipState,
  defaultScaleClipState,
} from "types/Clip/ClipSlice";
import {
  PatternClipMap,
  PoseClipMap,
  ScaleClipMap,
  PatternClipState,
  PoseClipState,
  ScaleClipState,
} from "types/Clip/ClipTypes";
import { ClipsByTrack } from "types/Clip/ClipUtils";
import {
  defaultInstrumentState,
  InstrumentState,
} from "types/Instrument/InstrumentTypes";
import { defaultPortalState } from "types/Portal/PortalSlice";
import { PortalState } from "types/Portal/PortalTypes";
import { PatternTrackState } from "types/Track/PatternTrack/PatternTrackTypes";
import {
  ScaleTrackId,
  ScaleTrackState,
} from "types/Track/ScaleTrack/ScaleTrackTypes";
import {
  defaultPatternTrackState,
  defaultScaleTrackState,
} from "types/Track/TrackSlice";
import { TrackId, TrackMap } from "types/Track/TrackTypes";

// ------------------------------------------------------------
// Arrangement Types
// ------------------------------------------------------------

export type ChainIdsByTrack = Record<TrackId, ScaleTrackId[]>;

/** A track arrangement stores track/clip object maps. */
export interface TrackArrangement {
  tracks: TrackMap;
  clips: {
    pattern: PatternClipMap;
    pose: PoseClipMap;
    scale: ScaleClipMap;
  };
  clipsByTrack: ClipsByTrack;
  chainIdsByTrack: ChainIdsByTrack;
}

/** A live arrangement stores the full track arrangement with instruments and portals. */
export interface LiveArrangement {
  patternTracks: PatternTrackState;
  scaleTracks: ScaleTrackState;
  clips: {
    pattern: PatternClipState;
    pose: PoseClipState;
    scale: ScaleClipState;
  };
  instruments: InstrumentState;
  portals: PortalState;
}

// ------------------------------------------------------------
// Arrangement Initialization
// ------------------------------------------------------------

/** The default live arrangement is used for initialization. */
export const defaultArrangement: LiveArrangement = {
  patternTracks: defaultPatternTrackState,
  scaleTracks: defaultScaleTrackState,
  clips: {
    pattern: defaultPatternClipState,
    pose: defaultPoseClipState,
    scale: defaultScaleClipState,
  },
  portals: defaultPortalState,
  instruments: defaultInstrumentState,
};
