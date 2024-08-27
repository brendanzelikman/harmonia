import { ScaleVector, isNestedNote } from "types/Scale/ScaleTypes";
import { mod } from "utils/math";
import { sumVectors } from "utils/objects";
import { getPatternChordNotes, getPatternMidiChordNotes } from "./PatternUtils";
import { getMidiStreamScale } from "./PatternUtils";
import {
  PatternStream,
  isPatternChord,
  PatternMidiStream,
  isPatternMidiChord,
} from "./PatternTypes";

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
