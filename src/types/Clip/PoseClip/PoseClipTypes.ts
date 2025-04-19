import { EntityState } from "@reduxjs/toolkit";
import { IClip, IClipId } from "../ClipTypes";
import { PoseStream, PoseBlock } from "types/Pose/PoseTypes";
import { Update } from "types/units";
import { createId } from "types/utils";
import { Portaled, PortaledClipId } from "types/Portal/PortalTypes";

// ------------------------------------------------------------
// Pose Clip Definitions
// ------------------------------------------------------------

export type PoseClip = IClip<"pose">;
export type PoseClipId = IClipId<"pose">;
export type PoseClipUpdate = Update<PoseClip>;
export type PoseClipStream = PoseStream;
export type PoseClipBlock = PoseBlock;
export type PoseClipMap = Record<PoseClipId, PoseClip>;
export type PoseClipState = EntityState<PoseClip, PoseClipId>;
export type PortaledPoseClip = Portaled<PoseClip>;
export type PortaledPoseClipId = PortaledClipId<PoseClipId>;
export type PortaledPoseClipMap = Record<PortaledPoseClipId, PortaledPoseClip>;

// ------------------------------------------------------------
// Pose Clip Initialization
// ------------------------------------------------------------

/** The default pose clip is used for initialization. */
export const defaultPoseClip: PoseClip = {
  id: createId("pose-clip"),
  trackId: "pattern-track_1",
  tick: 0,
  poseId: createId("pose"),
};

/** Create a pose clip with a unique ID. */
export const initializePoseClip = (
  clip: Partial<PoseClip> = defaultPoseClip
): PoseClip => ({
  ...defaultPoseClip,
  ...clip,
  id: createId(`pose-clip`),
});

// ------------------------------------------------------------
// Pose Clip Type Guards
// ------------------------------------------------------------

/** Checks if a given clip is a `PoseClip` (fast) */
export const isPoseClip = (clip: Partial<IClip>): clip is IClip<"pose"> => {
  return isPoseClipId(clip.id);
};

/** Checks if a given string is a `PoseClipId`. */
export const isPoseClipId = (id: unknown): id is PoseClipId => {
  return (id as string).startsWith("po");
};

/** Checks if a given clip is a `PortaledPoseClip`. */
export const isPortaledPoseClip = (
  clip: Partial<IClip>
): clip is PortaledPoseClip => {
  return isPoseClip(clip);
};

/** Checks if a given string is a `PortaledPoseClipId`. */
export const isPortaledPoseClipId = (id: unknown): id is PortaledPoseClipId => {
  return isPoseClipId(id);
};
