import { Dictionary, EntityState } from "@reduxjs/toolkit";
import { IClip, IClipId } from "../ClipTypes";
import { Tick, Update } from "types/units";
import { createId } from "types/util";
import {
  PatternNote,
  PatternMidiNote,
  PatternRest,
} from "types/Pattern/PatternTypes";
import { Portaled, PortaledClipId } from "types/Portal/PortalTypes";
import { isObject, isString } from "lodash";

// ------------------------------------------------------------
// Pattern Clip Definitions
// ------------------------------------------------------------

// Pattern Clip Types
export type PatternClip = IClip<"pattern">;
export type PatternClipId = IClipId<"pattern">;
export type PatternClipUpdate = Update<PatternClip>;
export type PatternClipMap = Dictionary<PatternClip>;
export type PatternClipState = EntityState<PatternClip>;

// Portaled Clip Types
export type PortaledPatternClip = Portaled<PatternClip>;
export type PortaledPatternClipId = PortaledClipId<PatternClipId>;
export type PortaledPatternClipMap = Record<
  PortaledPatternClipId,
  PortaledPatternClip
>;

// Clip Stream Types
export type PatternClipStream = PatternClipBlock[];
export type PatternClipBlock = {
  notes: PatternNote[];
  startTick: Tick;
  strumIndex?: number;
};

// Midi Stream Types
export type PatternClipMidiStream = PatternClipMidiBlock[];
export type PatternClipMidiBlock = {
  notes: (PatternMidiNote | PatternRest)[];
  startTick: Tick;
  strumIndex?: number;
};

// ------------------------------------------------------------
// Pattern Clip Initialization
// ------------------------------------------------------------

/** Create a pattern clip with a unique ID. */
export const initializePatternClip = (
  clip: Partial<PatternClip>
): PatternClip => ({
  trackId: createId("pattern-track"),
  patternId: createId("pattern"),
  tick: 0,
  offset: 0,
  ...clip,
  type: "pattern",
  id: createId(`pattern-clip`),
});

// ------------------------------------------------------------
// Pattern Clip Type Guards
// ------------------------------------------------------------

/** Checks if a given clip is a `PatternClip` (fast) */
export const isPatternClip = (clip?: Partial<IClip>): clip is PatternClip => {
  return isPatternClipId(clip?.id);
};

/** Checks if a given string is a `PatternClipId`. */
export const isPatternClipId = (id: unknown): id is PatternClipId => {
  return isString(id) && id.startsWith("pa");
};

/** Checks if a given clip is a `PortaledPatternClip`. */
export const isPortaledPatternClip = (
  clip: unknown
): clip is PortaledPatternClip => {
  return isObject(clip) && "type" in clip && clip.type === "pattern";
};

/** Checks if a given ID is a `PortaledPatternClipId`. */
export const isPortaledPatternClipId = (
  id: unknown
): id is PortaledPatternClipId => {
  return isPatternClipId(id);
};
