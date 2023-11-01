// ------------------------------------------------------------
// Basic Units
// ------------------------------------------------------------

export type ID = string;
export type XML = string;
export type JSON<_> = string;
export type Color = `bg-${string}-${string}`;
export type Size = `h-${string} w-${string}`;

// ------------------------------------------------------------
// Note Units
// ------------------------------------------------------------

export type MIDI = number;
export type Pitch = string;
export type PitchClass = string;
export type Key = PitchClass[];
export type Timed<T> = T & { duration: Tick };
export type Playable<T> = Timed<T> & { velocity: Velocity };
export type Chord<T> = T[];
export type Stream<T> = T[];

// ------------------------------------------------------------
// Time Units
// ------------------------------------------------------------

export type Tick = number;
export type BPM = number;
export type PPQ = number;
export type Seconds = number;

// ------------------------------------------------------------
// Audio Units
// ------------------------------------------------------------

export type Volume = number;
export type Pan = number;
export type Velocity = number;
