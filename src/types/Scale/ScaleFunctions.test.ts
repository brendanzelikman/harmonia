import { expect, test } from "vitest";
import * as ScaleFunctions from "./ScaleFunctions";
import { chromaticNotes, chromaticScale, mockScale } from "./ScaleTypes";

test("getScaleNotes", () => {
  const notes = chromaticNotes;
  expect(ScaleFunctions.getScaleNotes(chromaticScale)).toEqual(notes);
  expect(ScaleFunctions.getScaleNotes(chromaticNotes)).toEqual(notes);
});

test("mapNestedNote", () => {
  const n1 = ScaleFunctions.mapNestedNote(60);
  expect(n1).toEqual({ degree: 0, offset: 0 });

  const n2 = ScaleFunctions.mapNestedNote(61);
  expect(n2).toEqual({ degree: 1, offset: 0 });

  const n3 = ScaleFunctions.mapNestedNote(59);
  expect(n3).toEqual({ degree: 11, offset: -12 });
});

test("areScalesEqual", () => {
  const scale = mockScale;

  // Test an equal scale
  const equalScale = ScaleFunctions.getTransposedScale(scale, 12);
  expect(ScaleFunctions.areScalesEqual(scale, equalScale)).toBeTruthy();

  // Test an unequal scale
  const unequalScale = ScaleFunctions.getTransposedScale(scale, 2);
  expect(ScaleFunctions.areScalesEqual(scale, unequalScale)).toBeFalsy();
});

test("areScalesRelated", () => {
  const scale = mockScale;

  // Test a related scale
  const relatedScale = ScaleFunctions.getTransposedScale(scale, 1);
  expect(ScaleFunctions.areScalesRelated(scale, relatedScale)).toBeTruthy();

  // Test an unrelated scale
  const unrelatedScale = ScaleFunctions.getRotatedScale(scale, 1);
  expect(ScaleFunctions.areScalesRelated(scale, unrelatedScale)).toBeFalsy();
});

test("areScalesModes", () => {
  const scale = mockScale;

  // Test a mode
  const relatedScale = ScaleFunctions.getRotatedScale(scale, 1);
  expect(ScaleFunctions.areScalesModes(scale, relatedScale)).toBeTruthy();

  // Test an unrelated scale
  const unrelatedScale = ScaleFunctions.getScaleNotes(scale).slice(1);
  expect(ScaleFunctions.areScalesModes(scale, unrelatedScale)).toBeFalsy();
});
