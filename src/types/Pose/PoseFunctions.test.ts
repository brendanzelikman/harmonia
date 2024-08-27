import { expect, test } from "vitest";
import * as _ from "./PoseFunctions";
import { defaultPose, Pose, PoseStream, PoseStreamModule } from "./PoseTypes";

test("getChromaticOffset should return the correct chromatic value if it exists", () => {
  const chromaticOffset = _.getVector_N({ chromatic: 5 });
  expect(chromaticOffset).toEqual(5);
});

test("getChromaticOffset should return 0 if the chromatic value does not exist", () => {
  expect(_.getVector_N(undefined)).toEqual(0);
  expect(_.getVector_N({})).toEqual(0);
  expect(_.getVector_N({ chordal: 1 })).toEqual(0);
});

test("getChordalOffset should return the correct chordal value if it exists", () => {
  const chordalOffset = _.getVector_t({ chordal: 5 });
  expect(chordalOffset).toEqual(5);
});

test("getChordalOffset should return 0 if the chordal value does not exist", () => {
  expect(_.getVector_t(undefined)).toEqual(0);
  expect(_.getVector_t({})).toEqual(0);
  expect(_.getVector_t({ chromatic: 1 })).toEqual(0);
});

test("getPoseOffsetById should return the correct value if it exists", () => {
  const offset = _.getVectorOffsetById(
    { "pattern-track_1": 5 },
    "pattern-track_1"
  );
  expect(offset).toEqual(5);
});

test("getPoseOffsetById should return 0 if the value does not exist", () => {
  expect(_.getVectorOffsetById(undefined, "pattern-track_1")).toEqual(0);
  expect(_.getVectorOffsetById({}, "pattern-track_1")).toEqual(0);
  expect(_.getVectorOffsetById({ chromatic: 1 }, "pattern-track_1")).toEqual(0);
});

test("getPoseOffsetsById should return the correct values if they exist", () => {
  const offsets = _.getVectorOffsetsById(
    { "pattern-track_1": 3, chromatic: 1, chordal: 2 },
    ["chromatic", "chordal", "pattern-track_1"]
  );
  expect(offsets).toEqual([1, 2, 3]);
});
