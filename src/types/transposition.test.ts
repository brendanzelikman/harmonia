import { expect, test } from "vitest";
import {
  Transposition,
  defaultTransposition,
  getLastTransposition,
} from "./transposition";

test("getLastTransposition", () => {
  const transpositions: Transposition[] = [
    { ...defaultTransposition, id: "t1", tick: 0 },
    { ...defaultTransposition, id: "t2", tick: 1 },
    { ...defaultTransposition, id: "t3", tick: 2 },
    { ...defaultTransposition, id: "t4", tick: 3 },
  ];
  expect(getLastTransposition(transpositions, 0)).toEqual(transpositions[0]);
  expect(getLastTransposition(transpositions, 1)).toEqual(transpositions[1]);
  expect(getLastTransposition(transpositions, 2)).toEqual(transpositions[2]);
  expect(getLastTransposition(transpositions, 3)).toEqual(transpositions[3]);
  expect(getLastTransposition(transpositions, 4)).toEqual(transpositions[3]);
  expect(getLastTransposition(transpositions, 5)).toEqual(transpositions[3]);
});
