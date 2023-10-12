import { expect, test } from "vitest";
import * as ScaleTypes from "./ScaleTypes";

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
