import { expect, test } from "vitest";
import * as _ from "./PatternTrackTypes";
import { mockScaleTrack } from "types/ScaleTrack";

test("initializePatternTrack should create a pattern track with a unique ID", () => {
  const oldTrack = _.initializePatternTrack();
  const track = _.initializePatternTrack(oldTrack);
  expect(track.id).toBeDefined();
  expect(track.id).not.toEqual(oldTrack.id);
});

test("isPatternTrack should only return true for valid pattern tracks", () => {
  expect(_.isPatternTrack(_.mockPatternTrack)).toBe(true);

  expect(_.isPatternTrack(undefined)).toBe(false);
  expect(_.isPatternTrack({})).toBe(false);
  expect(_.isPatternTrack(mockScaleTrack)).toBe(false);
  expect(_.isPatternTrack({ ..._.mockPatternTrack, type: "scaleTrack" })).toBe(
    false
  );
});
