import { expect, test } from "vitest";
import * as ScaleTypes from "./ScaleTypes";
import { getRotatedScale, getTransposedScale } from "./ScaleFunctions";

test("initializeScale", () => {
  const scale = ScaleTypes.initializeScale();
  expect(scale).toBeDefined();
  expect(scale.id).toBeDefined();
  expect(scale.name).toBeDefined();
  expect(scale.notes).toBeDefined();
});

test("isScale", () => {
  // Test valid scales
  const validScaleObject: ScaleTypes.ScaleObject = {
    id: "valid-scale-object",
    name: "Valid Scale Object",
    notes: [60, 62, 64, 65, 67, 69, 71],
  };
  expect(ScaleTypes.isScale(validScaleObject)).toBeTruthy();

  const validScaleArray: ScaleTypes.ScaleArray = [60, 62, 64, 65, 67, 69, 71];
  expect(ScaleTypes.isScale(validScaleArray)).toBeTruthy();

  // Test invalid scales
  const invalidScaleObject = { name: "Invalid Scale" };
  expect(ScaleTypes.isScale(invalidScaleObject)).toBeFalsy();

  const invalidScaleArray = ["b"];
  expect(ScaleTypes.isScale(invalidScaleArray)).toBeFalsy();
});

test("isScaleObject", () => {
  // Test a valid scale object
  expect(ScaleTypes.isScaleObject(ScaleTypes.chromaticScale)).toBeTruthy();

  // Test an invalid scale object
  expect(ScaleTypes.isScaleObject(ScaleTypes.chromaticNotes)).toBeFalsy();
});

test("isScaleArray", () => {
  // Test a valid scale array
  expect(ScaleTypes.isScaleArray(ScaleTypes.chromaticNotes)).toBeTruthy();

  // Test an invalid scale array
  expect(ScaleTypes.isScaleArray(ScaleTypes.chromaticScale)).toBeFalsy();
});

test("unpackScale", () => {
  const notes = ScaleTypes.chromaticNotes;
  expect(ScaleTypes.unpackScale(ScaleTypes.chromaticScale)).toEqual(notes);
  expect(ScaleTypes.unpackScale(ScaleTypes.chromaticNotes)).toEqual(notes);
});

test("areScalesEqual", () => {
  const scale = ScaleTypes.mockScale;

  // Test an equal scale
  const equalScale = getTransposedScale(scale, 12);
  expect(ScaleTypes.areScalesEqual(scale, equalScale)).toBeTruthy();

  // Test an unequal scale
  const unequalScale = getTransposedScale(scale, 2);
  expect(ScaleTypes.areScalesEqual(scale, unequalScale)).toBeFalsy();
});

test("areScalesRelated", () => {
  const scale = ScaleTypes.mockScale;

  // Test a related scale
  const relatedScale = getTransposedScale(scale, 1);
  expect(ScaleTypes.areScalesRelated(scale, relatedScale)).toBeTruthy();

  // Test an unrelated scale
  const unrelatedScale = getRotatedScale(scale, 1);
  expect(ScaleTypes.areScalesRelated(scale, unrelatedScale)).toBeFalsy();
});

test("areScalesModes", () => {
  const scale = ScaleTypes.mockScale;

  // Test a mode
  const relatedScale = getRotatedScale(scale, 1);
  expect(ScaleTypes.areScalesModes(scale, relatedScale)).toBeTruthy();

  // Test an unrelated scale
  const unrelatedScale = ScaleTypes.unpackScale(scale).slice(1);
  expect(ScaleTypes.areScalesModes(scale, unrelatedScale)).toBeFalsy();
});
