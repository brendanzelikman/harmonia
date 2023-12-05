import { expect, test } from "vitest";
import * as _ from "./ClipTypes";

test("initializeClip should create a clip with a unique ID", () => {
  const oldClip = _.initializeClip();
  const clip = _.initializeClip(oldClip);
  expect(clip.id).toBeDefined();
  expect(clip.id).not.toEqual(oldClip.id);
});

test("isClip should only return true for valid clips", () => {
  expect(_.isClip(_.defaultPatternClip)).toBe(true);
  expect(_.isClip(_.defaultPatternClip)).toBe(true);

  expect(_.isClip(undefined)).toBe(false);
  expect(_.isClip({})).toBe(false);
  expect(_.isClip([])).toBe(false);
  expect(_.isClip({ ..._.defaultPatternClip, id: 1 })).toBe(false);
  expect(_.isClip({ ..._.defaultPatternClip, trackId: 1 })).toBe(false);
  expect(_.isClip({ ..._.defaultPatternClip, tick: "1" })).toBe(false);
  expect(_.isClip({ ..._.defaultPatternClip, tick: Infinity })).toBe(false);
});
