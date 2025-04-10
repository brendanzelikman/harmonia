import { test, expect } from "vitest";
import * as PatternResolvers from "./PatternResolvers";
import {
  defaultPattern,
  Pattern,
  PatternMidiStream,
  PatternStream,
} from "./PatternTypes";
import { mockScale, Scale, ScaleNote } from "types/Scale/ScaleTypes";
import {
  getPatternBlockDuration,
  getPatternDuration,
  getPatternBlockAtIndex,
} from "./PatternFunctions";
import {
  getMidiStreamIntrinsicScale,
  flattenMidiStreamValues,
} from "./PatternUtils";
import { transposeStream, rotateStream } from "./PatternTransformers";
import { getTransposedPatternStream } from "./PatternFunctions";
import { createId, isNumber } from "types/utils";

const createScaleStream = (
  notes: ScaleNote[],
  duration = 96,
  velocity = 100
): PatternStream => {
  return notes.map((n) => [
    isNumber(n)
      ? { MIDI: n, duration, velocity }
      : { ...n, duration, velocity },
  ]);
};

const si1 = createId("scale");
const si2 = createId("scale");

const scale1: Scale = {
  id: si1,
  notes: [60, 62, 64, 65, 67, 69, 71],
};
const scale2: Scale = {
  id: si2,
  notes: [{ degree: 0 }, { degree: 2 }, { degree: 5 }],
};

const n0 = { MIDI: 60 };
const n1 = { degree: 0, scaleId: si2 };
const n2 = { degree: 1, scaleId: si2 };
const n3 = { degree: 2, offset: { [si1]: 1 }, scaleId: si2 };
const n4 = { degree: 2, scaleId: si2 };
const n5 = { degree: 2, offset: { chromatic: -1 }, scaleId: si2 };
const n6 = { degree: 2, scaleId: si2 };
const n7 = { degree: 3, scaleId: si1 };
const n8 = { degree: 2, scaleId: si1 };

const notes = [n0, n1, n2, n3, n4, n5, n6, n7, n8] as ScaleNote[];
const stream = createScaleStream(notes);
const pattern: Pattern = { id: "pattern_1", stream };
const chain = [scale1, scale2];

test("getPatternBlockDuration should return the correct duration of a block", () => {
  const chord = [
    { MIDI: 1, duration: 96, velocity: 1 },
    { MIDI: 1, duration: 1, velocity: 1 },
  ];
  const rest = { duration: 96 };
  expect(getPatternBlockDuration(chord)).toBe(96);
  expect(getPatternBlockDuration(rest)).toBe(96);
});

test("getPatternStreamDuration should correctly sum the duration of a stream", () => {
  const stream1 = [[{ MIDI: 1, duration: 96, velocity: 1 }]];
  const stream2 = [[{ degree: 1, duration: 96, velocity: 1 }]];
  const stream3 = [...stream1, ...stream2];
  expect(getPatternDuration({ ...defaultPattern, stream: stream1 })).toBe(96);
  expect(getPatternDuration({ ...defaultPattern, stream: stream2 })).toBe(96);
  expect(getPatternDuration({ ...defaultPattern, stream: stream3 })).toBe(192);
});

test("getPatternBlockAtIndex should return the correct block at the given index", () => {
  const chord = [{ MIDI: 1, duration: 96, velocity: 1 }];
  const rest = { duration: 96 };
  const stream = [chord, rest];
  expect(getPatternBlockAtIndex(stream, 0)).toEqual(chord);
  expect(getPatternBlockAtIndex(stream, 1)).toEqual(rest);
  expect(getPatternBlockAtIndex(stream, 2)).toEqual(chord);
});

test("getMidiStreamScale should return the intrinsic scale of a stream", () => {
  const notes = [72, 73, 60];
  const stream = createScaleStream(notes);
  const midiStream = PatternResolvers.resolvePatternStreamToMidi(stream);
  expect(getMidiStreamIntrinsicScale(midiStream)).toEqual([0, 1]);
});

test("getTransposedMidiStream should correctly transpose a MIDI stream", () => {
  const chords = createScaleStream([60, 71]);
  const midiStream = chords as PatternMidiStream;

  const transposedNone = transposeStream(midiStream, 0);
  const transposedUp = transposeStream(midiStream, 1);
  const transposedDown = transposeStream(midiStream, -1);

  expect(flattenMidiStreamValues(transposedNone)).toEqual([60, 71]);
  expect(flattenMidiStreamValues(transposedUp)).toEqual([61, 72]);
  expect(flattenMidiStreamValues(transposedDown)).toEqual([59, 70]);
});

test("getRotatedMidiStream should correctly rotate a MIDI stream", () => {
  const chords = createScaleStream([60, 71]);
  const midiStream = chords as PatternMidiStream;

  const rotatedNone = rotateStream(midiStream, 0);
  const rotatedUp = rotateStream(midiStream, 1);
  const rotatedDown = rotateStream(midiStream, -1);

  expect(flattenMidiStreamValues(rotatedNone)).toEqual([60, 71]);
  expect(flattenMidiStreamValues(rotatedUp)).toEqual([71, 72]);
  expect(flattenMidiStreamValues(rotatedDown)).toEqual([59, 60]);
});

test("getTransposedPatternStream should correctly transpose a pattern stream", () => {
  const stream: PatternStream = [
    [{ degree: 0, scaleId: mockScale.id, duration: 1, velocity: 1 }],
  ];
  const posedStream = getTransposedPatternStream(stream, {
    [mockScale.id]: 1,
    chromatic: 1,
  });
  const resolvedStream = PatternResolvers.resolvePatternStreamToMidi(
    posedStream,
    [mockScale]
  );
  expect(flattenMidiStreamValues(resolvedStream)).toEqual([63]);
});

test("resolvePatternNoteToMidi should correctly resolve a note to MIDI", () => {
  const scale: Scale = { id: "scale_1", notes: [60, 62, 64, 66, 68, 70, 72] };
  const n1 = { degree: 0, duration: 1, velocity: 1 };
  const n2 = { degree: 1, offset: { chromatic: 1 }, duration: 1, velocity: 1 };
  const n3 = { degree: 2, offset: { octave: 1 }, duration: 1, velocity: 1 };
  const n4 = { degree: 3, offset: { scale_1: 1 }, duration: 1, velocity: 1 };
  expect(PatternResolvers.resolvePatternNoteToMidi(n1, [scale])).toBe(60);
  expect(PatternResolvers.resolvePatternNoteToMidi(n2, [scale])).toBe(63);
  expect(PatternResolvers.resolvePatternNoteToMidi(n3, [scale])).toBe(76);
  expect(PatternResolvers.resolvePatternNoteToMidi(n4, [scale])).toBe(68);
});

test("resolvePatternBlockToMidi should correctly resolve a block to MIDI", () => {
  const midiChord = PatternResolvers.resolvePatternBlockToMidi(
    stream[7],
    chain
  );
  const midiValue = flattenMidiStreamValues([midiChord]);
  expect(midiValue).toEqual([65]);
});

test("resolvePatternStreamToMidi should correctly resolve a stream to MIDI", () => {
  const midiStream = PatternResolvers.resolvePatternStreamToMidi(stream, chain);
  const midiValues = flattenMidiStreamValues(midiStream);
  expect(midiValues).toEqual([60, 60, 64, 71, 69, 68, 69, 65, 64]);
});

test("resolvePatternToMidi should correctly resolve a pattern to MIDI", () => {
  const midiStream = PatternResolvers.resolvePatternToMidi(pattern, chain);
  const midiValues = flattenMidiStreamValues(midiStream);
  expect(midiValues).toEqual([60, 60, 64, 71, 69, 68, 69, 65, 64]);
});
