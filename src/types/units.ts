export type ID = string;
export type Note = number;
export type Chord = Note[];
export type Stream = Chord[];
export type Pitch = string;
export type Duration =
  | "whole"
  | "half"
  | "quarter"
  | "eighth"
  | "16th"
  | "32nd";

export type Time = number;
export type Volume = number;
export type BPM = number;
export type XML = string;
export type JSON<_> = string;
