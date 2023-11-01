import { expect, test } from "vitest";
import {
  initializeTransposition,
  mockTransposition,
} from "./TranspositionTypes";
import * as _ from "./TranspositionFunctions";

test("getTranspositionTag", () => {
  const tag = _.getTranspositionAsString(mockTransposition);
  expect(tag).toContain(mockTransposition.id);
  expect(tag).toContain(mockTransposition.tick);
  expect(tag).toContain(mockTransposition.trackId);
});

test("getChromaticOffset should return the correct chromatic value if it exists", () => {
  const chromaticOffset = _.getChromaticOffset(mockTransposition.vector);
  expect(chromaticOffset).toEqual(mockTransposition.vector.chromatic);
});

test("getChromaticOffset should return 0 if the chromatic value does not exist", () => {
  expect(_.getChromaticOffset(undefined)).toEqual(0);
  expect(_.getChromaticOffset({})).toEqual(0);
  expect(_.getChromaticOffset({ chordal: 1 })).toEqual(0);
});

test("getChordalOffset should return the correct chordal value if it exists", () => {
  const chordalOffset = _.getChordalOffset(mockTransposition.vector);
  expect(chordalOffset).toEqual(mockTransposition.vector.chordal);
});

test("getChordalOffset should return 0 if the chordal value does not exist", () => {
  expect(_.getChordalOffset(undefined)).toEqual(0);
  expect(_.getChordalOffset({})).toEqual(0);
  expect(_.getChordalOffset({ chromatic: 1 })).toEqual(0);
});

test("getTranspositionOffsetById should return the correct value if it exists", () => {
  const offset = _.getTranspositionOffsetById(
    mockTransposition.vector,
    "mock_track"
  );
  expect(offset).toEqual(mockTransposition.vector.mock_track);
});

test("getTranspositionOffsetById should return 0 if the value does not exist", () => {
  expect(_.getTranspositionOffsetById(undefined, "mock_track")).toEqual(0);
  expect(_.getTranspositionOffsetById({}, "mock_track")).toEqual(0);
  expect(_.getTranspositionOffsetById({ chromatic: 1 }, "mock_track")).toEqual(
    0
  );
});

test("getTranspositionOffsetsById should return the correct values if they exist", () => {
  const offsets = _.getTranspositionOffsetsById(mockTransposition.vector, [
    "chromatic",
    "chordal",
    "mock_track",
  ]);
  expect(offsets).toEqual([
    mockTransposition.vector.chromatic,
    mockTransposition.vector.chordal,
    mockTransposition.vector.mock_track,
  ]);
});

test("getTranspositionOffsetsById should return 0 where the values do not exist", () => {
  const offsets = _.getTranspositionOffsetsById(mockTransposition.vector, [
    "mock_track",
    "mock_track_2",
  ]);
  expect(offsets).toEqual([mockTransposition.vector.mock_track, 0]);
});

test("getCurrentTransposition should correctly return the current transposition if it exists", () => {
  const t1 = initializeTransposition({ tick: 1, duration: 3 });
  const t2 = initializeTransposition({ tick: 2, duration: 1 });
  const t3 = initializeTransposition({ tick: 3 });
  const transpositions = [t1, t2, t3];

  expect(_.getCurrentTransposition(transpositions, 0)).toEqual(undefined);
  expect(_.getCurrentTransposition(transpositions, 1)).toEqual(t1);
  expect(_.getCurrentTransposition(transpositions, 2)).toEqual(t2);
  expect(_.getCurrentTransposition(transpositions, 3)).toEqual(t3);
});
