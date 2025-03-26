import { isPatternRest, PatternMidiStream } from "types/Pattern/PatternTypes";
import {
  getMidiStreamScale,
  getPatternMidiChordNotes,
} from "types/Pattern/PatternUtils";
import { getMidiNoteValue } from "./midi";

export const getMidiStreamScaleError = (
  stream: PatternMidiStream,
  other: PatternMidiStream
) => {
  const scale1 = getMidiStreamScale(stream);
  const scale2 = getMidiStreamScale(other);
  return scale1.reduce((a, b, i) => a + Math.abs(b - scale2[i]), 0);
};

export const getMidiStreamMeanError = (
  stream: PatternMidiStream,
  other: PatternMidiStream
) => {
  const length = Math.min(stream.length, other.length);
  if (length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < length; i++) {
    const streamBlock = stream[i];
    const otherBlock = other[i];
    if (isPatternRest(streamBlock) || isPatternRest(otherBlock)) continue;
    const streamNotes = getPatternMidiChordNotes(streamBlock);
    const otherNotes = getPatternMidiChordNotes(otherBlock);
    const diff = streamNotes.reduce((acc, note, index) => {
      const midi = getMidiNoteValue(note);
      const otherMidi = getMidiNoteValue(otherNotes[index]);
      return acc + (otherMidi - midi);
    }, 0);
    sum += diff;
  }
  return sum;
};
