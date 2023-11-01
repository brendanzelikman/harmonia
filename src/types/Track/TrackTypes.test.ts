import { expect, test } from "vitest";
import * as _ from "./TrackTypes";
import { mockPatternTrack } from "types/PatternTrack";
import { mockScaleTrack } from "types/ScaleTrack";

test("initializeTrackInterface should create a TrackInterface with a unique ID", () => {
  const oldTrack = _.initializeTrackInterface();
  const track = _.initializeTrackInterface(oldTrack);
  expect(track.id).toBeDefined();
  expect(track.id).not.toEqual(oldTrack.id);
});

test("isTrackInterface should only return true for valid interfaces", () => {
  expect(_.isTrackInterface(_.defaultTrackInterface)).toBe(true);
  expect(_.isTrackInterface(_.mockTrackInterface)).toBe(true);
  expect(_.isTrackInterface(mockScaleTrack)).toBe(true);
  expect(_.isTrackInterface(mockPatternTrack)).toBe(true);

  expect(_.isTrackInterface(undefined)).toBe(false);
  expect(_.isTrackInterface({})).toBe(false);
  expect(_.isTrackInterface([])).toBe(false);
});

test("isTrack should only return true for valid tracks", () => {
  expect(_.isTrack(mockScaleTrack)).toBe(true);
  expect(_.isTrack(mockPatternTrack)).toBe(true);

  expect(_.isTrack(undefined)).toBe(false);
  expect(_.isTrack(_.defaultTrackInterface)).toBe(false);
  expect(_.isTrack(_.mockTrackInterface)).toBe(false);
  expect(_.isTrack({})).toBe(false);
  expect(_.isTrack([])).toBe(false);
});
