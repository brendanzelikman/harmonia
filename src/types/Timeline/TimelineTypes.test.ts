import { test, expect } from "vitest";
import * as _ from "./TimelineTypes";

test("isTimelineState should only return true for valid timeline states", () => {
  expect(_.isTimelineState("idle")).toBe(true);
  expect(_.isTimelineState("addingClips")).toBe(true);
  expect(_.isTimelineState("not-idle")).toBe(false);
  expect(_.isTimelineState({})).toBe(false);
});

test("isTimelineCell should only return true for valid timeline cells", () => {
  expect(_.isTimelineCell(_.DEFAULT_CELL)).toBe(true);
  expect(_.isTimelineCell({})).toBe(false);
});

test("islivePoseSettings should only return true for valid settings", () => {
  expect(_.isLivePoseSettings(_.defaultTimeline.livePoseSettings)).toBe(true);
  expect(_.isLivePoseSettings({})).toBe(false);
  expect(_.isLivePoseSettings({ transpose: 1 })).toBe(false);
  expect(_.isLivePoseSettings({ enabled: true })).toBe(false);
});

test("isTimeline should only return true for valid timelines", () => {
  expect(_.isTimeline(_.defaultTimeline)).toBe(true);
  expect(_.isTimeline({})).toBe(false);
  expect(_.isTimeline({ state: "idle" })).toBe(false);
  expect(_.isTimeline({ ..._.defaultTimeline, state: "not-idle" })).toBe(false);
});
