import { isNestedNote } from "types/Scale/ScaleTypes";
import { mod, sanitize } from "utils/math";
import { sumVectors } from "utils/vector";
import {
  getPatternChordNotes,
  getPatternChordWithNewNotes,
  getPatternMidiChordNotes,
  getPatternMidiChordWithNewNotes,
  getPatternMidiStreamWithNewNotes,
} from "./PatternUtils";
import { getMidiStreamIntrinsicScale } from "./PatternUtils";
import {
  PatternMidiChord,
  PatternMidiStream,
  isPatternChord,
  isPatternMidiChord,
  isPatternMidiNote,
  isPatternRest,
} from "./PatternTypes";
import { getMidiScaleDegree } from "utils/midi";
import { clamp, inRange, shuffle } from "lodash";
import { Frequency } from "tone";
import { phase } from "utils/array";
import { getPatternBlockDuration } from "./PatternFunctions";

export type Transformer<Args = any> = (
  stream: PatternMidiStream,
  args: Args | undefined
) => PatternMidiStream;

// ----------------------------------------
// Order Transformers
// ----------------------------------------

/** Phase a pattern stream by a certain number of steps. */
export const phaseStream: Transformer<number> = (stream, steps = 0) => {
  return phase(stream, steps);
};

/** Canonize a pattern stream by a certain number of steps. */
export const canonizeStream: Transformer<number> = (stream, delay = 0) => {
  if (!delay) return stream;
  return stream.map((block, i) => {
    if (i < delay) return block;
    const newBlock = stream[i - delay];
    if (isPatternRest(newBlock)) return block;
    if (isPatternRest(block)) return newBlock;
    return getPatternMidiChordWithNewNotes(block, (notes) => [
      ...getPatternMidiChordNotes(newBlock),
      ...notes,
    ]);
  });
};

/** Mirror a pattern stream around the midpoint. */
export const mirrorStream: Transformer<boolean> = (stream, value) => {
  if (!value) return stream;
  const midpoint = Math.ceil(stream.length / 2);
  return stream.map((block, i) => {
    if (i < midpoint) return block;
    return stream[midpoint - (i - midpoint)];
  });
};

/** Reverse a pattern stream */
export const reverseStream: Transformer<boolean> = (stream, value) => {
  if (value) return [...stream].reverse();
  return stream;
};

/** Shuffle a pattern stream */
export const shuffleStream: Transformer<boolean> = (stream, value) => {
  if (value) return shuffle(stream);
  return stream;
};

// ----------------------------------------
// Pitch Transformers
// ----------------------------------------

/** Transpose a `MidiStream` by a given chromatic offset. */
export const transposeStream: Transformer<number> = (stream, offset) => {
  if (!offset) return stream;
  return getPatternMidiStreamWithNewNotes(stream, (notes) =>
    notes.map((note) => ({ ...note, MIDI: clamp(note.MIDI + offset, 0, 127) }))
  );
};

/** Rotate a `MidiStream` by a given offset. */
export const rotateStream: Transformer<number> = (stream, offset) => {
  if (!offset) return stream;
  const streamScale = getMidiStreamIntrinsicScale(stream);
  const length = streamScale.length;
  const step = Math.sign(offset);
  let newStream = stream;
  for (let i = 0; i < Math.abs(offset); i++) {
    newStream = getPatternMidiStreamWithNewNotes(newStream, (notes) =>
      notes.map((note) => {
        const lastDegree = getMidiScaleDegree(note.MIDI, streamScale);
        const nextDegree = mod(lastDegree + step, length);
        let distance = streamScale[nextDegree] - streamScale[lastDegree];
        if (step > 0 && nextDegree === 0) distance += 12;
        if (step < 0 && lastDegree === 0) distance -= 12;
        return { ...note, MIDI: note.MIDI + distance };
      })
    );
  }
  return newStream;
};

/** Harmonize a pattern with a given interval. */
export const harmonizeStream: Transformer<number> = (stream, interval) => {
  if (!interval) return stream;
  return getPatternMidiStreamWithNewNotes(stream, (notes) => [
    ...notes,
    ...notes.map((note) => {
      if (isNestedNote(note)) {
        const offset = sumVectors(note.offset, { chromatic: interval });
        return { ...note, offset };
      } else {
        return { ...note, MIDI: clamp(note.MIDI + interval, 0, 127) };
      }
    }),
  ]);
};

/** Set the pitches of the stream of a pattern. */
export const setStreamPitches: Transformer<string> = (stream, pitch) => {
  if (pitch === undefined) return stream;
  const MIDI = Frequency(pitch).toMidi();
  if (isNaN(MIDI)) return stream;
  return getPatternMidiStreamWithNewNotes(stream, (notes) =>
    notes.map((note) => ({ ...note, MIDI }))
  );
};

/** Invert the notes of a stream around an axis. */
export const invertStream: Transformer<string | number> = (stream, axis) => {
  if (axis === undefined || axis === "") return stream;
  const axisMidi = () => {
    if (typeof axis === "number") return axis;
    const parsedAxis = parseInt(axis);
    const isMidi = !isNaN(parsedAxis) && inRange(parsedAxis, 0, 127);
    if (!isMidi) return undefined;
    return Frequency(axis, isMidi ? "midi" : undefined).toMidi();
  };
  const axisMIDI = axisMidi();
  if (axisMIDI === undefined) return stream;
  return getPatternMidiStreamWithNewNotes(stream, (notes) =>
    notes.map((note) => {
      const distance = note.MIDI - axisMIDI;
      return { ...note, MIDI: axisMIDI - distance };
    })
  );
};

export const interpolateStream: Transformer<number> = (stream, count) => {
  if (!count || count < 0) return stream;
  const newStream = [];
  const streamLength = stream.length;
  for (let i = 0; i < streamLength; i++) {
    const block = stream[i];

    if (!isPatternChord(block)) {
      newStream.push(block);
      continue;
    }

    newStream.push(
      getPatternChordWithNewNotes(block, (notes) =>
        notes.map((_) => ({ ..._, duration: _.duration / (count + 1) }))
      ) as PatternMidiChord
    );
    if (i === streamLength - 1) continue;

    const nextBlock = stream[i + 1];
    if (!isPatternChord(nextBlock)) continue;

    const blockNotes = getPatternChordNotes(block);
    const blockRoot = blockNotes.find(isPatternMidiNote);
    const blockDuration = getPatternBlockDuration(block);
    const blockVelocity = blockNotes[0].velocity;

    const nextBlockNotes = getPatternChordNotes(nextBlock);
    const nextBlockRoot = nextBlockNotes.find(isPatternMidiNote);
    const nextBlockVelocity = nextBlockNotes[0].velocity;

    if (!blockRoot || !nextBlockRoot) continue;

    const rootDistance = nextBlockRoot.MIDI - blockRoot.MIDI;
    const velocityDistance = nextBlockVelocity - blockVelocity;

    const rootStepSize = Math.round(rootDistance / (count + 1));
    const velocityStepSize = Math.round(velocityDistance / (count + 1));

    const interpolatedChords = new Array(count).fill(0).map((_, i) => {
      const newRoot = blockRoot.MIDI + Math.round(rootStepSize * (i + 1));
      const newVelocity = blockVelocity + Math.round(velocityStepSize * i);
      return {
        duration: Math.round(blockDuration / (count + 1)),
        velocity: newVelocity,
        MIDI: newRoot,
      };
    });

    newStream.push(...interpolatedChords);
  }
  return newStream;
};

/** Shuffle the pitches of a stream. */
export const shuffleStreamPitches: Transformer<boolean> = (stream, args) => {
  if (!args) return stream;

  // Shuffle all of the notes in the pattern
  const notes = stream
    .filter(isPatternMidiChord)
    .map(getPatternMidiChordNotes)
    .flat();
  const shuffledNotes = shuffle(notes);

  return getPatternMidiStreamWithNewNotes(stream, (notes) =>
    notes.map((note) => ({
      ...note,
      MIDI: shuffledNotes.pop()?.MIDI ?? note.MIDI,
    }))
  );
};

/** Randomize the pitches of a stream. */
export const randomizeStreamPitches: Transformer<boolean> = (stream, args) => {
  if (!args) return stream;
  return getPatternMidiStreamWithNewNotes(stream, (notes) =>
    notes.map((note) => ({
      ...note,
      MIDI: Math.floor(Math.random() * 128),
    }))
  );
};

// ----------------------------------------
// Velocity Transformers
// ----------------------------------------

export const setStreamVelocities: Transformer<number> = (stream, velocity) => {
  if (velocity === undefined) return stream;
  return getPatternMidiStreamWithNewNotes(stream, (notes) =>
    notes.map((note) => ({ ...note, velocity }))
  );
};

export const crescendoStream: Transformer<boolean> = (stream, args) => {
  if (!args) return stream;
  const range = 64;
  const streamLength = stream.length;
  return stream.map((block, i) => {
    if (isPatternRest(block)) return block;
    const velocity = Math.round(95 + (i / streamLength) * range - range / 2);
    return getPatternMidiChordWithNewNotes(block, (notes) =>
      notes.map((note) => ({ ...note, velocity }))
    );
  });
};

export const descrescendoStream: Transformer<boolean> = (stream, args) => {
  if (!args) return stream;
  const range = 32;
  const streamLength = stream.length;
  return stream.map((block, i) => {
    if (isPatternRest(block)) return block;
    const velocity = Math.round(95 - (i / streamLength) * range + range / 2);
    return getPatternMidiChordWithNewNotes(block, (notes) =>
      notes.map((note) => ({ ...note, velocity }))
    );
  });
};

// Pulse the velocities in a sine-like wave
export const pulseStream: Transformer<boolean> = (stream, args) => {
  if (!args) return stream;
  const range = 32;
  const streamLength = stream.length;
  return stream.map((block, i) => {
    if (isPatternRest(block)) return block;
    const velocity = Math.round(
      95 + Math.sin((i / streamLength) * Math.PI * 2) * range
    );
    return getPatternMidiChordWithNewNotes(block, (notes) =>
      notes.map((note) => ({ ...note, velocity }))
    );
  });
};

// ----------------------------------------
// Duration Transformers
// ----------------------------------------

/* Stretch the durations of a pattern stream */
export const stretchStream: Transformer<number> = (stream, factor) => {
  if (!factor) return stream;
  return stream.map((block) => {
    if (isPatternRest(block)) return { duration: block.duration * factor };
    return getPatternMidiChordWithNewNotes(block, (notes) =>
      notes.map((note) => ({
        ...note,
        duration: Math.round(note.duration * factor),
      }))
    );
  });
};

/** Repeat a pattern stream a certain number of times */
export const repeatStream: Transformer<number> = (stream, repeat) => {
  if (!repeat) return stream;
  const count = Math.round(sanitize(repeat));
  return new Array(count).fill(stream).flat();
};

/** Extend a pattern stream for a certain number of notes */
export const extendStream: Transformer<number> = (stream, length) => {
  if (length === undefined) return stream;
  const size = Math.round(sanitize(length));
  const streamLength = stream.length;
  return new Array(size).fill(0).map((_, i) => stream[i % streamLength]);
};

/** Space out the stream with rests after each block */
export const spaceStream: Transformer<number> = (stream, args) => {
  if (!args) return stream;
  const space = Math.round(sanitize(args));
  return stream.flatMap((block) => {
    const duration = getPatternBlockDuration(block);
    return [block, ...new Array(space).fill({ duration })];
  });
};

// ----------------------------------------
// Transformation Generics
// ----------------------------------------

export type TransformerArgs<T extends Transformer> = Parameters<T>[1];

export const TRANSFORMATION_CATEGORIES = [
  "order",
  "pitch",
  "velocity",
  "duration",
] as const;
export type TransformationCategory = (typeof TRANSFORMATION_CATEGORIES)[number];

export const createTransformation = <
  C extends TransformationCategory,
  F extends Transformer,
  T extends TransformerArgs<F>
>(options: {
  callback: F;
  category: C;
  defaultValue: T;
  placeholder?: T extends boolean ? never : string;
}) => {
  return { ...options, args: {} as T };
};

export const createTransformationMap = <
  T extends Record<string, ReturnType<typeof createTransformation>>
>(
  transformations: T
) => {
  type TransformationMap = {
    [K in keyof T]: ReturnType<typeof createTransformation> & { id: K };
  };
  const map = {} as TransformationMap;
  for (const key in transformations) {
    map[key] = { ...transformations[key], id: key };
  }
  return map;
};

export const TRANSFORMATIONS = createTransformationMap({
  // Order
  phase: createTransformation({
    callback: phaseStream,
    category: "order",
    defaultValue: 0,
    placeholder: "Steps",
  }),
  canonize: createTransformation({
    callback: canonizeStream,
    category: "order",
    defaultValue: 0,
    placeholder: "Delay",
  }),
  mirror: createTransformation({
    callback: mirrorStream,
    category: "order",
    defaultValue: false,
  }),
  reverse: createTransformation({
    callback: reverseStream,
    category: "order",
    defaultValue: false,
  }),
  shuffle: createTransformation({
    callback: shuffleStream,
    category: "order",
    defaultValue: false,
  }),

  // Pitch
  transpose: createTransformation({
    callback: transposeStream,
    category: "pitch",
    defaultValue: 0,
    placeholder: "Steps",
  }),
  rotate: createTransformation({
    callback: rotateStream,
    category: "pitch",
    defaultValue: 0,
    placeholder: "Steps",
  }),
  invert: createTransformation({
    callback: invertStream,
    category: "pitch",
    defaultValue: "",
    placeholder: "Axis",
  }),
  harmonize: createTransformation({
    callback: harmonizeStream,
    category: "pitch",
    defaultValue: 0,
    placeholder: "Interval",
  }),
  interpolate: createTransformation({
    callback: interpolateStream,
    category: "pitch",
    defaultValue: 0,
    placeholder: "Notes",
  }),
  setPitch: createTransformation({
    callback: setStreamPitches,
    category: "pitch",
    defaultValue: "",
    placeholder: "Pitch",
  }),

  // Velocity
  crescendo: createTransformation({
    callback: crescendoStream,
    category: "velocity",
    defaultValue: false,
  }),
  diminuendo: createTransformation({
    callback: descrescendoStream,
    category: "velocity",
    defaultValue: false,
  }),
  oscillate: createTransformation({
    callback: pulseStream,
    category: "velocity",
    defaultValue: false,
  }),
  setVelocity: createTransformation({
    callback: setStreamVelocities,
    category: "velocity",
    defaultValue: 0,
    placeholder: "0 - 127",
  }),

  // Duration
  stretch: createTransformation({
    callback: stretchStream,
    category: "duration",
    defaultValue: 0,
    placeholder: "Factor",
  }),
  repeat: createTransformation({
    callback: repeatStream,
    category: "duration",
    defaultValue: 0,
    placeholder: "Count",
  }),
  extend: createTransformation({
    callback: extendStream,
    category: "duration",
    defaultValue: 0,
    placeholder: "Length",
  }),
  space: createTransformation({
    callback: spaceStream,
    category: "duration",
    defaultValue: 0,
    placeholder: "Rests",
  }),
});

// Create a transformation type from the map
export type Transformation = keyof typeof TRANSFORMATIONS;
export const TRANSFORMATION_TYPES = Object.keys(
  TRANSFORMATIONS
) as Transformation[];

// Get the category of a specific transformation
export const getTransformationCategory = (t: Transformation) =>
  TRANSFORMATIONS[t]["category"];

// Get the transformations of a specific category
export const getCategoryTransformations = (c: TransformationCategory) => {
  return Object.values(TRANSFORMATIONS).filter((t) => t.category === c);
};

// Callback function for a specific transformation
export type TransformationCallback<T extends Transformation> =
  (typeof TRANSFORMATIONS)[T]["callback"];

// Args type for a specific transformation
export type TransformationArgs<T extends Transformation = Transformation> =
  (typeof TRANSFORMATIONS)[T]["args"];

export const TRANSFORMATION_SET = new Set(TRANSFORMATION_TYPES);
export const isTransformation = (x: any): x is Transformation =>
  TRANSFORMATION_SET.has(x);
