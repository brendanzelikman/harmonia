import { test, expect } from "vitest";
import { getClipStream, testClip } from "./clip";
import { testPattern } from "./pattern";
import { testScale } from "./scale";
import { MIDI } from "./midi";
import { testTransform } from "./transform";
import { MajorScale } from "./presets/scales/basic";

test("getClipStream", () => {
  const clip = testClip();
  const pattern = testPattern([
    [MIDI.createQuarterNote(60)],
    [MIDI.createQuarterNote(64)],
    [MIDI.createQuarterNote(67)],
  ]);
  const scale = testScale(MajorScale.notes);
  const transform = testTransform(1, 1, 1, 0);
  const stream = getClipStream(clip, pattern, scale, [transform], []);
  const quarter = MIDI.QuarterNoteTicks;
  expect(stream[0][0].MIDI).toEqual(66);
  expect(stream[1 * quarter][0].MIDI).toEqual(70);
  expect(stream[2 * quarter][0].MIDI).toEqual(75);
  expect(stream[0][0].duration).toEqual(quarter);
  expect(stream[1 * quarter][0].duration).toEqual(quarter);
  expect(stream[2 * quarter][0].duration).toEqual(quarter);
  expect(stream.length).toEqual(quarter * pattern.stream.length);
});
