import { test, expect } from "vitest";
import * as _ from "./TrackHierarchyFunctions";
import { mockScaleTrack } from "types/ScaleTrack";
import { mockPatternTrack } from "types/PatternTrack";
import { mockClip } from "types/Clip";
import { mockPose } from "types/Pose";
import {
  isTrackHierarchy,
  mockPatternTrackNode,
  mockScaleTrackNode,
} from "./TrackHierarchyTypes";

test("createHierarchy should produce a valid hierarchy", () => {
  const hierarchy = _.createTrackHierarchy({
    tracks: [mockScaleTrack, mockPatternTrack],
    clips: [mockClip],
    poses: [mockPose],
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
        poseIds: [mockPose.id],
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
    poses: [mockPose],
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
    poses: [mockPose],
  });
  const stClipIds = _.getTrackClipIds(mockScaleTrack.id, hierarchy.byId);
  expect(stClipIds).toEqual([]);
  const ptClipIds = _.getTrackClipIds(mockPatternTrack.id, hierarchy.byId);
  expect(ptClipIds).toEqual([mockClip.id]);
});

test("getTrackPoseIds should return the correct pose IDs of a track", () => {
  const hierarchy = _.createTrackHierarchy({
    tracks: [mockScaleTrack, mockPatternTrack],
    clips: [mockClip],
    poses: [mockPose],
  });
  const stPoses = _.getTrackPoseIds(mockScaleTrack.id, hierarchy.byId);
  expect(stPoses).toEqual([]);
  const ptPoses = _.getTrackPoseIds(mockPatternTrack.id, hierarchy.byId);
  expect(ptPoses).toEqual([mockPose.id]);
});
