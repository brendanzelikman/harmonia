import { expect, test } from "vitest";
import * as TrackTypes from "./TrackTypes";
import { mockPatternTrack } from "types/PatternTrack/PatternTrackTypes";
import { mockScaleTrack } from "types/ScaleTrack/ScaleTrackTypes";

test("initializeTrack", () => {
  // Test that the id is added
  const track = TrackTypes.initializeTrack(TrackTypes.mockTrack);
  expect(track).toEqual({ ...TrackTypes.mockTrack, id: track.id });
});

test("isTrack", () => {
  // Test valid tracks
  expect(TrackTypes.isTrack(mockScaleTrack)).toBeTruthy();
  expect(TrackTypes.isTrack(mockPatternTrack)).toBeTruthy();

  // Test invalid tracks
  expect(TrackTypes.isTrack({})).toBeFalsy();
  expect(TrackTypes.isTrack({ id: "invalid" })).toBeFalsy();
});

test("isTrackMap", () => {
  // Test a valid track map
  const validTrackMap: TrackTypes.TrackMap = {
    "mock-scale-track": mockScaleTrack,
    "mock-pattern-track": mockPatternTrack,
  };
  expect(TrackTypes.isTrackMap(validTrackMap)).toBeTruthy();

  // Test an invalid track map
  const invalidTrackMap = {
    "mock-scale-track": mockScaleTrack,
    "mock-pattern-track": "invalid",
  };
  expect(TrackTypes.isTrackMap(invalidTrackMap)).toBeFalsy();
});
