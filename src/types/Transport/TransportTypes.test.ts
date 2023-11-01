import { test, expect } from "vitest";
import * as _ from "./TransportTypes";

test("isTransport should only return true for valid transports", () => {
  expect(_.isTransport(_.defaultTransport)).toBe(true);
  expect(_.isTransport({ ..._.defaultTransport, bpm: "fast" })).toBe(false);
  expect(_.isTransport({ ..._.defaultTransport, loop: "true" })).toBe(false);
  expect(_.isTransport({ ..._.defaultTransport, state: "play" })).toBe(false);
  expect(_.isTransport({ ..._.defaultTransport, volume: "loud" })).toBe(false);
});
