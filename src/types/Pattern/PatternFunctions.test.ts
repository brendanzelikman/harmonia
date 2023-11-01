import { test, expect } from "vitest";
import * as _ from "./PatternFunctions";
import { NestedNote, Scale, mockScale } from "types/Scale";
import { Pattern, PatternMidiStream, PatternStream } from "./PatternTypes";

const scale1: Scale = {
  id: "s1",
  notes: [60, 62, 64, 65, 67, 69, 71],
};
const scale2: Scale = {
  id: "s2",
  notes: [{ degree: 0 }, { degree: 2 }, { degree: 5 }],
};

const n0 = { MIDI: 60 };
const n1 = { degree: 0, scaleId: "s2" };
const n2 = { degree: 1, scaleId: "s2" };
const n3 = { degree: 2, offset: { s1: 1 }, scaleId: "s2" };
const n4 = { degree: 2, scaleId: "s2" };
const n5 = { degree: 2, offset: { chromatic: -1 }, scaleId: "s2" };
const n6 = { degree: 2, scaleId: "s2" };
const n7 = { degree: 3, scaleId: "s1" };
const n8 = { degree: 2, scaleId: "s1" };

const notes = [n0, n1, n2, n3, n4, n5, n6, n7, n8];
const stream = notes.map((n) => _.createPatternChordFromScaleNote(n));
const pattern: Pattern = { id: "p", stream };
const chain = [scale1, scale2];

test("getPatternBlockDuration should return the correct duration of a block", () => {
  const chord = [
    { MIDI: 1, duration: 96, velocity: 1 },
    { MIDI: 1, duration: 1, velocity: 1 },
  ];
  const rest = { duration: 96 };
  expect(_.getPatternBlockDuration(chord)).toBe(96);
  expect(_.getPatternBlockDuration(rest)).toBe(96);
});

test("getPatternStreamDuration should correctly sum the duration of a stream", () => {
  const stream1 = [[{ MIDI: 1, duration: 96, velocity: 1 }]];
  const stream2 = [[{ degree: 1, duration: 96, velocity: 1 }]];
  const stream3 = [...stream1, ...stream2];
  expect(_.getPatternStreamDuration(stream1)).toBe(96);
  expect(_.getPatternStreamDuration(stream2)).toBe(96);
  expect(_.getPatternStreamDuration(stream3)).toBe(192);
});

test("getPatternBlockAtIndex should return the correct block at the given index", () => {
  const chord = [{ MIDI: 1, duration: 96, velocity: 1 }];
  const rest = { duration: 96 };
  const stream = [chord, rest];
  expect(_.getPatternBlockAtIndex(stream, 0)).toEqual(chord);
  expect(_.getPatternBlockAtIndex(stream, 1)).toEqual(rest);
  expect(_.getPatternBlockAtIndex(stream, 2)).toEqual([]);
});

test("getMidiStreamScale should return the intrinsic scale of a stream", () => {
  const notes = [72, 73, 60];
  const stream = notes.map((n) => _.createPatternChordFromScaleNote(n));
  const midiStream = _.resolvePatternStreamToMidi(stream);
  expect(_.getMidiStreamScale(midiStream)).toEqual([0, 1]);
});

test("getTransposedMidiStream should correctly transpose a MIDI stream", () => {
  const chords = [60, 71].map((n) => _.createPatternChordFromScaleNote(n));
  const midiStream = chords as PatternMidiStream;

  const transposedNone = _.getTransposedMidiStream(midiStream, 0);
  const transposedUp = _.getTransposedMidiStream(midiStream, 1);
  const transposedDown = _.getTransposedMidiStream(midiStream, -1);

  expect(_.getMidiStreamValues(transposedNone)).toEqual([60, 71]);
  expect(_.getMidiStreamValues(transposedUp)).toEqual([61, 72]);
  expect(_.getMidiStreamValues(transposedDown)).toEqual([59, 70]);
});

test("getRotatedMidiStream should correctly rotate a MIDI stream", () => {
  const chords = [60, 71].map((n) => _.createPatternChordFromScaleNote(n));
  const midiStream = chords as PatternMidiStream;

  const rotatedNone = _.getRotatedMidiStream(midiStream, 0);
  const rotatedUp = _.getRotatedMidiStream(midiStream, 1);
  const rotatedDown = _.getRotatedMidiStream(midiStream, -1);

  expect(_.getMidiStreamValues(rotatedNone)).toEqual([60, 71]);
  expect(_.getMidiStreamValues(rotatedUp)).toEqual([71, 72]);
  expect(_.getMidiStreamValues(rotatedDown)).toEqual([59, 60]);
});

test("getTransposedPatternStream should correctly transpose a pattern stream", () => {
  const stream: PatternStream = [
    [{ degree: 0, scaleId: mockScale.id, duration: 1, velocity: 1 }],
  ];
  const posedStream = _.getTransposedPatternStream(stream, {
    [mockScale.id]: 1,
    chromatic: 1,
  });
  const resolvedStream = _.resolvePatternStreamToMidi(posedStream, [mockScale]);
  expect(_.getMidiStreamValues(resolvedStream)).toEqual([63]);
});

test("resolvePatternNoteToMidi should correctly resolve a note to MIDI", () => {
  const scale: Scale = { id: "s1", notes: [60, 62, 64, 66, 68, 70, 72] };
  const n1 = { degree: 0, duration: 1, velocity: 1 };
  const n2 = { degree: 1, offset: { chromatic: 1 }, duration: 1, velocity: 1 };
  const n3 = { degree: 2, offset: { octave: 1 }, duration: 1, velocity: 1 };
  const n4 = { degree: 3, offset: { s1: 1 }, duration: 1, velocity: 1 };
  expect(_.resolvePatternNoteToMidi(n1, [scale])).toBe(60);
  expect(_.resolvePatternNoteToMidi(n2, [scale])).toBe(63);
  expect(_.resolvePatternNoteToMidi(n3, [scale])).toBe(76);
  expect(_.resolvePatternNoteToMidi(n4, [scale])).toBe(68);
});

test("resolvePatternBlockToMidi should correctly resolve a block to MIDI", () => {
  const midiChord = _.resolvePatternBlockToMidi(stream[7], chain);
  const midiValue = _.getMidiStreamValues([midiChord]);
  expect(midiValue).toEqual([65]);
});

test("resolvePatternStreamToMidi should correctly resolve a stream to MIDI", () => {
  const midiStream = _.resolvePatternStreamToMidi(stream, chain);
  const midiValues = _.getMidiStreamValues(midiStream);
  expect(midiValues).toEqual([60, 60, 64, 71, 69, 68, 69, 65, 64]);
});

test("resolvePatternToMidi should correctly resolve a pattern to MIDI", () => {
  const midiStream = _.resolvePatternToMidi(pattern, chain);
  const midiValues = _.getMidiStreamValues(midiStream);
  expect(midiValues).toEqual([60, 60, 64, 71, 69, 68, 69, 65, 64]);
});
