import { Dictionary, EntityState, nanoid } from "@reduxjs/toolkit";
import { IClipId, isClipId, IClip } from "../ClipTypes";
import { isClipInterface } from "../ClipTypes";
import { createId, Update } from "types/units";
import { Portaled, PortaledClipId } from "types/Portal/PortalTypes";

// ------------------------------------------------------------
// Scale Clip Definitions
// ------------------------------------------------------------

export type ScaleClip = IClip<"scale">;
export type ScaleClipId = IClipId<"scale">;
export type ScaleClipUpdate = Update<ScaleClip>;
export type ScaleClipMap = Dictionary<ScaleClip>;
export type ScaleClipState = EntityState<ScaleClip>;
export type PortaledScaleClip = Portaled<ScaleClip>;
export type PortaledScaleClipId = PortaledClipId<ScaleClipId>;

// ------------------------------------------------------------
// Scale Clip Initialization
// ------------------------------------------------------------

/** The default scale clip is used for initialization. */
export const defaultScaleClip: ScaleClip = {
  id: createId("scale-clip"),
  type: "scale",
  trackId: "scale-track_1",
  tick: 0,
  offset: 0,
  scaleId: "scale_default-nested",
};

/** Create a scale clip with a unique ID. */
export const initializeScaleClip = (
  clip: Partial<ScaleClip> = defaultScaleClip
): ScaleClip => ({
  ...defaultScaleClip,
  ...clip,
  id: createId(`scale-clip`),
});

// ------------------------------------------------------------
// Scale Clip Type Guards
// ------------------------------------------------------------

/** Checks if a given object is of type `ScaleClip`. */
export const isIScaleClip = (obj: unknown): obj is ScaleClip => {
  return isClipInterface<"scale">(obj, "scale");
};

/** Checks if a given clip is a `ScaleClip` (fast) */
export const isScaleClip = (clip: Partial<IClip>): clip is IClip<"scale"> => {
  return isScaleClipId(clip.id);
};

/** Checks if a given string is a `ScaleClipId`. */
export const isScaleClipId = (id: unknown): id is ScaleClipId => {
  return isClipId<"scale">(id, "scale");
};
