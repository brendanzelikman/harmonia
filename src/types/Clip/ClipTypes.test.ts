import { expect, test } from "vitest";
import * as _ from "./ClipTypes";
import * as PatternClipTypes from "./PatternClip/PatternClipTypes";

test("initializeClip should create a clip with a unique ID", () => {
  // const oldClip = _.initializeClip({});
  // const clip = _.initializeClip(oldClip);
  // expect(clip.id).toBeDefined();
  // expect(clip.id).not.toEqual(oldClip.id);
});

test("isClip should only return true for valid clips", () => {
  expect(_.isClipInterface(PatternClipTypes.defaultPatternClip)).toBe(true);

  expect(_.isClipInterface(undefined)).toBe(false);
  expect(_.isClipInterface({})).toBe(false);
  expect(_.isClipInterface([])).toBe(false);
  expect(
    _.isClipInterface({ ...PatternClipTypes.defaultPatternClip, id: 1 })
  ).toBe(false);
  expect(
    _.isClipInterface({ ...PatternClipTypes.defaultPatternClip, trackId: 1 })
  ).toBe(false);
  expect(
    _.isClipInterface({ ...PatternClipTypes.defaultPatternClip, tick: "1" })
  ).toBe(false);
  expect(
    _.isClipInterface({
      ...PatternClipTypes.defaultPatternClip,
      tick: Infinity,
    })
  ).toBe(false);
});
