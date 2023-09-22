import { expect, test } from "vitest";
import { testTransposition, getLastTransposition } from "./transposition";

test("getLastTransposition", () => {
  const transpositions = [
    testTransposition({ N: 0, T: 0, t: 0, tick: 0 }),
    testTransposition({ N: 1, T: 0, t: 0, tick: 1 }),
    testTransposition({ N: 2, T: 0, t: 0, tick: 2 }),
    testTransposition({ N: 3, T: 0, t: 0, tick: 3 }),
  ];
  expect(getLastTransposition(transpositions, 0)).toEqual(transpositions[0]);
  expect(getLastTransposition(transpositions, 1)).toEqual(transpositions[1]);
  expect(getLastTransposition(transpositions, 2)).toEqual(transpositions[2]);
  expect(getLastTransposition(transpositions, 3)).toEqual(transpositions[3]);
  expect(getLastTransposition(transpositions, 4)).toEqual(transpositions[3]);
  expect(getLastTransposition(transpositions, 5)).toEqual(transpositions[3]);
});
