import { test, expect } from "vitest";
import * as ScaleTrackFunctions from "./ScaleTrackFunctions";
import {
  ScaleTrackMap,
  initializeScaleTrack,
  mockScaleTrack,
} from "./ScaleTrackTypes";
import { NestedScaleMap, initializeNestedScale } from "types/Scale/ScaleTypes";

test("getScaleTrackTag", () => {
  const tag = ScaleTrackFunctions.getScaleTrackTag(mockScaleTrack);
  expect(tag).toContain(mockScaleTrack.id);
  expect(tag).toContain(mockScaleTrack.name);
  expect(tag).toContain(mockScaleTrack.type);
});

test("getScaleTrackScale", () => {
  // Create a parent scale track with a C major scale
  const parentScale = initializeNestedScale({
    notes: [
      { degree: 0, offset: 0 },
      { degree: 2, offset: 0 },
      { degree: 4, offset: 0 },
      { degree: 5, offset: 0 },
      { degree: 7, offset: 0 },
      { degree: 9, offset: 0 },
      { degree: 11, offset: 0 },
    ],
  });
  const parentScaleTrack = initializeScaleTrack({
    ...mockScaleTrack,
    scaleId: parentScale.id,
  });

  // Create a child scale track with a C major 7 scale
  const childScale = initializeNestedScale({
    notes: [
      { degree: 0, offset: 0 },
      { degree: 2, offset: 0 },
      { degree: 4, offset: 0 },
      { degree: 6, offset: 0 },
    ],
  });
  const childScaleTrack = initializeScaleTrack({
    ...mockScaleTrack,
    parentId: parentScaleTrack.id,
    scaleId: childScale.id,
  });

  // Create the scale and track maps
  const scaleMap: NestedScaleMap = {
    [parentScale.id]: parentScale,
    [childScale.id]: childScale,
  };
  const scaleTrackMap: ScaleTrackMap = {
    [childScaleTrack.id]: childScaleTrack,
    [parentScaleTrack.id]: parentScaleTrack,
  };

  // Get the scale of the child scale track
  const scale = ScaleTrackFunctions.getScaleTrackScale(
    childScaleTrack,
    scaleTrackMap,
    scaleMap
  );
  expect(scale).toEqual([60, 64, 67, 71]);
});
