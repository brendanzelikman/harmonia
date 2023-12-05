import { test, expect } from "vitest";
import * as _ from "./TimelineTypes";

test("isTimelineState should only return true for valid timeline states", () => {
  expect(_.isTimelineState("idle")).toBe(true);
  expect(_.isTimelineState("addingPatternClips")).toBe(true);
  expect(_.isTimelineState("not-idle")).toBe(false);
  expect(_.isTimelineState({})).toBe(false);
});

test("isTimelineCell should only return true for valid timeline cells", () => {
  expect(_.isTimelineCell(_.DEFAULT_CELL)).toBe(true);
  expect(_.isTimelineCell({})).toBe(false);
});

test("isLivePlay should only return true for valid settings", () => {
  expect(_.isLivePlay(_.defaultTimeline.livePlay)).toBe(true);
  expect(_.isLivePlay({})).toBe(false);
  expect(_.isLivePlay({ transpose: 1 })).toBe(false);
  expect(_.isLivePlay({ enabled: true })).toBe(false);
});

test("isTimeline should only return true for valid timelines", () => {
  expect(_.isTimeline(_.defaultTimeline)).toBe(true);
  expect(_.isTimeline({})).toBe(false);
  expect(_.isTimeline({ state: "idle" })).toBe(false);
  expect(_.isTimeline({ ..._.defaultTimeline, state: "not-idle" })).toBe(false);
});
