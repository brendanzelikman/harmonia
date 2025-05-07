import {
  defaultPatternClipState,
  defaultPoseClipState,
} from "types/Clip/ClipSlice";
import {
  PatternClipMap,
  PoseClipMap,
  PatternClipState,
  PoseClipState,
  PoseClip,
} from "types/Clip/ClipTypes";
import {
  defaultInstrumentState,
  InstrumentState,
} from "types/Instrument/InstrumentTypes";
import { defaultPatternState } from "types/Pattern/PatternSlice";
import { Pattern, PatternState } from "types/Pattern/PatternTypes";
import { defaultPortalState } from "types/Portal/PortalSlice";
import { PortalState } from "types/Portal/PortalTypes";
import { defaultPoseState } from "types/Pose/PoseSlice";
import { Pose, PoseState } from "types/Pose/PoseTypes";
import { defaultScaleState } from "types/Scale/ScaleSlice";
import { ScaleState } from "types/Scale/ScaleTypes";
import { PatternTrack } from "types/Track/PatternTrack/PatternTrackTypes";
import { ScaleTrackId } from "types/Track/ScaleTrack/ScaleTrackTypes";
import { defaultTrackState } from "types/Track/TrackSlice";
import { TrackId, TrackMap, TrackState } from "types/Track/TrackTypes";

// ------------------------------------------------------------
// Arrangement Types
// ------------------------------------------------------------

export type ChainIdsByTrack = Record<TrackId, ScaleTrackId[]>;
export type PatternTracksByTrack = Record<TrackId, PatternTrack[]>;
export type TrackPoseClips = Record<TrackId, PoseClip[]>;
export type Motif = Pattern | Pose;

/** A track arrangement stores track/clip object maps. */
export interface TrackArrangement {
  tracks: TrackMap;
  scales: ScaleState;
  patterns: PatternState;
  poses: PoseState;
  patternClips: PatternClipMap;
  poseClips: PoseClipMap;
  trackPoseClips: TrackPoseClips;
  chainIdsByTrack: ChainIdsByTrack;
}

/** A live arrangement stores the full track arrangement with instruments and portals. */
export interface LiveArrangement {
  tracks: TrackState;
  patternClips: PatternClipState;
  poseClips: PoseClipState;
  scales: ScaleState;
  patterns: PatternState;
  poses: PoseState;
  instruments: InstrumentState;
  portals: PortalState;
}

// ------------------------------------------------------------
// Arrangement Initialization
// ------------------------------------------------------------

/** The default live arrangement is used for initialization. */
export const defaultArrangement: LiveArrangement = {
  tracks: defaultTrackState,
  patternClips: defaultPatternClipState,
  poseClips: defaultPoseClipState,
  scales: defaultScaleState,
  patterns: defaultPatternState,
  poses: defaultPoseState,
  portals: defaultPortalState,
  instruments: defaultInstrumentState,
};
