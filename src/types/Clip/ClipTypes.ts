import { Id, Tick, Update } from "types/units";
import { PatternClipColor } from "./PatternClip/PatternClipThemes";
import {
  isPatternClip,
  PatternClip,
  PatternClipId,
} from "./PatternClip/PatternClipTypes";
import { isPoseClip, PoseClip, PoseClipId } from "./PoseClip/PoseClipTypes";
import { initializePatternClip } from "./PatternClip/PatternClipTypes";
import { initializePoseClip } from "./PoseClip/PoseClipTypes";
import { PatternId } from "types/Pattern/PatternTypes";
import { PoseId } from "types/Pose/PoseTypes";
import { TrackId } from "types/Track/TrackTypes";
import { Portaled } from "types/Portal/PortalTypes";

export * from "./PatternClip/PatternClipTypes";
export * from "./PoseClip/PoseClipTypes";

// ------------------------------------------------------------
// Motif Definitions
// ------------------------------------------------------------

export const CLIP_TYPES = ["pattern", "pose"] as const;
export type ClipType = (typeof CLIP_TYPES)[number];
export type Clip = PatternClip | PoseClip;
export type ClipId = PatternClipId | PoseClipId;
export type ClipUpdate = Update<Clip>;
export type ClipMap = Record<ClipId, Clip>;
export type PortaledClip = Portaled<Clip>;
export type PortaledClipId = PortaledClip["id"];

// ------------------------------------------------------------
// Generic Clip Definitions
// ------------------------------------------------------------

/** A `Clip` contains any element placed in a track at a specific tick. */
export type IClip<T extends ClipType = ClipType> = {
  id: IClipId<T>;
  trackId: TrackId;
  tick: Tick;
  offset?: Tick;
  duration?: Tick;
  name?: string;
} & IClipProps<T>;

/** A `Clip` can have extra props based on its type. */
export type IClipProps<T extends ClipType> = T extends "pattern"
  ? { patternId: PatternId; color?: PatternClipColor }
  : T extends "pose"
  ? { poseId: PoseId }
  : never;

export type IClipId<T extends ClipType = ClipType> = Id<`${T}-clip`>;

// ------------------------------------------------------------
// Clip Initialization
// ------------------------------------------------------------

/** Create a clip with a unique ID. */
export function initializeClip<T extends ClipType>(
  clip: Partial<IClip<T>> & { id: IClipId<T> }
): Clip {
  if (isPatternClip(clip))
    return initializePatternClip(clip as Partial<PatternClip>);
  else if (isPoseClip(clip))
    return initializePoseClip(clip as Partial<PoseClip>);
  throw new Error(`Invalid clip type`);
}

/** Get the underlying motif ID of a clip. */
export const getClipMotifId = (clip?: Partial<Clip>) => {
  if (clip === undefined) return undefined;
  if (isPatternClip(clip)) return clip.patternId;
  if (isPoseClip(clip)) return clip.poseId;
};
