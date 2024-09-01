import { Dictionary, EntityState } from "@reduxjs/toolkit";
import { IClip, IClipId, isClipId } from "../ClipTypes";
import { Tick, Update } from "types/units";
import { createId } from "types/util";
import { isClipInterface } from "../ClipTypes";
import { PatternNote, PatternMidiNote } from "types/Pattern/PatternTypes";
import { Portaled, PortaledClipId } from "types/Portal/PortalTypes";

// ------------------------------------------------------------
// Pattern Clip Definitions
// ------------------------------------------------------------

export type PatternClip = IClip<"pattern">;
export type PatternClipId = IClipId<"pattern">;

export type PatternClipStream = PatternClipBlock[];
export type PatternClipBlock = {
  notes: PatternNote[];
  startTick: Tick;
  strumIndex?: number;
};
export type PatternClipMidiStream = PatternClipMidiBlock[];
export type PatternClipMidiBlock = {
  notes: PatternMidiNote[];
  startTick: Tick;
  strumIndex?: number;
};

export type PatternClipUpdate = Update<PatternClip>;
export type PatternClipMap = Dictionary<PatternClip>;
export type PatternClipState = EntityState<PatternClip>;

export type PortaledPatternClip = Portaled<PatternClip>;
export type PortaledPatternClipId = PortaledClipId<PatternClipId>;

// ------------------------------------------------------------
// Pattern Clip Initialization
// ------------------------------------------------------------

/** The default pattern clip is used for initialization. */
export const defaultPatternClip: PatternClip = {
  id: createId("pattern-clip"),
  type: "pattern",
  trackId: "pattern-track_1",
  tick: 0,
  offset: 0,
  patternId: "pattern_default",
};

/** Create a pattern clip with a unique ID. */
export const initializePatternClip = (
  clip: Partial<PatternClip> = defaultPatternClip
): PatternClip => ({
  ...defaultPatternClip,
  ...clip,
  id: createId(`pattern-clip`),
});

// ------------------------------------------------------------
// Pattern Clip Type Guards
// ------------------------------------------------------------

/** Checks if a given clip is the `Pattern` ClipType. */
export const isIPatternClip = (obj: unknown): obj is IClip<"pattern"> => {
  return isClipInterface(obj, "pattern");
};

/** Checks if a given clip is a `PatternClip` (fast) */
export const isPatternClip = (clip?: Partial<IClip>): clip is PatternClip => {
  return isPatternClipId(clip?.id);
};

/** Checks if a given string is a `PatternClipId`. */
export const isPatternClipId = (id: unknown): id is PatternClipId => {
  return isClipId(id, "pattern");
};
