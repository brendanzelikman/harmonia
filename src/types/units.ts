export type ID = string;
export type XML = string;
export type JSON<_> = string;

// This is a pattern of any type
type Pattern<T> = Array<T>;

// TIME

// A tick is a standardized unit of time dependent on the BPM and PPQ
export type Tick = number;
export type BPM = number;
export type PPQ = number;

// The time is explicitly expressed in seconds
export type Time = number;
export type Seconds = Time;

// A note duration can be expressed as a keyed string
export const DURATIONS = [
  "whole",
  "half",
  "quarter",
  "eighth",
  "16th",
  "32nd",
  "64th",
];
export type Duration = (typeof DURATIONS)[number];

// A note duration has a standard name
export const DURATION_NAMES: Record<Duration, string> = {
  whole: "Whole Note",
  half: "Half Note",
  quarter: "Quarter Note",
  eighth: "Eighth Note",
  "16th": "Sixteenth Note",
  "32nd": "Thirty-Second Note",
  "64th": "Sixty-Fourth Note",
};
export type DurationName = (typeof DURATION_NAMES)[Duration];

// MELODY

// A chord is a pattern of notes
export type Note = number;
export type Chord = Pattern<Note>;

// The loudnesses of notes are expressed as numbers
export type Volume = number;
export type Velocity = number;

// A note can be stretched or compressed with specific timing
export const TIMINGS = ["straight", "dotted", "triplet"];
export type Timing = (typeof TIMINGS)[number];

// A stream is a pattern of chords
export type Stream = Pattern<Chord>;
export type MelodicProgression = Stream;

// HARMONY

// A key (or scale) is a pattern of pitches
export type Pitch = string;
export type Key = Pattern<Pitch>;

export type ChromaticNote = { number: number; spellings: string[] };
export type ChromaticScale = ChromaticNote[];

// A transposition is a vector: a map of scales to scalars
// (Note that we use an ID to refer to a scale, not the scale itself)
// (This is because we can only use a string as a key)
export type Transposition = Record<ID, number>;

// A progression is a pattern of transpositions
export type Progression = Pattern<Transposition>;
export type HarmonicProgression = Progression;

// A form is a pattern of progressions
export type Form = Pattern<Progression>;

// TIMELINE

// A note duration has a corresponding subdivision for the timeline
export const SUBDIVISION_NAMES: Record<Duration, string> = {
  whole: "1/1",
  half: "1/2",
  quarter: "1/4",
  eighth: "1/8",
  "16th": "1/16",
  "32nd": "1/32",
  "64th": "1/64",
};
export type Subdivision = (typeof SUBDIVISION_NAMES)[Duration];
