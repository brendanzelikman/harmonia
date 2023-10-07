import { test, expect } from "vitest";
import * as SessionFunctions from "./SessionFunctions";
import { mockScaleTrack } from "types/ScaleTrack";
import { mockPatternTrack } from "types/PatternTrack";
import { ClipMap, mockClip } from "types/Clip";
import { createTranspositionMap, mockTransposition } from "types/Transposition";
import { mockPatternTrackEntity, mockScaleTrackEntity } from "./SessionTypes";
import { createMap } from "types/util";

test("createSession", () => {
  // Create a mock session map
  const session = SessionFunctions.createSession({
    tracks: [mockScaleTrack, mockPatternTrack],
    clips: [mockClip],
    transpositions: [mockTransposition],
  });

  // Prepare the expected session map
  const expectedSession = {
    allIds: [mockScaleTrack.id, mockPatternTrack.id],
    byId: {
      [mockScaleTrack.id]: {
        ...mockScaleTrackEntity,
      },
      [mockPatternTrack.id]: {
        ...mockPatternTrackEntity,
        clipIds: [mockClip.id],
        transpositionIds: [mockTransposition.id],
      },
    },
    topLevelIds: [mockScaleTrack.id],
  };

  expect(session).toEqual(expectedSession);
});

test("getTrackClips", () => {
  const session = SessionFunctions.createSession({
    tracks: [mockScaleTrack, mockPatternTrack],
    clips: [mockClip],
    transpositions: [mockTransposition],
  });
  const sessionMap = session.byId;
  const clipMap = createMap<ClipMap>([mockClip]);

  // Test the scale track
  const scaleTrackClips = SessionFunctions.getTrackClips(
    mockScaleTrack,
    clipMap,
    sessionMap
  );
  expect(scaleTrackClips).toEqual([]);

  // Test the pattern track
  const patternTrackClips = SessionFunctions.getTrackClips(
    mockPatternTrack,
    clipMap,
    sessionMap
  );
  expect(patternTrackClips).toEqual([mockClip]);
});

test("getTrackTranspositions", () => {
  const session = SessionFunctions.createSession({
    tracks: [mockScaleTrack, mockPatternTrack],
    clips: [mockClip],
    transpositions: [mockTransposition],
  });
  const transpositionMap = createTranspositionMap([mockTransposition]);

  // Test the scale track
  const scaleTrackTranspositions = SessionFunctions.getTrackTranspositions(
    mockScaleTrack,
    transpositionMap,
    session.byId
  );
  expect(scaleTrackTranspositions).toEqual([]);

  // Test the pattern track
  const patternTrackTranspositions = SessionFunctions.getTrackTranspositions(
    mockPatternTrack,
    transpositionMap,
    session.byId
  );
  expect(patternTrackTranspositions).toEqual([mockTransposition]);
});
