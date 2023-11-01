import { test, expect } from "vitest";
import * as _ from "./TrackHierarchyFunctions";
import { mockScaleTrack } from "types/ScaleTrack";
import { mockPatternTrack } from "types/PatternTrack";
import { mockClip } from "types/Clip";
import { mockTransposition } from "types/Transposition";
import {
  isTrackHierarchy,
  mockPatternTrackNode,
  mockScaleTrackNode,
} from "./TrackHierarchyTypes";

test("createHierarchy should produce a valid hierarchy", () => {
  const hierarchy = _.createTrackHierarchy({
    tracks: [mockScaleTrack, mockPatternTrack],
    clips: [mockClip],
    transpositions: [mockTransposition],
  });
  expect(hierarchy).toEqual({
    allIds: [mockScaleTrack.id, mockPatternTrack.id],
    byId: {
      [mockScaleTrack.id]: {
        ...mockScaleTrackNode,
      },
      [mockPatternTrack.id]: {
        ...mockPatternTrackNode,
        clipIds: [mockClip.id],
        transpositionIds: [mockTransposition.id],
      },
    },
    topLevelIds: [mockScaleTrack.id],
  });
  expect(isTrackHierarchy(hierarchy)).toBe(true);
});

test("getTrackChildIds should return the correct child IDs of a track", () => {
  const hierarchy = _.createTrackHierarchy({
    tracks: [mockScaleTrack, mockPatternTrack],
    clips: [mockClip],
    transpositions: [mockTransposition],
  });
  const stChildIds = _.getTrackChildIds(mockScaleTrack.id, hierarchy.byId);
  expect(stChildIds).toEqual([mockPatternTrack.id]);
  const ptChildIds = _.getTrackChildIds(mockPatternTrack.id, hierarchy.byId);
  expect(ptChildIds).toEqual([]);
});

test("getTrackClipIds should return the correct clip IDs of a track", () => {
  const hierarchy = _.createTrackHierarchy({
    tracks: [mockScaleTrack, mockPatternTrack],
    clips: [mockClip],
    transpositions: [mockTransposition],
  });
  const stClipIds = _.getTrackClipIds(mockScaleTrack.id, hierarchy.byId);
  expect(stClipIds).toEqual([]);
  const ptClipIds = _.getTrackClipIds(mockPatternTrack.id, hierarchy.byId);
  expect(ptClipIds).toEqual([mockClip.id]);
});

test("getTrackTranspositionIds should return the correct transposition IDs of a track", () => {
  const hierarchy = _.createTrackHierarchy({
    tracks: [mockScaleTrack, mockPatternTrack],
    clips: [mockClip],
    transpositions: [mockTransposition],
  });
  const stPoses = _.getTrackTranspositionIds(mockScaleTrack.id, hierarchy.byId);
  expect(stPoses).toEqual([]);
  const ptPoses = _.getTrackTranspositionIds(
    mockPatternTrack.id,
    hierarchy.byId
  );
  expect(ptPoses).toEqual([mockTransposition.id]);
});
