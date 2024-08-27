import { EntityId, nanoid } from "@reduxjs/toolkit";
import { FlatKey, SharpKey } from "presets/keys";

// ------------------------------------------------------------
// Basic Units
// ------------------------------------------------------------

// All ids are created with a prefix and a unique identifier
export type ID<T extends EntityId> = `${T}_${string}`;

export const createId = <T extends EntityId>(prefix: T): ID<T> => {
  return `${prefix}_${nanoid()}`;
};

export type XML = string;
export type JSON<_> = string;

export type Update<T> = { id: EntityId } & Partial<T>;
export type Color = `bg-${string}-${string}`;

// ------------------------------------------------------------
// Note Units
// ------------------------------------------------------------

export type MIDI = number;
export type PitchClass = `${"C" | "D" | "E" | "F" | "G" | "A" | "B"}${
  | "b"
  | "#"
  | ""}${"b" | "#" | ""}`;
export type Pitch = string;

export const PitchClassSet = new Set([...FlatKey, ...SharpKey]);
export const isPitchClass = (value: any): value is PitchClass =>
  PitchClassSet.has(value);

export type Key = PitchClass[];
export type Timed<T> = T & { duration: Tick };
export type Playable<T> = Timed<T> & { velocity: Velocity };

export type BlockedChord<T> = T | T[];
export type StrummedChord<T> = {
  chord: T[];
  strumRange: [Tick, Tick];
  strumDirection: "up" | "down";
};
export type Chord<T> = BlockedChord<T> | StrummedChord<T>;
export type Stream<T> = T[];
export type Vector = { [key in string]?: number };

// ------------------------------------------------------------
// Time Units
// ------------------------------------------------------------

export type Tick = number;
export type BPM = number;
export type PPQ = number;
export type Seconds = number;
export type Samples = number;

// ------------------------------------------------------------
// Audio Units
// ------------------------------------------------------------

export type Volume = number;
export type Pan = number;
export type Velocity = number;
export type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};
/* The unsafe type allows for safe access to an object that may be undefined */
export type Safe<T> = RecursivePartial<T> | undefined;
