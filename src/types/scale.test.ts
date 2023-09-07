import { expect, test } from "vitest";
import Scales, { transposeScale, rotateScale, testScale } from "./scale";

test("areEqual", () => {
  const scale = testScale([60, 61, 62]);
  const equalScale = testScale([60, 61, 62]);
  const unequalScale = testScale([60, 61, 63]);
  expect(Scales.areEqual(scale, equalScale)).toBe(true);
  expect(Scales.areEqual(scale, unequalScale)).toBe(false);
});

test("areRelated", () => {
  const scale = testScale([60, 61, 62]);
  const relatedScale1 = testScale([60, 61, 62]);
  const relatedScale2 = testScale([61, 62, 63]);
  const relatedScale3 = testScale([59, 60, 61]);
  const unrelatedScale1 = testScale([60, 61, 63]);
  const unrelatedScale2 = testScale([60, 61]);
  const unrelatedScale3 = testScale([60, 61, 62, 63]);
  expect(Scales.areRelated(scale, relatedScale1)).toBe(true);
  expect(Scales.areRelated(scale, relatedScale2)).toBe(true);
  expect(Scales.areRelated(scale, relatedScale3)).toBe(true);
  expect(Scales.areRelated(scale, unrelatedScale1)).toBe(false);
  expect(Scales.areRelated(scale, unrelatedScale2)).toBe(false);
  expect(Scales.areRelated(scale, unrelatedScale3)).toBe(false);
});

test("transposeScale", () => {
  const scale = testScale([60, 61, 62]);
  const transposedUp = transposeScale(scale, 20);
  const transposedDown = transposeScale(scale, -20);
  expect(scale.notes).toEqual([60, 61, 62]);
  expect(transposedUp.notes).toEqual([80, 81, 82]);
  expect(transposedDown.notes).toEqual([40, 41, 42]);
});

test("rotateScale", () => {
  const scale = testScale([60, 61, 62]);
  const rotatedUp1 = rotateScale(scale, 1);
  const rotatedUp2 = rotateScale(scale, 2);
  const rotatedUp3 = rotateScale(scale, 3);
  const rotatedDown1 = rotateScale(scale, -1);
  const rotatedDown2 = rotateScale(scale, -2);
  const rotatedDown3 = rotateScale(scale, -3);
  expect(scale.notes).toEqual([60, 61, 62]);
  expect(rotatedUp1.notes).toEqual([61, 62, 72]);
  expect(rotatedUp2.notes).toEqual([62, 72, 73]);
  expect(rotatedUp3.notes).toEqual([72, 73, 74]);
  expect(rotatedDown1.notes).toEqual([50, 60, 61]);
  expect(rotatedDown2.notes).toEqual([49, 50, 60]);
  expect(rotatedDown3.notes).toEqual([48, 49, 50]);
});
