import { test, expect } from "vitest";
import * as PatternFunctions from "./PatternFunctions";
import { initializePattern, mockPattern } from "./PatternTypes";
import { MIDI } from "../midi";

test("getPatternTag", () => {
  const tag = PatternFunctions.getPatternTag(mockPattern);
  const streamTag = PatternFunctions.getPatternStreamTag(mockPattern.stream);
  expect(tag).toContain(mockPattern.id);
  expect(tag).toContain(mockPattern.name);
  expect(tag).toContain(streamTag);
});

test("getPatternNoteTag", () => {
  const note = mockPattern.stream[0][0];
  const noteTag = PatternFunctions.getPatternNoteTag(note);
  expect(noteTag).toContain(note.MIDI);
  expect(noteTag).toContain(note.duration);
  expect(noteTag).toContain(note.velocity);
});

test("getPatternChordTag", () => {
  const chord = mockPattern.stream[0];
  const chordTag = PatternFunctions.getPatternChordTag(chord);
  expect(chordTag).toContain(chord[0].MIDI);
  expect(chordTag).toContain(chord[0].duration);
  expect(chordTag).toContain(chord[0].velocity);
});

test("getPatternStreamTag", () => {
  const stream = mockPattern.stream;
  const streamTag = PatternFunctions.getPatternStreamTag(stream);
  for (const chord of stream) {
    const chordTag = PatternFunctions.getPatternChordTag(chord);
    expect(streamTag).toContain(chordTag);
  }
});

test("getPatternStreamTicks", () => {
  const stream = mockPattern.stream;
  const ticks = PatternFunctions.getPatternStreamTicks(stream);
  const expectedTicks = stream.reduce(
    (acc, chord) => acc + chord[0].duration,
    0
  );
  expect(ticks).toEqual(expectedTicks);
});

test("getRealizedPatternNotes", () => {
  const scale1 = [60, 61, 62];
  const scale2 = [60, 63];
  const pattern = initializePattern({
    stream: [
      [MIDI.createQuarterNote(60)],
      [MIDI.createQuarterNote(61)],
      [MIDI.createQuarterNote(62)],
      [MIDI.createQuarterNote(72)],
      [MIDI.createQuarterNote(73)],
      [MIDI.createQuarterNote(74)],
    ],
  });
  const stream1 = PatternFunctions.getRealizedPatternNotes(pattern, scale1);
  const stream2 = PatternFunctions.getRealizedPatternNotes(pattern, scale2);
  expect(stream1[0][0].MIDI).toEqual(60);
  expect(stream1[1][0].MIDI).toEqual(61);
  expect(stream1[2][0].MIDI).toEqual(62);
  expect(stream1[3][0].MIDI).toEqual(72);
  expect(stream1[4][0].MIDI).toEqual(73);
  expect(stream1[5][0].MIDI).toEqual(74);
  expect(stream2[0][0].MIDI).toEqual(60);
  expect(stream2[1][0].MIDI).toEqual(60);
  expect(stream2[2][0].MIDI).toEqual(63);
  expect(stream2[3][0].MIDI).toEqual(72);
  expect(stream2[4][0].MIDI).toEqual(72);
  expect(stream2[5][0].MIDI).toEqual(75);
});

test("transposePatternStream", () => {
  const scale = [60, 61, 64, 68, 70];
  const pattern = initializePattern({
    stream: [
      [MIDI.createQuarterNote(60), MIDI.createQuarterNote(61)],
      [MIDI.createQuarterNote(64)],
      [MIDI.createQuarterNote(67)],
    ],
  });
  const stream = PatternFunctions.getRealizedPatternNotes(pattern, scale);
  const transposedUp = PatternFunctions.transposePatternStream(
    stream,
    1,
    scale
  );
  const transposedDown = PatternFunctions.transposePatternStream(
    stream,
    -1,
    scale
  );
  expect(stream[0][0].MIDI).toEqual(60);
  expect(stream[0][1].MIDI).toEqual(61);
  expect(stream[1][0].MIDI).toEqual(64);
  expect(stream[2][0].MIDI).toEqual(68);
  expect(transposedUp[0][0].MIDI).toEqual(61);
  expect(transposedUp[0][1].MIDI).toEqual(64);
  expect(transposedUp[1][0].MIDI).toEqual(68);
  expect(transposedUp[2][0].MIDI).toEqual(70);
  expect(transposedDown[0][0].MIDI).toEqual(58);
  expect(transposedDown[0][1].MIDI).toEqual(60);
  expect(transposedDown[1][0].MIDI).toEqual(61);
  expect(transposedDown[2][0].MIDI).toEqual(64);
});

test("rotatePatternStream", () => {
  const scale = [60, 61, 64, 68, 70];
  const pattern = initializePattern({
    stream: [
      [MIDI.createQuarterNote(60), MIDI.createQuarterNote(61)],
      [MIDI.createQuarterNote(64)],
      [MIDI.createQuarterNote(67)],
    ],
  });
  const stream = PatternFunctions.getRealizedPatternNotes(pattern, scale);
  const rotatedUp = PatternFunctions.rotatePatternStream(stream, 1);
  const rotatedDown = PatternFunctions.rotatePatternStream(stream, -1);
  expect(stream[0][0].MIDI).toEqual(60);
  expect(stream[0][1].MIDI).toEqual(61);
  expect(stream[1][0].MIDI).toEqual(64);
  expect(stream[2][0].MIDI).toEqual(68);
  expect(rotatedUp[0][0].MIDI).toEqual(61);
  expect(rotatedUp[0][1].MIDI).toEqual(64);
  expect(rotatedUp[1][0].MIDI).toEqual(68);
  expect(rotatedUp[2][0].MIDI).toEqual(72);
  expect(rotatedDown[0][0].MIDI).toEqual(56);
  expect(rotatedDown[0][1].MIDI).toEqual(60);
  expect(rotatedDown[1][0].MIDI).toEqual(61);
  expect(rotatedDown[2][0].MIDI).toEqual(64);
});
