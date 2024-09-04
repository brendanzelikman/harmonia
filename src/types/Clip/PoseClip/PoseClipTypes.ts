import { Dictionary, EntityState, nanoid } from "@reduxjs/toolkit";
import { IClip, IClipId, isClipId } from "../ClipTypes";
import { isClipInterface } from "../ClipTypes";
import { PoseStream, PoseBlock } from "types/Pose/PoseTypes";
import { Update } from "types/units";
import { createId } from "types/util";
import { Portaled, PortaledClipId } from "types/Portal/PortalTypes";

// ------------------------------------------------------------
// Pose Clip Definitions
// ------------------------------------------------------------

export type PoseClip = IClip<"pose">;
export type PoseClipId = IClipId<"pose">;
export type PoseClipUpdate = Update<PoseClip>;
export type PoseClipStream = PoseStream;
export type PoseClipBlock = PoseBlock;
export type PoseClipMap = Dictionary<PoseClip>;
export type PoseClipState = EntityState<PoseClip>;
export type PortaledPoseClip = Portaled<PoseClip>;
export type PortaledPoseClipId = PortaledClipId<PoseClipId>;

// ------------------------------------------------------------
// Pose Clip Initialization
// ------------------------------------------------------------

/** The default pose clip is used for initialization. */
export const defaultPoseClip: PoseClip = {
  id: createId("pose-clip"),
  type: "pose",
  trackId: "pattern-track_1",
  tick: 0,
  offset: 0,
  poseId: "pose_default",
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

/** Checks if a given object is of type `PoseClip`. */
export const isIPoseClip = (obj: unknown): obj is PoseClip => {
  return isClipInterface<"pose">(obj, "pose");
};

/** Checks if a given clip is a `PoseClip` (fast) */
export const isPoseClip = (clip: Partial<IClip>): clip is IClip<"pose"> => {
  return isPoseClipId(clip.id);
};

/** Checks if a given string is a `PoseClipId`. */
export const isPoseClipId = (id: unknown): id is PoseClipId => {
  return isClipId(id, "pose");
};
