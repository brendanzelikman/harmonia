import { nanoid } from "@reduxjs/toolkit";
import {
  MidiObject,
  ScaleId,
  ScaleNoteObject,
  isMidiObject,
  isScaleNoteObject,
} from "../Scale";
import { ID } from "../units";
import { InstrumentKey } from "../Instrument";
import { TrackId } from "types/Track";
import { isPlainObject, isString } from "lodash";
import {
  NormalRecord,
  NormalState,
  createNormalState,
} from "utils/normalizedState";
import { UndoableHistory, createUndoableHistory } from "utils/undoableHistory";
import {
  isBoundedNumber,
  isFiniteNumber,
  isOptionalType,
  isOptionalTypedArray,
  isTypedArray,
} from "types/util";
import { getKeyCount } from "utils/objects";
import { Timed, Playable, Chord, Stream } from "types/units";

// ------------------------------------------------------------
// Pattern Generics
// ------------------------------------------------------------

export type PatternId = ID;
export type PatternNoId = Omit<Pattern, "id">;
export type PatternPartial = Partial<Pattern>;
export type PatternUpdate = Partial<Pattern> & { id: PatternId };
export type PatternMap = NormalRecord<PatternId, Pattern>;
export type PatternState = NormalState<PatternMap>;
export type PatternHistory = UndoableHistory<PatternState>;

/** A `PatternRest` is a non-playable note with a duration. */
export type PatternRest = Timed<{}>;

/** A `PatternNote` is a playable note with a duration. */
export type PatternNote = Playable<ScaleNoteObject>;
export type PatternMidiNote = Playable<MidiObject>;

/** A `PatternChord` is a group of `PatternNotes` */
export type PatternChord = Chord<PatternNote>;
export type PatternMidiChord = Chord<PatternMidiNote>;

/** A `PatternBlock` is a `PatternChord` or a `PatternRest` */
export type PatternBlock = PatternChord | PatternRest;
export type PatternMidiBlock = PatternMidiChord | PatternRest;

/** A `PatternStream` is a sequence of `PatternChords` and `PatternRests`. */
export type PatternStream = Stream<PatternBlock>;
export type PatternMidiStream = Stream<PatternMidiBlock>;

/** A `Pattern` contains an ID and a sequential list of chords. */
export interface Pattern {
  id: PatternId;
  stream: PatternStream;
  name?: string;
  aliases?: string[];
  instrumentKey?: InstrumentKey;
  patternTrackId?: TrackId;
}

// ------------------------------------------------------------
// Pattern Initialization
// ------------------------------------------------------------

/** Create a pattern with a unique ID. */
export const initializePattern = (
  pattern: Partial<PatternNoId> = defaultPattern
): Pattern => ({ ...defaultPattern, ...pattern, id: nanoid() });

/** The default pattern is used for initialization. */
export const defaultPattern: Pattern = {
  id: "new-pattern",
  name: "New Pattern",
  stream: [],
};

/** The default pattern state is used for Redux. */
export const defaultPatternState = createNormalState<PatternMap>([
  defaultPattern,
]);

/** The undoable pattern history is used for Redux. */
export const defaultPatternHistory: PatternHistory =
  createUndoableHistory<PatternState>(defaultPatternState);

// ------------------------------------------------------------
// Pattern Type Guards
// ------------------------------------------------------------

/** Checks if a given object is a timed note. */
export const isTimedNote = <T = unknown>(obj: T): obj is Timed<T> => {
  const candidate = obj as Timed<unknown>;
  return isPlainObject(candidate) && isFiniteNumber(candidate.duration);
};

/** Checks if a given object is a playable note. */
export const isPlayableNote = (obj: unknown): obj is Playable<unknown> => {
  const candidate = obj as Playable<unknown>;
  return isTimedNote(candidate) && isBoundedNumber(candidate.velocity, 0, 127);
};

/** Checks if a given object is a rest note. */
export const isPatternRest = (obj: unknown): obj is PatternRest => {
  const candidate = obj as PatternNote;
  return isTimedNote(candidate) && getKeyCount(candidate) === 1;
};

/** Checks if a given object is of type `PatternNote`. */
export const isPatternNote = (obj: unknown): obj is PatternNote => {
  const candidate = obj as PatternNote;
  return isScaleNoteObject(candidate) && isPlayableNote(candidate);
};

/** Checks if a given object is of type `PatternMidiNote`. */
export const isPatternMidiNote = (obj: unknown): obj is PatternMidiNote => {
  const candidate = obj as PatternMidiNote;
  return isMidiObject(candidate) && isFiniteNumber(candidate.duration);
};

/** Checks if a given object is of type `PatternChord`. */
export const isPatternChord = (obj: unknown): obj is PatternChord => {
  const candidate = obj as PatternChord;
  return isTypedArray(candidate, isPatternNote);
};

/** Checks if a given object is of type `PatternMidiChord`. */
export const isPatternMidiChord = (obj: unknown): obj is PatternMidiChord => {
  const candidate = obj as PatternMidiChord;
  return isTypedArray(candidate, isPatternMidiNote);
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

/** Checks if a given object is of type `PatternStream`. */
export const isPatternStream = (obj: unknown): obj is PatternStream => {
  const candidate = obj as PatternStream;
  return isTypedArray(candidate, isPatternBlock);
};

/** Checks if a given object is of type `PatternMidiStream`. */
export const isPatternMidiStream = (obj: unknown): obj is PatternMidiStream => {
  const candidate = obj as PatternMidiStream;
  return isTypedArray(candidate, isPatternMidiBlock);
};

/** Checks if a given object is of type `Pattern`. */
export const isPattern = (obj: unknown): obj is Pattern => {
  const candidate = obj as Pattern;
  return (
    isPlainObject(candidate) &&
    isString(candidate.id) &&
    isPatternStream(candidate.stream) &&
    isOptionalType(candidate.name, isString) &&
    isOptionalType(candidate.instrumentKey, isString) &&
    isOptionalTypedArray(candidate.aliases, isString)
  );
};
