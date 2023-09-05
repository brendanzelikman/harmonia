export type ID = string;
export type Note = number;
export type Chord = Note[];
export type Stream = Chord[];
export type Pitch = string;

export const SUBDIVISIONS = [
  "1/1",
  "1/2",
  "1/4",
  "1/8",
  "1/16",
  "1/32",
  "1/64",
];
export type Subdivision = (typeof SUBDIVISIONS)[number];

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
export const DURATION_NAMES: Record<Duration, string> = {
  whole: "Whole Note",
  half: "Half Note",
  quarter: "Quarter Note",
  eighth: "Eighth Note",
  "16th": "Sixteenth Note",
  "32nd": "Thirty-Second Note",
  "64th": "Sixty-Fourth Note",
};

export const TIMINGS = ["straight", "dotted", "triplet"];
export type Timing = (typeof TIMINGS)[number];

export type Velocity = number;
export type Tick = number;
export type Time = number;
export type Volume = number;
export type BPM = number;
export type XML = string;
export type JSON<_> = string;
