import { test, expect } from "vitest";
import * as _ from "./TimelineTypes";

test("isTimelineState should only return true for valid timeline states", () => {
  expect(_.isTimelineState("idle")).toBe(true);
  expect(_.isTimelineState("adding-pattern-clips")).toBe(true);
  expect(_.isTimelineState("not-idle")).toBe(false);
  expect(_.isTimelineState({})).toBe(false);
});

test("isTimeline should only return true for valid timelines", () => {
  expect(_.isTimeline(_.defaultTimeline)).toBe(true);
  expect(_.isTimeline({})).toBe(true);
  expect(_.isTimeline({ state: "idle" })).toBe(true);
  expect(_.isTimeline({ ..._.defaultTimeline, state: "not-idle" })).toBe(false);
});
