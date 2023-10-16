import { test, expect } from "vitest";
import * as Types from "./TrackHierarchyTypes";
import { mockScaleTrack } from "types/ScaleTrack";
import { mockPatternTrack } from "types/PatternTrack";

test("isTrackHierarchy", () => {
  const validHierarchy: Types.TrackHierarchy = {
    allIds: [mockScaleTrack.id, mockPatternTrack.id],
    byId: {
      [mockScaleTrack.id]: Types.mockScaleTrackNode,
      [mockPatternTrack.id]: Types.mockPatternTrackNode,
    },
    topLevelIds: [mockScaleTrack.id],
  };
  expect(Types.isTrackHierarchy(validHierarchy)).toBeTruthy();

  const invalidHierarchy = {
    "mock-hierarchy": "invalid",
  };
  expect(Types.isTrackHierarchy(invalidHierarchy)).toBeFalsy();
});

test("isTrackNode", () => {
  // Test valid nodes
  expect(Types.isTrackNode(Types.mockScaleTrackNode)).toBeTruthy();
  expect(Types.isTrackNode(Types.mockPatternTrackNode)).toBeTruthy();

  // Test invalid nodes
  expect(Types.isTrackNode({})).toBeFalsy();
  expect(Types.isTrackNode(mockScaleTrack)).toBeFalsy();
  expect(Types.isTrackNode(mockPatternTrack)).toBeFalsy();
});
