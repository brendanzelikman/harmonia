import { expect, test } from "vitest";
import * as _ from "./PoseTypes";

test("initializePose should create a pose with a unique ID", () => {
  const p1 = _.initializePose();
  const p2 = _.initializePose(p1);
  expect(p2.id).toBeDefined();
  expect(p2.id).not.toEqual(p1.id);
});

test("isPoseStream should only return true for valid streams", () => {
  expect(_.isPoseStream([])).toBe(true);
  expect(_.isPoseStream([{ duration: 1, vector: { a: 1 } }])).toBe(true);
});

test("isPose should only return true for valid poses", () => {
  expect(_.isPose(_.defaultPose)).toBe(true);
  expect(_.isPose(undefined)).toBe(false);
  expect(_.isPose([])).toBe(false);
});
