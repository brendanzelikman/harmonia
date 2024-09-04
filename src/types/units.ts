import { EntityId } from "@reduxjs/toolkit";

// ------------------------------------------------------------
// Basic Units
// ------------------------------------------------------------

export type Id<T extends EntityId> = `${T}_${string}`;
export type Update<T> = { id: EntityId } & Partial<T>;
export type Plural<T> = T | T[];
export type Timed<T> = T & { duration: Tick };
export type Playable<T> = Timed<T> & { velocity: Velocity };

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

// ------------------------------------------------------------
// String Units
// ------------------------------------------------------------

export type PitchLetter = "C" | "D" | "E" | "F" | "G" | "A" | "B";
export type Accidental = "b" | "#" | "";
export type PitchClass = `${PitchLetter}${Accidental}${Accidental}`;
export type Key = PitchClass[];
export type XML = string;
export type UndoType = string;
