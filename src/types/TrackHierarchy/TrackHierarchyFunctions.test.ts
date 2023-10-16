import { test, expect } from "vitest";
import * as Functions from "./TrackHierarchyFunctions";
import { mockScaleTrack } from "types/ScaleTrack";
import { mockPatternTrack } from "types/PatternTrack";
import { ClipMap, mockClip } from "types/Clip";
import { createTranspositionMap, mockTransposition } from "types/Transposition";
import {
  mockPatternTrackNode,
  mockScaleTrackNode,
} from "./TrackHierarchyTypes";
import { createMap } from "types/util";

test("createHierarchy", () => {
  // Create a mock hierarchy
  const hierarchy = Functions.createTrackHierarchy({
    tracks: [mockScaleTrack, mockPatternTrack],
    clips: [mockClip],
    transpositions: [mockTransposition],
  });

  // Prepare the expected hierarchy
  const expectedHierarchy = {
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
  };

  expect(hierarchy).toEqual(expectedHierarchy);
});

test("getTrackClips", () => {
  const hierarchy = Functions.createTrackHierarchy({
    tracks: [mockScaleTrack, mockPatternTrack],
    clips: [mockClip],
    transpositions: [mockTransposition],
  });
  const trackNodeMap = hierarchy.byId;
  const clipMap = createMap<ClipMap>([mockClip]);

  // Test the scale track
  const scaleTrackClips = Functions.getTrackClips(
    mockScaleTrack,
    clipMap,
    trackNodeMap
  );
  expect(scaleTrackClips).toEqual([]);

  // Test the pattern track
  const patternTrackClips = Functions.getTrackClips(
    mockPatternTrack,
    clipMap,
    trackNodeMap
  );
  expect(patternTrackClips).toEqual([mockClip]);
});

test("getTrackTranspositions", () => {
  const hierarchy = Functions.createTrackHierarchy({
    tracks: [mockScaleTrack, mockPatternTrack],
    clips: [mockClip],
    transpositions: [mockTransposition],
  });
  const transpositionMap = createTranspositionMap([mockTransposition]);

  // Test the scale track
  const scaleTrackTranspositions = Functions.getTrackTranspositions(
    mockScaleTrack,
    transpositionMap,
    hierarchy.byId
  );
  expect(scaleTrackTranspositions).toEqual([]);

  // Test the pattern track
  const patternTrackTranspositions = Functions.getTrackTranspositions(
    mockPatternTrack,
    transpositionMap,
    hierarchy.byId
  );
  expect(patternTrackTranspositions).toEqual([mockTransposition]);
});
