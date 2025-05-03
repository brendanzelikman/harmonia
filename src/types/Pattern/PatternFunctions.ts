import { Tick } from "types/units";
import {
  PatternChord,
  PatternStream,
  Pattern,
  PatternMidiChord,
  PatternBlock,
  isPatternRest,
  isPatternStrummedChord,
  PatternStrummedChord,
  PatternBlockedChord,
  PatternStrummedMidiChord,
  PatternMidiStream,
} from "./PatternTypes";
import { mod } from "utils/math";
import {
  PresetPatternGroupList,
  PresetPatternGroupMap,
} from "lib/presets/patterns";
import { getPatternChordNotes, getPatternMidiChordNotes } from "./PatternUtils";
import { maxBy } from "lodash";
import { getTickDuration, isTripletDuration } from "utils/duration";
import { ScaleVector } from "types/Scale/ScaleTypes";
import { sumVectors } from "utils/vector";

// ------------------------------------------------------------
// Pattern Functions
// ------------------------------------------------------------

/** Get the category of a pattern. */
export const getPatternCategory = (pattern?: Pattern) => {
  if (!pattern) return "No Category";
  for (const group of PresetPatternGroupList) {
    const patterns = PresetPatternGroupMap[group];
    if (patterns.some((p) => p.id === pattern.id)) return group;
  }
  return "Custom Patterns";
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

export const getPatternMidiChordAtIndex = (
  stream: PatternMidiStream,
  index: number
) => {
  const block = stream[mod(index, stream.length)];
  return isPatternRest(block) ? [] : block;
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
  if (!block) return 0;
  if ("duration" in block) return block.duration;
  const isStrummed = "chord" in block;
  const chord = isStrummed ? block.chord : block;
  const duration = maxBy(chord, (c) => c?.duration)?.duration ?? 0;
  if (!isStrummed) return duration;

  // Add the strum range to the duration if the chord is strummed
  const start = block?.strumRange?.[0] ?? 0;
  const end = block?.strumRange?.[1] ?? 0;
  return duration + start + end;
};

/** Get whether a pattern block is a triplet or not. */
export const isPatternBlockTriplet = (block: PatternBlock) => {
  const duration = getPatternBlockDuration(block);
  const type = getTickDuration(duration);
  return isTripletDuration(type);
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
  const block = Array.isArray(chord) ? chord : [chord];
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
    if (isPatternRest(block)) return block;
    const notes = getPatternChordNotes(block);
    return notes.map((note) => {
      if (!("degree" in note)) return note;
      const offset = sumVectors(note.offset, vector);
      return { ...note, MIDI: undefined, offset };
    });
  });
};
