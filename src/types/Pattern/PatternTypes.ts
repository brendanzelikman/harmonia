import { nanoid } from "@reduxjs/toolkit";
import { ScaleId } from "../Scale";
import { ID, Pitch, Tick, Velocity } from "../units";
import { InstrumentKey } from "../Instrument";

// Pattern Types

export type PatternId = ID;
export type PatternNoId = Omit<Pattern, "id">;
export type PatternWithOptions = Pattern & { options: PatternOptions };
export type PatternMap = Record<PatternId, Pattern>;

/**
 * A `Pattern` represents a sequential stream of notes.
 * @property `id` - The unique ID of the pattern.
 * @property `stream` - A sequential list of chords.
 * @property `name` - The name of the pattern.
 * @property `aliases` - Optional. A list of aliases for the pattern.
 * @property `options` - Optional. The pattern options.
 */
export interface Pattern {
  id: PatternId;
  stream: PatternStream;
  name: string;

  aliases?: string[];
  options?: Partial<PatternOptions>;
}

/**
 * A `PatternNote` is defined by a MIDI number, a duration, and a velocity.
 * @example
 * // A C4 note
 * { MIDI: 60, duration: 96, velocity: 127 }
 */
export type PatternNote = {
  MIDI: number;
  duration: Tick;
  velocity: Velocity;
};

/**
 * A `PatternChord` is a simultaneous collection of `PatternNotes`.
 * @example
 * // A C Major Chord
 * [{ MIDI: 60, duration: 96, velocity: 127 },
 * { MIDI: 64, duration: 96, velocity: 127 },
 * { MIDI: 67, duration: 96, velocity: 127 }]
 */
export type PatternChord = PatternNote[];

/**
 * A `PatternStream` is a sequential list of `PatternChords`.
 * @example
 * // A C Major Chord arpeggio
 * [[{ MIDI: 60, duration: 96, velocity: 127 }],
 * [{ MIDI: 64, duration: 96, velocity: 127 }],
 * [{ MIDI: 67, duration: 96, velocity: 127 }]]
 */
export type PatternStream = PatternChord[];

/**
 * The `PatternOptions` interface is a set of options that can be applied to a pattern.
 * @property `instrument` - The instrument to play the pattern with.
 * @property `tonic` - The tonic pitch of the pattern.
 * @property `scaleId` - The scale ID of the pattern.
 * @property `quantizeToScale` - Whether to quantize the pattern to the scale.
 */
export interface PatternOptions {
  instrumentKey: InstrumentKey;
  tonic: Pitch;
  scaleId: ScaleId;
  quantizeToScale: boolean;
}

/**
 * Initializes a `Pattern` with a unique ID.
 * @param pattern - Optional. `Partial<Pattern>` to override default values.
 * @returns An initialized `Pattern` with a unique ID.
 */
export const initializePattern = (
  pattern: Partial<PatternNoId> = defaultPattern
): Pattern => ({
  ...defaultPattern,
  ...pattern,
  id: nanoid(),
});

export const defaultPattern: PatternWithOptions = {
  id: "new-pattern",
  name: "New Pattern",
  stream: [],
  options: {
    instrumentKey: "grand_piano",
    tonic: "C",
    scaleId: "chromatic-scale",
    quantizeToScale: false,
  },
};

export const mockPattern: Pattern = {
  id: "mock-pattern",
  name: "Mock Pattern",
  stream: [[{ MIDI: 60, duration: 96, velocity: 127 }]],
  aliases: ["Mock Pattern"],
  options: defaultPattern.options,
};

/**
 * Checks if a given object is of type `Pattern`.
 * @param obj The object to check.
 * @returns True if the object is a `Pattern`, otherwise false.
 */
export const isPattern = (obj: unknown): obj is Pattern => {
  const candidate = obj as Pattern;
  return (
    candidate?.id !== undefined &&
    candidate?.stream !== undefined &&
    candidate?.name !== undefined
  );
};

/**
 * Checks if a given object is of type `PatternMap`.
 * @param obj The object to check.
 * @returns True if the object is a `PatternMap`, otherwise false.
 */
export const isPatternMap = (obj: unknown): obj is PatternMap => {
  const candidate = obj as PatternMap;
  return candidate !== undefined && Object.values(candidate).every(isPattern);
};

/**
 * Checks if a given object is of type `PatternNote`.
 * @param obj The object to check.
 * @returns True if the object is a `PatternNote`, otherwise false.
 */
export const isPatternNote = (obj: unknown): obj is PatternNote => {
  const candidate = obj as PatternNote;
  return (
    candidate?.MIDI !== undefined &&
    candidate?.duration !== undefined &&
    candidate?.velocity !== undefined
  );
};

/**
 * Checks if a given object is of type `PatternChord`.
 * @param obj The object to check.
 * @returns True if the object is a `PatternChord`, otherwise false.
 */
export const isPatternChord = (obj: unknown): obj is PatternChord => {
  const candidate = obj as PatternChord;
  return candidate !== undefined && candidate?.every(isPatternNote);
};

/**
 * Checks if a given object is of type `PatternStream`.
 * @param obj The object to check.
 * @returns True if the object is a `PatternStream`, otherwise false.
 */
export const isPatternStream = (obj: unknown): obj is PatternStream => {
  const candidate = obj as PatternStream;
  return candidate !== undefined && candidate?.every(isPatternChord);
};
