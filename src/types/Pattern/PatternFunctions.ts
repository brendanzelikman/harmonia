import {
  getScaleNoteAsMidiValue,
  cycleNoteThroughScales,
  ScaleChain,
  ScaleNote,
  isMidiValue,
  MidiValue,
  isNestedNote,
  sumScaleVectors,
  ScaleVector,
  ScaleObject,
} from "types/Scale";
import { Key, Tick } from "types/units";
import {
  PatternNote,
  PatternChord,
  PatternStream,
  isPatternStream,
  Pattern,
  PatternUpdate,
  PatternMidiStream,
  PatternMidiChord,
  PatternRest,
  PatternBlock,
  isPatternRest,
  isPatternMidiChord,
  PatternMidiBlock,
  PatternMidiNote,
  isPatternNote,
  isPatternChord,
  isPatternBlockedChord,
  isPatternStrummedChord,
  PatternStrummedChord,
  PatternBlockedChord,
} from "./PatternTypes";
import { PoseVector, getVector_t, getVector_N } from "types/Pose";
import { mod } from "utils/math";
import { toString } from "utils/objects";
import { getMidiPitchClass } from "utils/midi";
import { getSortedPitchClasses } from "utils/pitch";
import { range } from "lodash";
import {
  PresetPatternGroupList,
  PresetPatternGroupMap,
} from "presets/patterns";
import { DEFAULT_INSTRUMENT_KEY } from "utils/constants";

// ------------------------------------------------------------
// Pattern Serializers
// ------------------------------------------------------------

/** Get a `PatternRest` as a string. */
export const getPatternRestAsString = (rest: PatternRest) => {
  return toString(rest, JSON.stringify);
};

/** Get a `PatternNote` as a string. */
export const getPatternNoteAsString = (note: PatternNote) => {
  return toString(note, JSON.stringify);
};

/** Get a `PatternChord` as a string. */
export const getPatternChordAsString = (chord: PatternChord) => {
  if (isPatternBlockedChord(chord)) {
    return toString(chord, getPatternNoteAsString);
  } else if (isPatternStrummedChord(chord)) {
    const directionTag = chord.strumDirection;
    const rangeTag = `${chord.strumRange[0]}-${chord.strumRange[1]}`;
    const chordTag = toString(chord.chord, getPatternNoteAsString);
    return `${chordTag} ${directionTag} ${rangeTag}`;
  } else {
    return toString(chord, getPatternNoteAsString);
  }
};

/** Get a `PatternBlock` as a string. */
export const getPatternBlockAsString = (block: PatternBlock) => {
  if (isPatternNote(block)) return getPatternNoteAsString(block);
  if (isPatternRest(block)) return getPatternRestAsString(block);
  return getPatternChordAsString(block);
};

/** Get a `PatternStream` as a string. */
export const getPatternStreamAsString = (patternStream: PatternStream) => {
  return toString(patternStream, getPatternBlockAsString);
};

/** Get a `Pattern` as a string. */
export const getPatternAsString = (pattern: Pattern) => {
  return toString(pattern, JSON.stringify);
};

/** Get a `PatternUpdate` as a string. */
export const getPatternUpdateAsString = (pattern: PatternUpdate) => {
  return toString(pattern, JSON.stringify);
};

// ------------------------------------------------------------
// Pattern Properties
// ------------------------------------------------------------

/** Get the name of a pattern. */
export const getPatternName = (pattern?: Pattern) => {
  return pattern?.name ?? "";
};

/** Get the instrument key of a pattern. */
export const getPatternInstrumentKey = (pattern?: Pattern) => {
  return pattern?.instrumentKey ?? DEFAULT_INSTRUMENT_KEY;
};

/** Get the category of a pattern. */
export const getPatternCategory = (pattern?: Pattern) => {
  if (!pattern) return "No Category";
  return (
    PresetPatternGroupList.find((c) => {
      return PresetPatternGroupMap[c].some((m) => m.id === pattern.id);
    }) ?? "Custom Patterns"
  );
};

/** Get the total duration of a `PatternBlock` in ticks. */
export const getPatternBlockDuration = (block: PatternBlock): Tick => {
  // Return the duration of a note or rest
  if (isPatternNote(block)) return block.duration;
  if (isPatternRest(block)) return block.duration;

  // Get the notes of the chord
  const notes = getPatternChordNotes(block);
  if (!notes.length) return 0;

  // Get the max duration of the notes in the chord
  const noteDurations = notes.map((note) => note.duration);
  const maxDuration = Math.max(...noteDurations);

  // Add the strum range to the duration if the chord is strummed
  if (isPatternStrummedChord(block)) {
    return maxDuration + block.strumRange[0] + block.strumRange[1];
  } else {
    return maxDuration;
  }
};

/** Get the total velocity of a `PatternBlock` in ticks. */
export const getPatternBlockVelocity = (block: PatternBlock): Tick => {
  if (isPatternNote(block)) return block.velocity;
  if (isPatternRest(block)) return 0;
  const notes = getPatternChordNotes(block);
  if (!notes.length) return 0;
  const noteVelocities = notes.map((note) => note.velocity);
  return Math.max(...noteVelocities);
};

/** Get the total duration of a `PatternStream` in ticks. */
export const getPatternStreamDuration = (stream: PatternStream): Tick => {
  if (!isPatternStream(stream) || !stream.length) return 1;
  return stream.reduce((pre, cur) => pre + getPatternBlockDuration(cur), 0);
};

/** Get the `PatternBlock` occurring at the given index within a `PatternStream` */
export const getPatternBlockAtIndex = (
  stream: PatternStream,
  index: number
) => {
  return stream[index] ?? [];
};

/** Get a `PatternMidiStream` flattened into an array of `PatternMidiNotes` */
export const getMidiStreamNotes = (stream: PatternMidiStream) => {
  return stream
    .filter(isPatternMidiChord)
    .map((c) => (isPatternStrummedChord(c) ? c.chord : c))
    .flat();
};

/** Get a `PatternMidiStream` flattened into an array of `MIDIValues` */
export const getMidiStreamValues = (stream: PatternMidiStream): MidiValue[] => {
  return getMidiStreamNotes(stream).map((n) => n.MIDI);
};

/** Get the intrinsic scale of a `PatternMidiStream` */
export const getMidiStreamScale = (stream: PatternMidiStream): MidiValue[] => {
  const flatValues = getMidiStreamNotes(stream);
  const basicValues = flatValues.map((n) => mod(n.MIDI, 12));
  return [...new Set(basicValues)].sort((a, b) => a - b);
};

/** Get a range of `MidiValues` bounded by the lowest and highest notes of a `PatternMidiStream`. */
export const getMidiStreamRange = (stream?: PatternMidiStream) => {
  if (!stream) return [];
  const streamChord = getMidiStreamNotes(stream);
  if (!streamChord.length) return [];
  const min = Math.min(...streamChord.map((n) => n.MIDI));
  const max = Math.max(...streamChord.map((n) => n.MIDI));
  return range(min, max + 1);
};

/* Get the key of the `MidiStream` using the given key as a reference. */
export const getMidiStreamKey = (stream: PatternMidiStream, key?: Key): Key => {
  if (!isPatternStream(stream) || !stream.length) return [];
  const chord = getMidiStreamNotes(stream);
  const pitchClasses = chord.map((note) => getMidiPitchClass(note.MIDI, key));
  return getSortedPitchClasses(pitchClasses);
};

// ------------------------------------------------------------
// Pattern Conversions
// ------------------------------------------------------------

/** Create a `PatternNote` from a `ScaleNote`  */
export const createPatternNoteFromScaleNote = (
  note: ScaleNote,
  duration = 96,
  velocity = 100
): PatternNote => {
  if (isMidiValue(note)) return { MIDI: note, duration, velocity };
  return { ...note, duration, velocity };
};

/** Create a `PatternChord` from a `ScaleNote` */
export const createPatternChordFromScaleNote = (
  note: ScaleNote,
  duration = 96,
  velocity = 100
): PatternChord => {
  return [createPatternNoteFromScaleNote(note, duration, velocity)];
};

/** Create a `PatternStream` from an array of `MidiValues` */
export const createPatternStreamFromMidiValues = (
  midiValues: MidiValue[],
  duration = 96,
  velocity = 100
): PatternStream => {
  return midiValues.map((midi) => [{ MIDI: midi, duration, velocity }]);
};

/** Create a `Scale` from a `Pattern` */
export const createScaleFromPattern = (pattern: Pattern): ScaleObject => ({
  id: `${pattern.id}-scale`,
  name: pattern.name,
  notes: getMidiStreamScale(pattern.stream as PatternMidiStream),
});

/** Toggle the strum of a chord */
export function togglePatternChordStrum(
  chord: PatternStrummedChord
): PatternBlockedChord;
export function togglePatternChordStrum(
  chord: PatternBlockedChord
): PatternStrummedChord;
export function togglePatternChordStrum(chord: PatternChord): PatternChord {
  if (isPatternStrummedChord(chord)) return chord.chord;
  if (Array.isArray(chord)) {
    return {
      chord,
      strumDirection: "up",
      strumRange: [0, 0],
    };
  } else {
    return {
      chord: [chord],
      strumDirection: "up",
      strumRange: [0, 0],
    };
  }
}

/** Edit the strum of a strummed chord. */
export const editPatternChordStrum = (
  chord: PatternStrummedChord,
  strum: Partial<{
    strumDirection: "up" | "down";
    strumRange: [number, number];
  }>
): PatternStrummedChord => {
  return { ...chord, ...strum };
};

// ------------------------------------------------------------
// Pattern Transpositions
// ------------------------------------------------------------

/** Update the vector of a `PatternBlock` by overriding values with the new vector. */
export const updatePatternBlockOffset = (
  block: PatternBlock,
  vector: ScaleVector
): PatternBlock => {
  if (!isPatternChord(block)) return block;
  const notes = getPatternChordNotes(block);
  return notes.map((note) => {
    if (!isNestedNote(note)) return note;
    return { ...note, offset: { ...note.offset, ...vector } };
  });
};

/** Transpose a `PatternStream` by applying each offset from the given `ScaleVector`. */
export const getTransposedPatternStream = (
  stream: PatternStream,
  vector: ScaleVector
): PatternStream => {
  return stream.map((block) => {
    if (!isPatternChord(block)) return block;
    const notes = getPatternChordNotes(block);
    return notes.map((note) => {
      if (!isNestedNote(note)) return note;
      return {
        ...note,
        MIDI: undefined,
        offset: sumScaleVectors([note.offset, vector]),
      };
    });
  });
};

/** Transpose a `MidiStream` by a given chromatic offset. */
export const getTransposedMidiStream = (
  midiStream: PatternMidiStream,
  offset: number
): PatternMidiStream => {
  if (!offset) return midiStream;
  return midiStream.map((block) => {
    if (!isPatternMidiChord(block)) return block;
    const notes = getPatternMidiChordNotes(block);
    return notes.map((note) => ({ ...note, MIDI: note.MIDI + offset }));
  });
};

/** Rotate a `MidiStream` by a given offset. */
export const getRotatedMidiStream = (
  midiStream: PatternMidiStream,
  offset: number
): PatternMidiStream => {
  const streamScale = getMidiStreamScale(midiStream);
  const step = Math.sign(offset);
  for (let i = 0; i < Math.abs(offset); i++) {
    midiStream = midiStream.map((block) => {
      if (!isPatternMidiChord(block)) return block;
      const notes = getPatternMidiChordNotes(block);
      return notes.map((note) => {
        const lastDegree = streamScale.indexOf(mod(note.MIDI, 12));
        const nextDegree = mod(lastDegree + step, streamScale.length);
        let distance = streamScale[nextDegree] - streamScale[lastDegree];
        if (step > 0 && nextDegree === 0) distance += 12;
        if (step < 0 && lastDegree === 0) distance -= 12;
        return { ...note, MIDI: note.MIDI + distance };
      });
    });
  }
  return midiStream;
};

// ------------------------------------------------------------
// Pattern MIDI Resolutions
// ------------------------------------------------------------

/** Get a `PatternChord` as an array of notes. */
export const getPatternChordNotes = (chord: PatternChord) => {
  if (!isPatternChord(chord)) return [];
  if (isPatternStrummedChord(chord)) return chord.chord;
  if (Array.isArray(chord)) return chord;
  return [chord];
};

/** Get a `PatternMidiChord` as an array of notes. */
export const getPatternMidiChordNotes = (chord: PatternMidiChord) => {
  if (!isPatternMidiChord(chord)) return [];
  if (isPatternStrummedChord(chord)) return chord.chord;
  if (Array.isArray(chord)) return chord;
  return [chord];
};

/** Update the notes of a `PatternChord` */
export const updatePatternChordNotes = (
  chord: PatternChord,
  notes: PatternNote[]
): PatternChord => {
  if (!isPatternChord(chord)) return chord;
  if (isPatternStrummedChord(chord)) return { ...chord, chord: notes };
  if (Array.isArray(chord)) return notes;
  return [notes[0]];
};

/** Resolve a `PatternNote` to a `MidiValue` using the `Scales` provided. */
export const resolvePatternNoteToMidi = (
  note: PatternNote,
  scales: ScaleChain
) => {
  const chainedNote = cycleNoteThroughScales(note, scales);
  return getScaleNoteAsMidiValue(chainedNote);
};

/** Resolve a `PatternChord` to `MIDI` using the `Scales` provided. */
export const resolvePatternChordToMidi = (
  chord: PatternChord,
  scales?: ScaleChain
): PatternMidiNote[] => {
  const notes = getPatternChordNotes(chord);
  const chordLength = notes.length;
  if (!chordLength) return [];

  const newChord = notes.map((note) => {
    // If the note is a MIDI note, return it as is
    if (!isNestedNote(note)) return note;

    // If the note doesn't have a scale, realize it within the chromatic scale
    const defaultNote = {
      duration: note.duration,
      velocity: note.velocity,
      MIDI: getScaleNoteAsMidiValue(note),
    };
    if (!scales || !note.scaleId) return defaultNote;

    // Try to find the note's scale in the scale chain
    const scaleIndex = scales.findIndex((s) => s.id === note.scaleId);
    if (scaleIndex < 0) return defaultNote;

    // Resolve the note to MIDI using the scales preceding it
    const parentScales = scales.slice(0, scaleIndex + 1);
    return {
      duration: note.duration,
      velocity: note.velocity,
      MIDI: resolvePatternNoteToMidi(note, parentScales),
    };
  });

  const midiChord = updatePatternChordNotes(
    chord,
    newChord
  ) as PatternMidiChord;
  return getPatternMidiChordNotes(midiChord);
};

/** Resolve a `PatternBlock` to `MIDI` using the `Scales` provided. */
export const resolvePatternBlockToMidi = (
  block: PatternBlock,
  scales?: ScaleChain
): PatternMidiBlock => {
  if (!isPatternChord(block)) return block;
  return resolvePatternChordToMidi(block, scales);
};

/** Resolve a `PatternStream` to MIDI using a `ScaleChain` and `PoseVector` */
export const resolvePatternStreamToMidi = (
  stream: PatternStream,
  scales?: ScaleChain,
  vector?: PoseVector
): PatternMidiStream => {
  if (!stream) return [];

  // Get the stream with or without the scales
  let midiStream = stream.map((b) => resolvePatternBlockToMidi(b, scales));

  // Return the stream if no pose is specified
  if (!vector) return midiStream;

  // Apply the chromatic offset
  const N = getVector_N(vector);
  midiStream = getTransposedMidiStream(midiStream, N);

  // Apply the chordal offset
  const t = getVector_t(vector);
  midiStream = getRotatedMidiStream(midiStream, t);

  // Return the stream
  return midiStream;
};

/** Resolve a `Pattern` to a `PatternMidiStream` using a `ScaleChain` */
export const resolvePatternToMidi = (
  pattern?: Pattern,
  scaleChain?: ScaleChain
): PatternMidiStream => {
  if (!pattern) return [];
  return resolvePatternStreamToMidi(pattern.stream, scaleChain);
};
