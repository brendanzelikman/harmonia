import { expect, test } from "vitest";
import { initializePose, mockPose } from "./PoseTypes";
import * as _ from "./PoseFunctions";

test("getChromaticOffset should return the correct chromatic value if it exists", () => {
  const chromaticOffset = _.getChromaticOffset(mockPose.vector);
  expect(chromaticOffset).toEqual(mockPose.vector.chromatic);
});

test("getChromaticOffset should return 0 if the chromatic value does not exist", () => {
  expect(_.getChromaticOffset(undefined)).toEqual(0);
  expect(_.getChromaticOffset({})).toEqual(0);
  expect(_.getChromaticOffset({ chordal: 1 })).toEqual(0);
});

test("getChordalOffset should return the correct chordal value if it exists", () => {
  const chordalOffset = _.getChordalOffset(mockPose.vector);
  expect(chordalOffset).toEqual(mockPose.vector.chordal);
});

test("getChordalOffset should return 0 if the chordal value does not exist", () => {
  expect(_.getChordalOffset(undefined)).toEqual(0);
  expect(_.getChordalOffset({})).toEqual(0);
  expect(_.getChordalOffset({ chromatic: 1 })).toEqual(0);
});

test("getPoseOffsetById should return the correct value if it exists", () => {
  const offset = _.getPoseOffsetById(mockPose.vector, "mock_track");
  expect(offset).toEqual(mockPose.vector.mock_track);
});

test("getPoseOffsetById should return 0 if the value does not exist", () => {
  expect(_.getPoseOffsetById(undefined, "mock_track")).toEqual(0);
  expect(_.getPoseOffsetById({}, "mock_track")).toEqual(0);
  expect(_.getPoseOffsetById({ chromatic: 1 }, "mock_track")).toEqual(0);
});

test("getPoseOffsetsById should return the correct values if they exist", () => {
  const offsets = _.getPoseOffsetsById(mockPose.vector, [
    "chromatic",
    "chordal",
    "mock_track",
  ]);
  expect(offsets).toEqual([
    mockPose.vector.chromatic,
    mockPose.vector.chordal,
    mockPose.vector.mock_track,
  ]);
});

test("getPoseOffsetsById should return 0 where the values do not exist", () => {
  const offsets = _.getPoseOffsetsById(mockPose.vector, [
    "mock_track",
    "mock_track_2",
  ]);
  expect(offsets).toEqual([mockPose.vector.mock_track, 0]);
});

test("getCurrentPose should correctly return the current pose if it exists", () => {
  const t1 = initializePose({ tick: 1, duration: 3 });
  const t2 = initializePose({ tick: 2, duration: 1 });
  const t3 = initializePose({ tick: 3 });
  const poses = [t1, t2, t3];

  expect(_.getCurrentPose(poses, 0)).toEqual(undefined);
  expect(_.getCurrentPose(poses, 1)).toEqual(t1);
  expect(_.getCurrentPose(poses, 2)).toEqual(t2);
  expect(_.getCurrentPose(poses, 3)).toEqual(t3);
});
