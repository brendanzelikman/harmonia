import { test, expect } from "vitest";
import {
  realizePattern,
  rotatePatternStream,
  testPattern,
  transposePatternStream,
} from "./pattern";
import { testScale } from "./scale";
import { MIDI } from "./midi";

test("realizePattern", () => {
  const scale1 = testScale([60, 61, 62]);
  const scale2 = testScale([60, 63]);
  const pattern = testPattern([
    [MIDI.createQuarterNote(60)],
    [MIDI.createQuarterNote(61)],
    [MIDI.createQuarterNote(62)],
    [MIDI.createQuarterNote(72)],
    [MIDI.createQuarterNote(73)],
    [MIDI.createQuarterNote(74)],
  ]);
  const stream1 = realizePattern(pattern, scale1);
  const stream2 = realizePattern(pattern, scale2);
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

test("transposeStream", () => {
  const scale = testScale([60, 61, 64, 68, 70]);
  const pattern = testPattern([
    [MIDI.createQuarterNote(60), MIDI.createQuarterNote(61)],
    [MIDI.createQuarterNote(64)],
    [MIDI.createQuarterNote(67)],
  ]);
  const stream = realizePattern(pattern, scale);
  const transposedUp = transposePatternStream(stream, 1, scale);
  const transposedDown = transposePatternStream(stream, -1, scale);
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

test("rotateStream", () => {
  const scale = testScale([60, 61, 64, 68, 70]);
  const pattern = testPattern([
    [MIDI.createQuarterNote(60), MIDI.createQuarterNote(61)],
    [MIDI.createQuarterNote(64)],
    [MIDI.createQuarterNote(67)],
  ]);
  const stream = realizePattern(pattern, scale);
  const rotatedUp = rotatePatternStream(stream, 1);
  const rotatedDown = rotatePatternStream(stream, -1);
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
