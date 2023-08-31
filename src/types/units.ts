export type ID = string;
export type Note = number;
export type Chord = Note[];
export type Stream = Chord[];
export type Pitch = string;
export type Subdivision = 1 | 2 | 4 | 8 | 16 | 32 | 64;
export type Duration =
  | "whole"
  | "half"
  | "quarter"
  | "eighth"
  | "16th"
  | "32nd"
  | "64th";
export type Timing = "straight" | "dotted" | "triplet";
export type Tick = number;
export type Time = number;
export type Volume = number;
export type BPM = number;
export type XML = string;
export type JSON<_> = string;
