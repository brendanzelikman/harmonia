import { test, expect } from "vitest";
import * as _ from "./PatternTypes";
import { ScaleNote, isMidiValue } from "types/Scale/ScaleTypes";
import { MidiValue } from "utils/midi";

/** Create a `PatternNote` from a `ScaleNote`  */
export const createPatternNoteFromScaleNote = (
  note: ScaleNote,
  duration = 96,
  velocity = 100
): _.PatternNote => {
  if (isMidiValue(note)) return { MIDI: note, duration, velocity };
  return { ...note, duration, velocity };
};

/** Create a `PatternChord` from a `ScaleNote` */
export const createScaleStream = (
  notes: ScaleNote[],
  duration = 96,
  velocity = 100
): _.PatternStream => {
  return notes.map((n) => [
    createPatternNoteFromScaleNote(n, duration, velocity),
  ]);
};

/** Create a `PatternStream` from an array of `MidiValues` */
export const createPatternStreamFromMidiValues = (
  midiValues: MidiValue[],
  duration = 96,
  velocity = 100
): _.PatternStream => {
  return midiValues.map((midi) => [{ MIDI: midi, duration, velocity }]);
};

test("initializePattern should create a pattern with a unique ID", () => {
  const oldPattern = _.initializePattern();
  const pattern = _.initializePattern(oldPattern);
  expect(pattern.id).toBeDefined();
  expect(pattern.id).not.toEqual(oldPattern.id);
});

test("isTimedNote should only return true for timed notes", () => {
  expect(_.isTimedNote({ MIDI: 1, duration: 1, velocity: 1 })).toBe(true);
  expect(_.isTimedNote({ degree: 1, duration: 1, velocity: 1 })).toBe(true);

  expect(_.isTimedNote({ MIDI: 5, velocity: 1 })).toBe(false);
  expect(_.isTimedNote({ degree: 5, velocity: 1 })).toBe(false);
});

test("isPlayableNote should only return true for playable notes", () => {
  expect(_.isPlayableNote({ MIDI: 1, duration: 1, velocity: 1 })).toBe(true);
  expect(_.isPlayableNote({ degree: 1, duration: 1, velocity: 1 })).toBe(true);

  expect(_.isPlayableNote({ MIDI: 5, duration: 1 })).toBe(false);
  expect(_.isPlayableNote({ degree: 5, duration: 2 })).toBe(false);
});

test("isPatternRest should only return true for rest notes", () => {
  expect(_.isPatternRest({ duration: 1 })).toBe(true);

  expect(_.isPatternRest({})).toBe(false);
  expect(_.isPatternRest({ duration: "1" })).toBe(false);
  expect(_.isPatternRest({ duration: 1, velocity: 1 })).toBe(false);
  expect(_.isPatternRest({ duration: 1, MIDI: 1 })).toBe(false);
  expect(_.isPatternRest({ duration: 1, degree: 1 })).toBe(false);
});

test("isPattern should only return true for valid patterns", () => {
  const yp1 = { id: "pattern", stream: [] };
  const yp2 = { id: "id", stream: [[{ MIDI: 1, duration: 1, velocity: 1 }]] };
  const yp3 = {
    id: "pattern",
    stream: [
      [{ degree: 1, duration: 1, velocity: 1, scaleId: "scale" }],
      [{ MIDI: 1, duration: 1, velocity: 1 }],
    ],
  };
  expect(_.isPattern(yp1)).toBe(true);
  expect(_.isPattern(yp2)).toBe(true);
  expect(_.isPattern(yp3)).toBe(true);
  expect(_.isPattern(_.defaultPattern)).toBe(true);
  expect(_.isPattern(_.initializePattern())).toBe(true);

  const np1 = { id: "pattern" };
  const np2 = { id: "pattern", stream: {} };
  const np3 = { id: "pattern", stream: [60] };
  expect(_.isPattern(undefined)).toBe(false);
  expect(_.isPattern({})).toBe(false);
  expect(_.isPattern([])).toBe(false);
  expect(_.isPattern([{ MIDI: 1, duration: 1, velocity: 1 }]));
  expect(_.isPattern(np1)).toBe(false);
  expect(_.isPattern(np2)).toBe(false);
  expect(_.isPattern(np3)).toBe(false);
});
