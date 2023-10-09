import { test, expect } from "vitest";
import * as TrackFunctions from "./TrackFunctions";
import {
  mockPatternTrack,
  initializePatternTrack,
} from "types/PatternTrack/PatternTrackTypes";
import {
  mockScaleTrack,
  initializeScaleTrack,
  ScaleTrackMap,
} from "types/ScaleTrack/ScaleTrackTypes";
import { createMap } from "types/util";

test("getTrackTag", () => {
  // Test a scale track
  const scaleTrackTag = TrackFunctions.getTrackTag(mockScaleTrack);
  expect(scaleTrackTag).include(mockScaleTrack.id);
  expect(scaleTrackTag).include(mockScaleTrack.name);
  expect(scaleTrackTag).include(mockScaleTrack.type);

  // Test a pattern track
  const patternTrackTag = TrackFunctions.getTrackTag(mockPatternTrack);
  expect(patternTrackTag).include(mockPatternTrack.id);
  expect(patternTrackTag).include(mockPatternTrack.name);
  expect(patternTrackTag).include(mockPatternTrack.type);
});

test("getTrackParents", () => {
  const parentTrack = initializeScaleTrack({
    ...mockScaleTrack,
  });
  const childTrack = initializeScaleTrack({
    ...mockScaleTrack,
    parentId: parentTrack.id,
  });
  const babyTrack = initializePatternTrack({
    ...mockPatternTrack,
    parentId: childTrack.id,
  });
  const trackMap = createMap<ScaleTrackMap>([parentTrack, childTrack]);

  // Test the parent track
  const parentParents = TrackFunctions.getTrackParents(parentTrack, trackMap);
  expect(parentParents).toEqual([parentTrack]);

  // Test the child track
  const childParents = TrackFunctions.getTrackParents(childTrack, trackMap);
  expect(childParents).toEqual([parentTrack, childTrack]);

  // Test the baby track
  const babyParents = TrackFunctions.getTrackParents(babyTrack, trackMap);
  expect(babyParents).toEqual([parentTrack, childTrack]);
});

test("getTrackChildren", () => {
  const parentTrack = initializeScaleTrack({
    ...mockScaleTrack,
  });
  const childTrack = initializeScaleTrack({
    ...mockScaleTrack,
    parentId: parentTrack.id,
  });
  const babyTrack = initializePatternTrack({
    ...mockPatternTrack,
    parentId: childTrack.id,
  });
});
