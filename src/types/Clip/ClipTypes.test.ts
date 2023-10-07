import { test, assert, expect } from "vitest";
import * as ClipTypes from "./ClipTypes";

test("initializeClip", () => {
  const clip = ClipTypes.initializeClip(ClipTypes.mockClip);
  expect(clip).toEqual({ ...ClipTypes.mockClip, id: clip.id });
  assert(typeof clip.id === "string");
});

test("isClip", () => {
  const validClip: ClipTypes.Clip = ClipTypes.initializeClip();
  assert(ClipTypes.isClip(validClip));

  const invalidClip = { stream: [], name: "Invalid" };
  assert(!ClipTypes.isClip(invalidClip));
});

test("isClipMap", () => {
  const validClipMap: ClipTypes.ClipMap = {
    "valid-clip": ClipTypes.initializeClip(),
  };
  assert(ClipTypes.isClipMap(validClipMap));

  const invalidClipMap = { "invalid-clip": { stream: [] } };
  assert(!ClipTypes.isClipMap(invalidClipMap));
});
