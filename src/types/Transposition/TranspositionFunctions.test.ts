import { expect, test } from "vitest";
import {
  Transposition,
  defaultTransposition,
  mockTransposition,
} from "./TranspositionTypes";
import * as TranspositionFunctions from "./TranspositionFunctions";

test("getTranspositionTag", () => {
  const tag = TranspositionFunctions.getTranspositionTag(mockTransposition);
  expect(tag).toContain(mockTransposition.id);
  expect(tag).toContain(mockTransposition.tick);
  expect(tag).toContain(mockTransposition.trackId);
});

test("getScalarOffsets", () => {
  const mockOffsets = TranspositionFunctions.getScalarOffsets(
    mockTransposition.offsets,
    ["mock_track"]
  );
  expect(mockOffsets).toEqual([mockTransposition.offsets.mock_track]);

  const invalidOffsets = TranspositionFunctions.getScalarOffsets(
    mockTransposition.offsets,
    undefined
  );
  expect(invalidOffsets).toEqual([]);
});

test("getScalarOffset", () => {
  const mockOffset = TranspositionFunctions.getScalarOffset(
    mockTransposition.offsets,
    "mock_track"
  );
  expect(mockOffset).toEqual(mockTransposition.offsets.mock_track);

  const invalidOffset = TranspositionFunctions.getScalarOffset(
    mockTransposition.offsets,
    undefined
  );
  expect(invalidOffset).toEqual(0);
});

test("getChromaticOffset", () => {
  const chromaticOffset = TranspositionFunctions.getChromaticOffset(
    mockTransposition.offsets
  );
  expect(chromaticOffset).toEqual(mockTransposition.offsets._chromatic);

  const invalidOffset = TranspositionFunctions.getChromaticOffset(undefined);
  expect(invalidOffset).toEqual(0);
});

test("getChordalOffset", () => {
  const chordalOffset = TranspositionFunctions.getChordalOffset(
    mockTransposition.offsets
  );
  expect(chordalOffset).toEqual(mockTransposition.offsets._self);

  const invalidOffset = TranspositionFunctions.getChordalOffset(undefined);
  expect(invalidOffset).toEqual(0);
});

test("getLastTransposition", () => {
  const transpositions: Transposition[] = [
    { ...defaultTransposition, id: "t1", tick: 0 },
    { ...defaultTransposition, id: "t2", tick: 1 },
    { ...defaultTransposition, id: "t3", tick: 2 },
    { ...defaultTransposition, id: "t4", tick: 3 },
  ];
  const t0 = TranspositionFunctions.getLastTransposition(transpositions, 0);
  expect(t0).toEqual(transpositions[0]);

  const t1 = TranspositionFunctions.getLastTransposition(transpositions, 1);
  expect(t1).toEqual(transpositions[1]);

  const t2 = TranspositionFunctions.getLastTransposition(transpositions, 2);
  expect(t2).toEqual(transpositions[2]);

  const t3 = TranspositionFunctions.getLastTransposition(transpositions, 3);
  expect(t3).toEqual(transpositions[3]);

  const t4 = TranspositionFunctions.getLastTransposition(transpositions, 4);
  expect(t4).toEqual(transpositions[3]);
});
