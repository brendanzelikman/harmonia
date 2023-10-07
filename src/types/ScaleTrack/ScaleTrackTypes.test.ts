import { expect, test } from "vitest";
import * as ScaleTrackTypes from "./ScaleTrackTypes";

test("initializeScaleTrack", () => {
  const track = ScaleTrackTypes.initializeScaleTrack(
    ScaleTrackTypes.mockScaleTrack
  );
  expect(track).toEqual({ ...ScaleTrackTypes.mockScaleTrack, id: track.id });
});

test("isScaleTrack", () => {
  expect(
    ScaleTrackTypes.isScaleTrack(ScaleTrackTypes.mockScaleTrack)
  ).toBeTruthy();
  expect(ScaleTrackTypes.isScaleTrack({})).toBeFalsy();
});

test("isScaleTrackMap", () => {
  const validScaleTrackMap: ScaleTrackTypes.ScaleTrackMap = {
    "mock-scale-track": ScaleTrackTypes.mockScaleTrack,
  };
  expect(ScaleTrackTypes.isScaleTrackMap(validScaleTrackMap)).toBeTruthy();

  const invalidScaleTrackMap = {
    "mock-scale-track": "invalid",
  };
  expect(ScaleTrackTypes.isScaleTrackMap(invalidScaleTrackMap)).toBeFalsy();
});
