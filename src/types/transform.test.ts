import { expect, test } from "vitest";
import { testTransform, lastTransformAtTick } from "./transform";

test("lastTransformAtTick", () => {
  const transforms = [
    testTransform(0, 0, 0, 0),
    testTransform(1, 0, 0, 1),
    testTransform(2, 0, 0, 2),
    testTransform(3, 0, 0, 3),
  ];
  expect(lastTransformAtTick(transforms, 0)).toEqual(transforms[0]);
  expect(lastTransformAtTick(transforms, 1)).toEqual(transforms[1]);
  expect(lastTransformAtTick(transforms, 2)).toEqual(transforms[2]);
  expect(lastTransformAtTick(transforms, 3)).toEqual(transforms[3]);
  expect(lastTransformAtTick(transforms, 4)).toEqual(transforms[3]);
  expect(lastTransformAtTick(transforms, 5)).toEqual(transforms[3]);
});
