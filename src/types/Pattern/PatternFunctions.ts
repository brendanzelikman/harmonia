import { Tick } from "types/units";
import {
  PatternChord,
  PatternStream,
  Pattern,
  PatternMidiChord,
  PatternBlock,
  isPatternRest,
  isPatternNote,
  isPatternStrummedChord,
  PatternStrummedChord,
  PatternBlockedChord,
  PatternStrummedMidiChord,
  isPatternChord,
} from "./PatternTypes";
import { DEFAULT_INSTRUMENT_KEY } from "utils/constants";
import { mod } from "utils/math";
import { PresetPatternGroupList, PresetPatternGroupMap } from "assets/patterns";
import { getPatternChordNotes, getPatternMidiChordNotes } from "./PatternUtils";
import { isArray } from "lodash";
import { getTickDuration, isTripletDuration } from "utils/durations";
import { ScaleVector, isNestedNote } from "types/Scale/ScaleTypes";
import { sumVectors } from "utils/vector";

// ------------------------------------------------------------
// Pattern Functions
// ------------------------------------------------------------

/** Get the name of a pattern. */
export const getPatternName = (pattern?: Pattern) => {
  return pattern?.name ?? "";
};

/** Get the category of a pattern. */
export const getPatternCategory = (pattern?: Pattern) => {
  if (!pattern) return "No Category";
  for (const group of PresetPatternGroupList) {
    const patterns = PresetPatternGroupMap[group];
    if (patterns.some((p) => p.id === pattern.id)) return group;
  }
  return "Custom Patterns";
};

/** Get the instrument key of a pattern. */
export const getPatternInstrumentKey = (pattern?: Pattern) => {
  return pattern?.instrumentKey ?? DEFAULT_INSTRUMENT_KEY;
};

/** Get the total duration of a `PatternStream` in ticks. */
export const getPatternDuration = (pattern?: Pattern): Tick => {
  const stream = pattern?.stream;
  return stream ? getPatternStreamDuration(stream) : 0;
};

export const getPatternStreamDuration = (stream: PatternStream): Tick => {
  return stream.reduce((pre, cur) => pre + getPatternBlockDuration(cur), 0);
};

// ------------------------------------------------------------
// Pattern Block Functions
// ------------------------------------------------------------

/** Get the `PatternBlock` occurring at the given index within a `PatternStream` */
export const getPatternBlockAtIndex = (
  stream: PatternStream,
  index: number
) => {
  return stream[mod(index, stream.length)] ?? [];
};

/** Get the `PatternBlock` occurring exactly at the given tick within a `PatternStream` */
export const getPatternBlockAtTick = (
  stream: PatternStream,
  tick: Tick,
  duration: Tick
) => {
  const flatStream = stream.flatMap((block) => {
    const blockDuration = getPatternBlockDuration(block);
    const blockCount = Math.ceil(blockDuration / duration);
    return Array.from(
      { length: blockCount },
      () => undefined as PatternBlock | undefined
    ).fill(block, 0, 1);
  });
  return flatStream[mod(tick, flatStream.length)];
};

/** Get the total duration of a `PatternBlock` in ticks. */
export const getPatternBlockDuration = (block: PatternBlock): Tick => {
  // Return the duration of a note or rest
  if (isPatternNote(block) || isPatternRest(block)) return block.duration;

  // Get the notes of the chord
  const notes = getPatternChordNotes(block);
  if (!notes.length) return 0;

  // Get the max duration of the notes in the chord
  const noteDurations = notes.map((note) => note.duration);
  const maxDuration = Math.max(...noteDurations);

  // Add the strum range to the duration if the chord is strummed
  if (!isPatternStrummedChord(block)) return maxDuration;
  return maxDuration + block.strumRange[0] + block.strumRange[1];
};

/** Get whether a pattern block is a triplet or not. */
export const isPatternBlockTriplet = (block: PatternBlock) => {
  const duration = getPatternBlockDuration(block);
  const type = getTickDuration(duration);
  return isTripletDuration(type);
};

/** Update the duration of all the notes of a `PatternBlock` */
export const updatePatternBlockDuration = (
  block: PatternBlock,
  duration: Tick
): PatternBlock => {
  if (isPatternNote(block)) return { ...block, duration };
  if (isPatternRest(block)) return { ...block, duration };
  const notes = getPatternChordNotes(block).map((note) => ({
    ...note,
    duration,
  }));
  return notes;
};

// ------------------------------------------------------------
// Pattern Strumming Functions
// ------------------------------------------------------------

/** Toggle the strum of a chord */
export function togglePatternChordStrum(
  chord: PatternStrummedChord
): PatternBlockedChord;
export function togglePatternChordStrum(
  chord: PatternBlockedChord
): PatternStrummedChord;
export function togglePatternChordStrum(chord: PatternChord): PatternChord {
  if (isPatternStrummedChord(chord)) return chord.chord;
  const strumProps = { strumDirection: "up", strumRange: [0, 0] };
  const block = isArray(chord) ? chord : [chord];
  return { ...strumProps, chord: block } as PatternChord;
}

/** Edit the strum of a strummed chord. */
export const editPatternChordStrum = (
  chord: PatternStrummedChord,
  strum: Partial<PatternStrummedChord>
): PatternStrummedChord => {
  return { ...chord, ...strum };
};

/** Get the notes of a strummed chord at a given tick. */
export const getPatternStrummedChordNotes = (
  chord: PatternStrummedChord,
  tick: Tick,
  midiChord: PatternMidiChord
) => {
  const stream = [];
  const notes = getPatternChordNotes(chord);
  const noteCount = notes.length;

  const strummedChord = chord as PatternStrummedMidiChord;
  const strumDirection = strummedChord.strumDirection ?? "up";
  const strumRange = chord.strumRange ?? [0, 0];
  const start = strumRange[0];
  const end = strumRange[1];
  const strumDuration = start + end;
  const strumStep = strumDuration / Math.max(1, noteCount - 1);
  const strumNotes = getPatternMidiChordNotes(midiChord);

  // Add the notes to the current index of the stream, offset by the strum range
  for (let j = 0; j < noteCount; j++) {
    // Get the index of the note to add based on the strum direction
    const index = strumDirection === "up" ? j : noteCount - j - 1;

    // Get the offset by stepping along the strum range, clamping to the stream
    let offset = j * Math.round(strumStep) - start;

    // If there is one note, apply the strum range
    if (noteCount === 1) offset = end - start;

    // If the offset goes negative, clamp it to the stream
    const strummedTick = tick + offset;
    if (strummedTick < 0) offset = Math.max(-tick, offset);

    // Get the new note and adjust its duration
    const note = strumNotes[index];
    const startTick = tick + offset;

    // The new note has at least its inital duration, plus the distance until the end
    const newNote = {
      ...note,
      duration: note.duration + strumDuration - offset,
    };
    const block = { notes: [newNote], startTick, strumIndex: j };

    // Push the block to the stream
    stream.push(block);
  }

  return stream;
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
      const offset = sumVectors(note.offset, vector);
      return { ...note, MIDI: undefined, offset };
    });
  });
};
