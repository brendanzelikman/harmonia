import { expect, test } from "vitest";
import * as _ from "./PoseFunctions";
import * as vector from "utils/vector";
import { getVectorValue } from "utils/vector";
import { Vector } from "utils/vector";

test("getChromaticOffset should return the correct chromatic value if it exists", () => {
  const chromaticOffset = vector.getVector_T({ chromatic: 5 });
  expect(chromaticOffset).toEqual(5);
});

test("getChromaticOffset should return 0 if the chromatic value does not exist", () => {
  expect(vector.getVector_T(undefined)).toEqual(0);
  expect(vector.getVector_T({})).toEqual(0);
  expect(vector.getVector_T({ chordal: 1 })).toEqual(0);
});

test("getChordalOffset should return the correct chordal value if it exists", () => {
  const chordalOffset = vector.getVector_t({ chordal: 5 });
  expect(chordalOffset).toEqual(5);
});

test("getChordalOffset should return 0 if the chordal value does not exist", () => {
  expect(vector.getVector_t(undefined)).toEqual(0);
  expect(vector.getVector_t({})).toEqual(0);
  expect(vector.getVector_t({ chromatic: 1 })).toEqual(0);
});

test("getPoseOffsetById should return the correct value if it exists", () => {
  const offset = getVectorValue({ "pattern-track_1": 5 }, "pattern-track_1");
  expect(offset).toEqual(5);
});

test("getPoseOffsetById should return 0 if the value does not exist", () => {
  expect(getVectorValue(undefined, "pattern-track_1")).toEqual(0);
  expect(getVectorValue({} as Vector, "pattern-track_1")).toEqual(0);
  expect(getVectorValue({ chromatic: 1 } as Vector, "pattern-track_1")).toEqual(
    0
  );
});
