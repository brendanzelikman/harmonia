import { test, expect } from "vitest";
import * as SessionTypes from "./SessionTypes";
import { mockScaleTrack } from "types/ScaleTrack";
import { mockPatternTrack } from "types/PatternTrack";

test("isSession", () => {
  const validSession: SessionTypes.Session = {
    allIds: [mockScaleTrack.id, mockPatternTrack.id],
    byId: {
      [mockScaleTrack.id]: SessionTypes.mockScaleTrackEntity,
      [mockPatternTrack.id]: SessionTypes.mockPatternTrackEntity,
    },
    topLevelIds: [mockScaleTrack.id],
  };
  expect(SessionTypes.isSession(validSession)).toBeTruthy();

  const invalidSession = {
    "mock-session": "invalid",
  };
  expect(SessionTypes.isSession(invalidSession)).toBeFalsy();
});

test("isSessionEntity", () => {
  // Test valid session entities
  expect(
    SessionTypes.isSessionEntity(SessionTypes.mockScaleTrackEntity)
  ).toBeTruthy();
  expect(
    SessionTypes.isSessionEntity(SessionTypes.mockPatternTrackEntity)
  ).toBeTruthy();

  // Test invalid session entities
  expect(SessionTypes.isSessionEntity({})).toBeFalsy();
  expect(SessionTypes.isSessionEntity(mockScaleTrack)).toBeFalsy();
  expect(SessionTypes.isSessionEntity(mockPatternTrack)).toBeFalsy();
});
