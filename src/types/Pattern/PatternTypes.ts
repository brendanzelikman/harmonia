import { EntityState } from "@reduxjs/toolkit";
import { Id, Plural, Tick } from "../units";
import { createId, isObject, isString } from "types/utils";
import { isBounded, isFinite } from "utils/math";
import { Timed, Playable } from "types/units";
import {
  ScaleNoteObject,
  isScaleNoteObject,
  isMidiObject,
  NestedNote,
  isMidiValue,
} from "types/Scale/ScaleTypes";
import { MidiObject } from "utils/midi";
import { isArray } from "lodash";

// ------------------------------------------------------------
// Pattern Generics
// ------------------------------------------------------------

export type PatternId = Id<"pattern">;
export type PatternNoId = Omit<Pattern, "id">;
export type PatternPartial = Partial<Pattern>;
export type PatternUpdate = Partial<Pattern> & { id: PatternId };
export type PatternMap = Record<PatternId, Pattern>;
export type PatternState = EntityState<Pattern, PatternId>;

// ------------------------------------------------------------
// Pattern Definitions
// ------------------------------------------------------------

export type StrummedChord<T> = {
  chord: T[];
  strumRange: [Tick, Tick];
  strumDirection: "up" | "down";
};

/** A `PatternRest` is a non-playable note with a duration. */
export type PatternRest = { duration: Tick };

/** A `PatternNote` is a playable note with a duration. */
export type PatternNote = Playable<ScaleNoteObject>;
export type PatternNestedNote = Playable<NestedNote>;
export type PatternMidiNote = Playable<MidiObject>;

/** A `PatternChord` is a group of `PatternNotes` */
export type PatternBlockedChord = Plural<PatternNote>;
export type PatternBlockedMidiChord = Plural<PatternMidiNote>;
export type PatternStrummedChord = StrummedChord<PatternNote>;
export type PatternStrummedMidiChord = StrummedChord<PatternMidiNote>;
export type PatternChord = PatternBlockedChord | PatternStrummedChord;
export type PatternMidiChord =
  | PatternBlockedMidiChord
  | PatternStrummedMidiChord;

/** A `PatternBlock` is a `PatternChord` or a `PatternRest` */
export type PatternBlock = PatternChord | PatternRest;
export type PatternMidiBlock = PatternMidiChord | PatternRest;

/** A `PatternStream` is a sequence of `PatternBlocks`. */
export type PatternStream = Array<PatternBlock>;
export type PatternMidiStream = Array<PatternMidiBlock>;

/** A `Pattern` contains a sequential list of chords. */
export interface Pattern {
  id: PatternId;
  stream: PatternStream;
  name?: string;
  aliases?: string[];
  projectId?: string;
}

/** A `PresetPattern` has its id prefixed */
export type PresetPattern = Pattern & { id: Id<`pattern_preset`> };

// ------------------------------------------------------------
// Pattern Initialization
// ------------------------------------------------------------

/** Create a pattern with a unique ID. */
export const initializePattern = (
  pattern: Partial<PatternNoId> = defaultPattern
): Pattern => ({ ...defaultPattern, ...pattern, id: createId("pattern") });

/** The default pattern is used for initialization. */
export const defaultPattern: Pattern = {
  id: createId("pattern"),
  stream: [],
};

// ------------------------------------------------------------
// Pattern Type Guards
// ------------------------------------------------------------

/** Checks if a given object is a timed note. */
export const isTimedNote = <T = unknown>(obj: T): obj is Timed<T> => {
  const candidate = obj as Timed<unknown>;
  return isObject(candidate) && isFinite(candidate.duration);
};

/** Checks if a given object is a playable note. */
export const isPlayableNote = (obj: unknown): obj is Playable<unknown> => {
  const candidate = obj as Playable<unknown>;
  return isTimedNote(candidate) && isBounded(candidate.velocity, 0, 127);
};

/** Checks if a given object is a rest note. */
export const isPatternRest = (obj: unknown): obj is PatternRest => {
  const candidate = obj as PatternNote & { MIDI?: number; degree?: number };
  return (
    (isObject(obj) &&
      "duration" in candidate &&
      !isMidiValue(candidate.MIDI) &&
      !isMidiValue(candidate.degree)) ||
    (isArray(obj) && obj.every(isPatternRest))
  );
};

/** Checks if a given object is of type `PatternNote`. */
export const isPatternNote = (obj: unknown): obj is PatternNote => {
  if (obj === undefined) return false;
  const candidate = obj as PatternNote;
  return isScaleNoteObject(candidate) && isPlayableNote(candidate);
};

/** Checks if a given object is of type `PatternMidiNote`. */
export const isPatternMidiNote = (obj: unknown): obj is PatternMidiNote => {
  if (obj === undefined) return false;
  const candidate = obj as PatternMidiNote;
  return isMidiObject(candidate);
};

/** Checks if a given object is of type `PatternBlockedChord`. */
export const isPatternBlockedChord = (
  obj: unknown
): obj is PatternBlockedChord => {
  if (obj === undefined) return false;
  const candidate = obj as PatternBlockedChord;
  return Array.isArray(candidate);
};

/** Checks if a given object is of type `PatternStrummedChord`. */
export const isPatternStrummedChord = (
  obj: unknown
): obj is PatternStrummedChord => {
  return isObject(obj) && "strumDirection" in obj;
};

/** Checks if a given object is of type `PatternChord`. */
export const isPatternChord = (obj: unknown): obj is PatternChord => {
  const candidate = obj as PatternChord;
  return (
    isPatternNote(candidate) ||
    isPatternBlockedChord(candidate) ||
    isPatternStrummedChord(candidate)
  );
};

/** Checks if a given object is of type `PatternMidiChord`. */
export const isPatternMidiChord = (obj: unknown): obj is PatternMidiChord => {
  const candidate = obj as PatternMidiChord;
  return (
    isPatternMidiNote(candidate) ||
    (Array.isArray(candidate) && candidate.some(isPatternMidiNote)) ||
    isPatternStrummedChord(candidate)
  );
};

/** Checks if a given object is of type `PatternBlock`. */
export const isPatternBlock = (obj: unknown): obj is PatternBlock => {
  const candidate = obj as PatternBlock;
  return isPatternChord(candidate) || isPatternRest(candidate);
};

/** Checks if a given object is of type `PatternMidiBlock`. */
export const isPatternMidiBlock = (obj: unknown): obj is PatternMidiBlock => {
  const candidate = obj as PatternMidiBlock;
  return isPatternMidiChord(candidate) || isPatternRest(candidate);
};

/** Checks if a given object is of type `PatternStrummedMidiChord`. */
export const isPatternStrummedMidiChord = (
  obj: unknown
): obj is PatternStrummedMidiChord => {
  return isObject(obj) && "strumDirection" in obj;
};

/** Checks if a given object is of type `PatternStream`. */
export const isPatternStream = (obj: unknown): obj is PatternStream => {
  const candidate = obj as PatternStream;
  return (
    Array.isArray(candidate) &&
    isObject(candidate[0]) &&
    "duration" in candidate[0]
  );
};

/** Checks if a given object is of type `PatternMidiStream`. */
export const isPatternMidiStream = (obj: unknown): obj is PatternMidiStream => {
  const candidate = obj as PatternMidiStream;
  return Array.isArray(candidate) && isPatternMidiBlock(candidate[0]);
};

/** Checks if a given object is of type `Pattern`. */
export const isPattern = (obj: unknown): obj is Pattern => {
  const candidate = obj as Pattern;
  return isObject(candidate) && isPatternId(candidate.id);
};

/** Checks if a given object is of type `PatternId`. */
export const isPatternId = (obj: unknown): obj is PatternId => {
  const candidate = obj as PatternId;
  return isString(candidate) && candidate.startsWith("pattern");
};
