import { test, expect } from "vitest";
import * as _ from "./PatternTypes";
import { ScaleNote, isMidiValue, MidiValue } from "types/Scale/ScaleTypes";

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

test("isPatternNote should only return true for valid notes", () => {
  expect(_.isPatternNote({ MIDI: 1, duration: 1, velocity: 1 })).toBe(true);
  expect(_.isPatternNote({ degree: 1, duration: 1, velocity: 1 })).toBe(true);

  expect(_.isPatternNote(undefined)).toBe(false);
  expect(_.isPatternNote({})).toBe(false);
  expect(_.isPatternNote({ MIDI: 60 })).toBe(false);
  expect(_.isPatternNote({ MIDI: 60, duration: 1 })).toBe(false);
  expect(_.isPatternNote({ degree: 1, velocity: 1 })).toBe(false);
  expect(_.isPatternNote({ duration: 1, velocity: 1 })).toBe(false);
});

test("isPatternMidiNote should only return true for valid MIDI notes", () => {
  expect(_.isPatternMidiNote({ MIDI: 1, duration: 1, velocity: 1 })).toBe(true);

  expect(_.isPatternMidiNote(undefined)).toBe(false);
  expect(_.isPatternMidiNote(0)).toBe(false);
  expect(_.isPatternMidiNote({})).toBe(false);
  expect(_.isPatternNote({ degree: 1, duration: 1, velocity: 1 })).toBe(true);
  expect(_.isPatternMidiNote({ MIDI: 60 })).toBe(false);
  expect(_.isPatternNote({ MIDI: 60, duration: 1 })).toBe(false);
  expect(_.isPatternNote({ degree: 1, velocity: 1 })).toBe(false);
  expect(_.isPatternNote({ duration: 1, velocity: 1 })).toBe(false);
});

test("isPatternChord should only return true for valid chords", () => {
  const yc1 = [{ MIDI: 60, duration: 96, velocity: 127 }];
  const yc2 = [{ degree: 1, duration: 96, velocity: 127 }];
  const yc3 = [...yc1, ...yc2];
  expect(_.isPatternChord([])).toBe(true);
  expect(_.isPatternChord(yc1)).toBe(true);
  expect(_.isPatternChord(yc2)).toBe(true);
  expect(_.isPatternChord(yc3)).toBe(true);

  const nc1 = [{ MIDI: 128, duration: 1, velocity: 1 }];
  const nc2 = [{ degree: "1", duration: 1 }];
  const nc3 = [{ degree: 1, offset: { s: "1" }, duration: 1, velocity: 1 }];
  expect(_.isPatternChord(undefined)).toBe(false);
  expect(_.isPatternChord(0)).toBe(false);
  expect(_.isPatternChord({})).toBe(false);
  expect(_.isPatternChord(nc1)).toBe(false);
  expect(_.isPatternChord(nc2)).toBe(false);
  expect(_.isPatternChord(nc3)).toBe(false);
});

test("isPatternMidiChord should only return true for invalid MIDI chords", () => {
  const yc1 = [{ MIDI: 60, duration: 96, velocity: 127 }];
  const yc2 = [{ MIDI: 1, duration: 96, velocity: 127 }];
  const yc3 = [...yc1, ...yc2];
  expect(_.isPatternMidiChord([])).toBe(true);
  expect(_.isPatternMidiChord(yc1)).toBe(true);
  expect(_.isPatternMidiChord(yc2)).toBe(true);
  expect(_.isPatternMidiChord(yc3)).toBe(true);

  const nc1 = [{ MIDI: 128, duration: 1, velocity: 1 }];
  const nc2 = [{ degree: "1", duration: 1 }];
  const nc3 = [{ degree: 1, offset: { s: "1" }, duration: 1, velocity: 1 }];
  expect(_.isPatternMidiChord(undefined)).toBe(false);
  expect(_.isPatternMidiChord(0)).toBe(false);
  expect(_.isPatternMidiChord({})).toBe(false);
  expect(_.isPatternMidiChord(nc1)).toBe(false);
  expect(_.isPatternMidiChord(nc2)).toBe(false);
  expect(_.isPatternMidiChord(nc3)).toBe(false);
});

test("isPatternBlock should only return true for valid chords and rests", () => {
  const yc1 = [{ MIDI: 60, duration: 96, velocity: 127 }];
  const yc2 = [{ degree: 1, duration: 96, velocity: 127 }];
  const yc3 = [...yc1, ...yc2];
  const yr1 = { duration: 96 };
  expect(_.isPatternBlock([])).toBe(true);
  expect(_.isPatternBlock(yc1)).toBe(true);
  expect(_.isPatternBlock(yc2)).toBe(true);
  expect(_.isPatternBlock(yc3)).toBe(true);
  expect(_.isPatternBlock(yr1)).toBe(true);

  const nc1 = [{ MIDI: 128, duration: 1, velocity: 1 }];
  const nc2 = [{ degree: "1", duration: 1 }];
  const nc3 = [{ degree: 1, offset: { s: "1" }, duration: 1, velocity: 1 }];
  const nr1 = [{ duration: 96 }];
  expect(_.isPatternBlock(undefined)).toBe(false);
  expect(_.isPatternBlock(0)).toBe(false);
  expect(_.isPatternBlock({})).toBe(false);
  expect(_.isPatternBlock(nc1)).toBe(false);
  expect(_.isPatternBlock(nc2)).toBe(false);
  expect(_.isPatternBlock(nc3)).toBe(false);
  expect(_.isPatternBlock(nr1)).toBe(false);
});

test("isPatternStream should only return true for valid streams", () => {
  const ys1 = [[{ MIDI: 1, duration: 1, velocity: 1 }]];
  const ys2 = [[{ degree: 1, offset: { s: 1 }, duration: 1, velocity: 1 }]];
  const ys3 = [...ys1, ...ys2];
  expect(_.isPatternStream([])).toBe(true);
  expect(_.isPatternStream(ys1)).toBe(true);
  expect(_.isPatternStream(ys2)).toBe(true);
  expect(_.isPatternStream(ys3)).toBe(true);

  const ns1 = [[{ MIDI: 128, duration: 1, velocity: 1 }]];
  const ns2 = [[{ degree: "1", duration: 1 }]];
  const ns3 = [5, 2, 3];
  const ns4 = [[5], [2], [3]];
  expect(_.isPatternStream(undefined)).toBe(false);
  expect(_.isPatternStream([[[]]])).toBe(false);
  expect(_.isPatternStream({})).toBe(false);
  expect(_.isPatternStream(ns1)).toBe(false);
  expect(_.isPatternStream(ns2)).toBe(false);
  expect(_.isPatternStream(ns3)).toBe(false);
  expect(_.isPatternStream(ns4)).toBe(false);
});

test("isPatternMidiStream should only return true for valid MIDI streams", () => {
  const ys1 = [[{ MIDI: 60, duration: 96, velocity: 127 }]];
  const ys2 = [[{ MIDI: 1, duration: 96, velocity: 127 }]];
  const ys3 = [...ys1, ...ys2];
  expect(_.isPatternMidiStream([])).toBe(true);
  expect(_.isPatternMidiStream(ys1)).toBe(true);
  expect(_.isPatternMidiStream(ys2)).toBe(true);
  expect(_.isPatternMidiStream(ys3)).toBe(true);

  const ns1 = [[{ MIDI: 128, duration: 1, velocity: 1 }]];
  const ns2 = [[{ degree: "1", duration: 1 }]];
  const ns3 = [[{ degree: 1, offset: { s: "1" }, duration: 1, velocity: 1 }]];
  expect(_.isPatternMidiStream(undefined)).toBe(false);
  expect(_.isPatternMidiStream([[[]]])).toBe(false);
  expect(_.isPatternMidiStream({})).toBe(false);
  expect(_.isPatternMidiStream(ns1)).toBe(false);
  expect(_.isPatternMidiStream(ns2)).toBe(false);
  expect(_.isPatternMidiStream(ns3)).toBe(false);
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
