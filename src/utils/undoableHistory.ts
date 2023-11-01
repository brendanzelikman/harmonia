// ------------------------------------------------------------
// Undoable Type Definitions
// ------------------------------------------------------------

import { isArray, isPlainObject } from "lodash";
import { NormalObject, isNormalState } from "./normalizedState";

export interface UndoableHistory<T = NormalObject> {
  present: T;
  past: T[];
  future: T[];
}

// ------------------------------------------------------------
// Undoable Type Initializations
// ------------------------------------------------------------

/** Create an undoable history from a type. */
export function createUndoableHistory<T>(initialValue: T): UndoableHistory<T> {
  return { present: initialValue, past: [], future: [] };
}

/** Clear the history of an undoable history. */
export function clearUndoableHistory<T>(
  history: UndoableHistory<T>
): UndoableHistory<T> {
  return { ...history, past: [], future: [] };
}

// ------------------------------------------------------------
// Undoable Type Guards
// ------------------------------------------------------------

/** Checks if a given object is of type `UndoableHistory`. */
export const isUndoableHistory = (
  obj: unknown,
  isObj?: (obj: unknown) => obj is any
): obj is UndoableHistory => {
  const candidate = obj as UndoableHistory;
  return (
    isPlainObject(candidate) &&
    isArray(candidate.past) &&
    isArray(candidate.future) &&
    (!isObj ||
      (isNormalState(candidate.present, isObj) &&
        candidate.past.every((state) => isNormalState(state, isObj)) &&
        candidate.future.every((state) => isNormalState(state, isObj))))
  );
};
