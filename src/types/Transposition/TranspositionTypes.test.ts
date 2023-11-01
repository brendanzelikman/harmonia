import { expect, test } from "vitest";
import * as _ from "./TranspositionTypes";

test("initializeTransposition should create a Transposition with a unique ID", () => {
  const p1 = _.initializeTransposition();
  const p2 = _.initializeTransposition(p1);
  expect(p2.id).toBeDefined();
  expect(p2.id).not.toEqual(p1.id);
});

test("isTranspositionVector should only return true for valid vectors", () => {
  expect(_.isTranspositionVector({})).toBe(true);
  expect(_.isTranspositionVector(_.defaultTransposition.vector)).toBe(true);
  expect(_.isTranspositionVector(_.mockPose.vector)).toBe(true);

  expect(_.isTranspositionVector({ chromatic: "1" })).toBe(false);
  expect(_.isTranspositionVector(undefined)).toBe(false);
  expect(_.isTranspositionVector([])).toBe(false);
});

test("isTransposition should only return true for valid transpositions", () => {
  expect(_.isTransposition(_.defaultTransposition)).toBe(true);
  expect(_.isTransposition(_.mockPose)).toBe(true);
  expect(_.isTransposition({ ..._.mockPose, duration: 0 })).toBe(true);
  expect(_.isTransposition({ ..._.mockPose, duration: Infinity })).toBe(true);
  expect(_.isTransposition({ ..._.mockPose, duration: undefined })).toBe(true);

  expect(_.isTransposition({ ..._.mockPose, duration: "0" })).toBe(false);
  expect(_.isTransposition({ ..._.mockPose, id: 1 })).toBe(false);
  expect(_.isTransposition({ ..._.mockPose, tick: "1" })).toBe(false);
  expect(_.isTransposition(undefined)).toBe(false);
  expect(_.isTransposition([])).toBe(false);
});
