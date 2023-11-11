import { expect, test } from "vitest";
import * as _ from "./PoseTypes";

test("initializePose should create a pose with a unique ID", () => {
  const p1 = _.initializePose();
  const p2 = _.initializePose(p1);
  expect(p2.id).toBeDefined();
  expect(p2.id).not.toEqual(p1.id);
});

test("isPoseVector should only return true for valid vectors", () => {
  expect(_.isPoseVector({})).toBe(true);
  expect(_.isPoseVector(_.defaultPose.vector)).toBe(true);
  expect(_.isPoseVector(_.mockPose.vector)).toBe(true);

  expect(_.isPoseVector({ chromatic: "1" })).toBe(false);
  expect(_.isPoseVector(undefined)).toBe(false);
  expect(_.isPoseVector([])).toBe(false);
});

test("isPose should only return true for valid poses", () => {
  expect(_.isPose(_.defaultPose)).toBe(true);
  expect(_.isPose(_.mockPose)).toBe(true);
  expect(_.isPose({ ..._.mockPose, duration: 0 })).toBe(true);
  expect(_.isPose({ ..._.mockPose, duration: Infinity })).toBe(true);
  expect(_.isPose({ ..._.mockPose, duration: undefined })).toBe(true);

  expect(_.isPose({ ..._.mockPose, duration: "0" })).toBe(false);
  expect(_.isPose({ ..._.mockPose, id: 1 })).toBe(false);
  expect(_.isPose({ ..._.mockPose, tick: "1" })).toBe(false);
  expect(_.isPose(undefined)).toBe(false);
  expect(_.isPose([])).toBe(false);
});
