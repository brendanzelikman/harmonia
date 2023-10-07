import { assert, expect, test } from "vitest";
import * as TranspositionTypes from "./TranspositionTypes";

test("initializeTransposition", () => {
  // Test that the id is added
  const transposition = TranspositionTypes.initializeTransposition(
    TranspositionTypes.mockTransposition
  );
  expect(transposition).toEqual({
    ...TranspositionTypes.mockTransposition,
    id: transposition.id,
  });
});

test("isTransposition", () => {
  // Test a valid transposition
  const validTransposition: TranspositionTypes.Transposition =
    TranspositionTypes.initializeTransposition(
      TranspositionTypes.mockTransposition
    );
  assert(TranspositionTypes.isTransposition(validTransposition));

  // Test an invalid transposition
  const invalidTransposition = { id: "invalid", trackId: "Invalid" };
  assert(!TranspositionTypes.isTransposition(invalidTransposition));
});

test("isTranspositionMap", () => {
  // Test a valid transposition map
  const validTranspositionMap: TranspositionTypes.TranspositionMap = {
    "valid-transposition": TranspositionTypes.initializeTransposition(
      TranspositionTypes.mockTransposition
    ),
  };
  assert(TranspositionTypes.isTranspositionMap(validTranspositionMap));

  // Test an invalid transposition map
  const invalidTranspositionMap = {
    "invalid-transposition": { id: "invalid", trackId: "Invalid" },
  };
  assert(!TranspositionTypes.isTranspositionMap(invalidTranspositionMap));
});
