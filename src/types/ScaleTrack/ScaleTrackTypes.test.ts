import { expect, test } from "vitest";
import * as _ from "./ScaleTrackTypes";
import { mockPatternTrack } from "types/PatternTrack";

test("initializeScaleTrack should create a scale track with a unique ID", () => {
  const oldTrack = _.initializeScaleTrack();
  const track = _.initializeScaleTrack(oldTrack);
  expect(track.id).toBeDefined();
  expect(track.id).not.toEqual(oldTrack.id);
});

test("isScaleTrack should only return true for valid scale tracks", () => {
  expect(_.isScaleTrack(_.defaultScaleTrack)).toBe(true);
  expect(_.isScaleTrack(_.mockScaleTrack)).toBe(true);

  expect(_.isScaleTrack(undefined)).toBe(false);
  expect(_.isScaleTrack({})).toBe(false);
  expect(_.isScaleTrack(mockPatternTrack)).toBe(false);
});

test("isScaleTrack should return false for tracks with the wrong type", () => {
  expect(_.isScaleTrack({ ..._.mockScaleTrack, type: undefined })).toBe(false);
  expect(_.isScaleTrack({ ..._.mockScaleTrack, type: "patternTrack" })).toBe(
    false
  );
});
