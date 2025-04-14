import { isNestedNote } from "types/Scale/ScaleTypes";
import { mod, parseValue, sanitize } from "utils/math";
import { sumVectors } from "utils/vector";
import {
  getPatternMidiChordNotes,
  getPatternMidiChordWithNewNotes,
  getPatternMidiStreamWithNewNotes,
} from "./PatternUtils";
import { getMidiStreamIntrinsicScale } from "./PatternUtils";
import {
  PatternMidiStream,
  isPatternMidiChord,
  isPatternRest,
} from "./PatternTypes";
import { getMidiFromPitch, getMidiValue } from "utils/midi";
import { clamp, shuffle } from "lodash";
import { Frequency, getTransport } from "tone";
import { getPatternBlockDuration } from "./PatternFunctions";
import {
  DURATION_TYPES,
  getDurationTicks,
  PPQ,
  secondsToTicks,
} from "utils/duration";
import { isNumber } from "types/utils";

export type Transformer<Args = any> = (
  stream: PatternMidiStream,
  args: Args | undefined
) => PatternMidiStream;

type StrNum = string | number;
// ----------------------------------------
// Order Transformers
// ----------------------------------------

/** Phase a pattern stream by a certain number of steps. */
export const phaseStream: Transformer<StrNum> = (stream, input = 0) => {
  if (!input) return stream;
  const steps = parseValue(input);
  const length = stream.length;
  const newArray = [];
  for (let i = 0; i < length; i++) {
    const index = mod(i + steps, length);
    newArray.push(stream[index]);
  }
  return newArray;
};

/** Canonize a pattern stream by a certain number of steps. */
export const canonizeStream: Transformer<StrNum> = (stream, input = 0) => {
  if (!input) return stream;
  const delay = parseValue(input);
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
export const mirrorStream: Transformer<boolean> = (stream, value = false) => {
  if (!value) return stream;
  const midpoint = Math.ceil(stream.length / 2);
  return stream.map((block, i) => {
    if (i < midpoint) return block;
    return stream[midpoint - (i - midpoint)];
  });
};

/** Reverse a pattern stream */
export const reverseStream: Transformer<boolean> = (stream, value = false) => {
  if (!value) return stream;
  return [...stream].reverse();
};

/** Shuffle a pattern stream */
export const shuffleStream: Transformer<boolean> = (stream, value = false) => {
  if (!value) return stream;
  return shuffle(stream);
};

// ----------------------------------------
// Pitch Transformers
// ----------------------------------------

/** Transpose a `MidiStream` by a given chromatic offset. */
export const transposeStream: Transformer<StrNum> = (stream, input = 0) => {
  if (!input) return stream;
  const offset = parseValue(input);
  return getPatternMidiStreamWithNewNotes(stream, (notes) =>
    notes.map((note) => ({ ...note, MIDI: note.MIDI + offset }))
  );
};

/** Rotate a `MidiStream` by a given offset. */
export const rotateStream: Transformer<StrNum> = (stream, input = 0) => {
  if (!input) return stream;
  const offset = parseValue(input);
  const streamScale = getMidiStreamIntrinsicScale(stream);
  const length = streamScale.length;
  const step = Math.sign(offset);
  let newStream = stream;
  for (let i = 0; i < Math.abs(offset); i++) {
    newStream = getPatternMidiStreamWithNewNotes(newStream, (notes) =>
      notes.map((note) => {
        const degree = note.MIDI % 12;
        const lastDegree = streamScale.findIndex((n) => n % 12 === degree);
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
export const harmonizeStream: Transformer<StrNum> = (stream, interval = 0) => {
  if (!interval) return stream;
  const value = parseValue(interval);
  return getPatternMidiStreamWithNewNotes(stream, (notes) => [
    ...notes,
    ...notes.map((note) => {
      if (isNestedNote(note)) {
        const offset = sumVectors(note.offset, { chromatic: value });
        return { ...note, offset };
      } else {
        return { ...note, MIDI: clamp(note.MIDI + value, 0, 127) };
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
export const invertStream: Transformer<StrNum> = (stream, axis) => {
  if (axis === undefined || axis === "") return stream;
  let axisMIDI = isNumber(axis) ? axis : getMidiFromPitch(axis);
  if (axisMIDI === undefined) axisMIDI = parseValue(axis);
  return getPatternMidiStreamWithNewNotes(stream, (notes) =>
    notes.map((note) => {
      const distance = note.MIDI - axisMIDI;
      return { ...note, MIDI: axisMIDI - distance };
    })
  );
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

export const setStreamVelocities: Transformer<StrNum> = (stream, input = 0) => {
  if (!input) return stream;
  const velocity = parseValue(input);
  return getPatternMidiStreamWithNewNotes(stream, (notes) =>
    notes.map((note) => ({ ...note, velocity }))
  );
};

export const crescendoStream: Transformer<boolean> = (stream, args = false) => {
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

export const descrescendoStream: Transformer<boolean> = (
  stream,
  args = false
) => {
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
export const pulseStream: Transformer<boolean> = (stream, args = false) => {
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
export const stretchStream: Transformer<StrNum> = (stream, value = 0) => {
  if (!value) return stream;
  const factor = parseValue(value);
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
export const repeatStream: Transformer<StrNum> = (stream, value = 0) => {
  if (!value) return stream;
  const repeat = parseValue(value);
  const count = Math.round(sanitize(repeat));
  return new Array(count).fill(stream).flat();
};

/** Extend a pattern stream for a certain number of notes */
export const extendStream: Transformer<StrNum> = (stream, value) => {
  if (value === undefined) return stream;
  const length = parseValue(value);
  const size = Math.round(sanitize(length));
  const streamLength = stream.length;
  return new Array(size).fill(0).map((_, i) => stream[i % streamLength]);
};

/** Space out the stream with rests after each block */
export const spaceStream: Transformer<StrNum> = (stream, input) => {
  if (!input) return stream;
  const space = parseValue(input);
  return stream.flatMap((block) => {
    const duration = getPatternBlockDuration(block);
    return [block, ...new Array(space).fill({ duration })];
  });
};

/** Set every duration to the same value */
export const setDurationsOfStream: Transformer<string> = (stream, input) => {
  if (!input) return stream;
  const duration = () => {
    const string = input.trim();
    if (!string.length) return Infinity;

    const dur = DURATION_TYPES.find((d) => d === string);
    if (dur) return getDurationTicks(dur);

    // Try to match with `n ticks`
    const ticksMatch = string.match(/^(\d+) ticks?$/);
    if (ticksMatch) {
      return sanitize(parseFloat(ticksMatch[1]));
    }

    // Try to match with `n bars` including decimals
    const barsMatch = string.match(/^(\d+(\.\d+)?) bars?$/);
    if (barsMatch) {
      const bars = parseFloat(barsMatch[1]);
      const timeSignature = getTransport().timeSignature as number;
      return bars * (timeSignature / 4) * PPQ;
    }

    // Try to match with `n durations` or `n duration notes`
    for (const duration of DURATION_TYPES) {
      let durationMatch = string.match(new RegExp(`^(\d+) ${duration}s?$`));
      if (durationMatch) {
        const value = sanitize(parseFloat(durationMatch[1]));
        const ticks = value * getDurationTicks(duration);
        return ticks;
      }
    }

    // Try to match with `n seconds` including decimals
    const secondsMatch = string.match(/^(\d+(\.\d+)?) seconds?$/);
    if (secondsMatch) {
      const seconds = parseInt(secondsMatch[1]);
      return secondsToTicks(seconds, getTransport().bpm.value);
    }

    // If the string matches exactly a number, return the value in ticks
    if (/^\d+\s?$/.test(string)) {
      return sanitize(parseFloat(string));
    }

    // Return undefined if no match
    return undefined;
  };
  const value = duration();
  if (value === undefined) return stream;
  return getPatternMidiStreamWithNewNotes(
    stream,
    (notes) => notes.map((note) => ({ ...note, duration: value })),
    () => ({ duration: value })
  );
};

// ----------------------------------------
// Transformation Generics
// ----------------------------------------

export type TransformerArgs<T extends Transformer> = Parameters<T>[1];

export const TRANSFORMATION_CATEGORIES = [
  "pitch",
  "duration",
  "velocity",
  "order",
] as const;
export type TransformationCategory = (typeof TRANSFORMATION_CATEGORIES)[number];

export const createTransformation = <
  C extends string,
  F extends Transformer,
  T extends TransformerArgs<F>
>(options: {
  callback: F;
  category: C;
  defaultValue: T;
  description?: string;
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
    description: `(n) - Wrap the stream around by n steps`,
  }),
  canonize: createTransformation({
    callback: canonizeStream,
    category: "order",
    defaultValue: 0,
    placeholder: "Delay",
    description: "(n) - Add a canon after n notes",
  }),
  mirror: createTransformation({
    callback: mirrorStream,
    category: "order",
    defaultValue: false,
    description: "- Mirror the stream around the midpoint",
  }),
  reverse: createTransformation({
    callback: reverseStream,
    category: "order",
    defaultValue: false,
    description: "- Reverse the notes of the stream",
  }),
  shuffle: createTransformation({
    callback: shuffleStream,
    category: "order",
    defaultValue: false,
    description: "- Shuffle the notes of the stream",
  }),

  // Pitch
  transpose: createTransformation({
    callback: transposeStream,
    category: "pitch",
    defaultValue: 0,
    placeholder: "Steps",
    description: "(n) - Transpose the stream by n semitones",
  }),
  rotate: createTransformation({
    callback: rotateStream,
    category: "pitch",
    defaultValue: 0,
    placeholder: "Steps",
    description: "(n) - Rotate the stream by n steps",
  }),
  invert: createTransformation({
    callback: invertStream,
    category: "pitch",
    defaultValue: "",
    placeholder: "Axis",
    description: "(P) - Invert the stream around pitch P",
  }),
  harmonize: createTransformation({
    callback: harmonizeStream,
    category: "pitch",
    defaultValue: 0,
    placeholder: "Interval",
    description: "(n) - Stack the stream up n semitones",
  }),
  "set pitch": createTransformation({
    callback: setStreamPitches,
    category: "pitch",
    defaultValue: "",
    placeholder: "Pitch",
    description: "(P) - Set the stream to pitch P",
  }),

  // Duration
  stretch: createTransformation({
    callback: stretchStream,
    category: "duration",
    defaultValue: 0,
    placeholder: "Factor",
    description: "(n) - Stretch the stream by a factor of n",
  }),
  repeat: createTransformation({
    callback: repeatStream,
    category: "duration",
    defaultValue: 0,
    placeholder: "Count",
    description: "(n) - Repeat the stream n times",
  }),
  extend: createTransformation({
    callback: extendStream,
    category: "duration",
    defaultValue: 0,
    placeholder: "Length",
    description: "(n) - Extend the stream to n notes",
  }),
  space: createTransformation({
    callback: spaceStream,
    category: "duration",
    defaultValue: 0,
    placeholder: "Rests",
    description: "(n) - Insert n rests after every note",
  }),
  "set duration": createTransformation({
    callback: setDurationsOfStream,
    category: "duration",
    defaultValue: "",
    placeholder: "Duration",
    description: "(s) - Set every note duration to s",
  }),

  // Velocity
  crescendo: createTransformation({
    callback: crescendoStream,
    category: "velocity",
    defaultValue: false,
    description: "- Gradually increase the velocity of the stream",
  }),
  diminuendo: createTransformation({
    callback: descrescendoStream,
    category: "velocity",
    defaultValue: false,
    description: "- Gradually decrease the velocity of the stream",
  }),
  oscillate: createTransformation({
    callback: pulseStream,
    category: "velocity",
    defaultValue: false,
    description: "- Pulse the velocity of the stream",
  }),
  "set velocity": createTransformation({
    callback: setStreamVelocities,
    category: "velocity",
    defaultValue: 0,
    placeholder: "0 - 127",
    description: "(n) - Set the velocity of the stream to n",
  }),

  // Custom Scripts
  script: createTransformation({
    callback: (stream, args) => {
      if (!args) return stream;
      let newStream: PatternMidiStream = [];
      for (let i = 0; i < stream.length; i++) {
        const block = stream[i];
        if (isPatternRest(block)) {
          continue;
        }
        newStream.push(
          getPatternMidiChordWithNewNotes(block, (notes) =>
            notes.map((note) => {
              let value: number | undefined;
              try {
                let safeArgs = args.replace("window", "");
                safeArgs = safeArgs.replace("location", "");
                safeArgs = safeArgs.replace("document", "");
                const fn = new Function("note", "index", safeArgs);
                value = fn(getMidiValue(note), i);
              } catch (e) {
                value = note.MIDI;
              }
              if (isNumber(value)) {
                return { ...note, MIDI: value };
              } else {
                return note;
              }
            })
          )
        );
      }
      return newStream;
    },
    category: "custom",
    defaultValue: "",
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
