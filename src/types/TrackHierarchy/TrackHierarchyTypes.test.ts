import { test, expect } from "vitest";
import * as _ from "./TrackHierarchyTypes";
import { mockScaleTrack } from "types/ScaleTrack";
import { mockPatternTrack } from "types/PatternTrack";

test("isTrackNode should only return true for valid track nodes", () => {
  expect(_.isTrackNode(_.mockScaleTrackNode)).toBe(true);
  expect(_.isTrackNode(_.mockPatternTrackNode)).toBe(true);

  expect(_.isTrackNode({})).toBe(false);
  expect(_.isTrackNode(mockScaleTrack)).toBe(false);
  expect(_.isTrackNode(mockPatternTrack)).toBe(false);
});

test("isTrackHierarchy should return true for valid hierarchies", () => {
  expect(_.isTrackHierarchy({ allIds: [], byId: {}, topLevelIds: [] })).toBe(
    true
  );
  expect(
    _.isTrackHierarchy({
      allIds: [mockScaleTrack.id, mockPatternTrack.id],
      byId: {
        [mockScaleTrack.id]: _.mockScaleTrackNode,
        [mockPatternTrack.id]: _.mockPatternTrackNode,
      },
      topLevelIds: [mockScaleTrack.id],
    })
  ).toBe(true);
});

test("isTrackHierarchy should return false for invalid hierarchies", () => {
  expect(_.isTrackHierarchy(undefined)).toBe(false);
  expect(_.isTrackHierarchy({})).toBe(false);
  expect(_.isTrackHierarchy({ allIds: [], byId: {} })).toBe(false);
  expect(
    _.isTrackHierarchy({
      allIds: [mockScaleTrack.id, mockPatternTrack.id],
      byId: {
        [mockScaleTrack.id]: _.mockScaleTrackNode,
        [mockPatternTrack.id]: _.mockPatternTrackNode,
      },
      topLevelIds: [mockScaleTrack],
    })
  ).toBe(false);
});
