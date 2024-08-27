import { EntityState } from "@reduxjs/toolkit";
import { isArray, isPlainObject, merge, union } from "lodash";
import { Safe } from "./units";

// Require at least one key from a type (src: u/KPD on SO)
export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

export const isEntityState = (obj: unknown): obj is EntityState<any> => {
  const candidate = obj as EntityState<any>;
  return (
    isPlainObject(candidate) &&
    isArray(candidate.ids) &&
    isPlainObject(candidate.entities)
  );
};

// Returns true if an entity state contains an id anywhere
export const isIdInState = <T>(state?: Safe<EntityState<T>>, id = "") => {
  if (!state?.entities || !state.ids) return false;
  return id in state.entities || state.ids.includes(id);
};

/** Sanitize a normalized state with entities and IDs. */
export const mergeStates = <T extends EntityState<any> = EntityState<any>>(
  state: Safe<T>,
  defaultState: Safe<T>,
  guard?: (item: unknown) => boolean
): T => {
  const sanitizedState = {
    ids: union(defaultState?.ids ?? [], state?.ids ?? []),
    entities: merge({}, defaultState?.entities ?? {}, state?.entities ?? {}),
  } as T;

  // Iterate over the IDs to remove any that are not in the entities
  for (const id of sanitizedState.ids) {
    if (!(id in sanitizedState.entities)) {
      sanitizedState.ids = sanitizedState.ids.filter((i) => i !== id);
    }
  }

  // Iterate over the entities to remove any that are not in the IDs
  for (const id in sanitizedState.entities) {
    const entity = sanitizedState.entities[id];
    if (!guard?.(entity) || !sanitizedState.ids.includes(id)) {
      delete sanitizedState.entities[id];
      sanitizedState.ids = sanitizedState.ids.filter((i) => i !== id);
    }
  }

  return sanitizedState;
};

/* Return an item or an array as a guaranteed array */
export const asArray = <T>(item: T | T[]): T[] => {
  return Array.isArray(item) ? item : [item];
};

/** Returns true if an object is a finite number */
export const isFiniteNumber = (n: unknown): n is number => {
  return Number.isFinite(n);
};

/** Returns true if an object is a finite number within the given bounds */
export const isBoundedNumber = (
  n: unknown,
  min = -Infinity,
  max = Infinity
): n is number => {
  const candidate = n as number;
  return isFiniteNumber(n) && candidate >= min && candidate <= max;
};

/** Returns true if an object is optional or a type. */
export const isOptionalType = <T>(
  obj: unknown,
  check: (item: unknown) => item is T
): obj is T | undefined => {
  const candidate = obj as T;
  return candidate === undefined || check(candidate);
};

/** Returns true if an object is a typed array using the check provided. */
export const isTypedArray = <T>(
  obj: unknown,
  check: (item: unknown) => item is T
): obj is T[] => {
  const candidate = obj as T[];
  return isArray(candidate) && candidate.every(check);
};

/** Returns true if an object is undefined or a typed array. */
export const isOptionalTypedArray = <T>(
  obj: unknown,
  check: (item: unknown) => item is T
): obj is T[] | undefined => {
  const candidate = obj as T[];
  return obj === undefined || isTypedArray(candidate, check);
};

/** Returns true if all keys of an object are a type using the check provided. */
export const areObjectKeysTyped = <T extends string | number | symbol>(
  obj: unknown,
  check: (item: unknown) => item is T
): obj is Record<T, any> => {
  const candidate = obj as Record<T, any>;
  return (
    isPlainObject(candidate) && Object.keys(candidate).every((t) => check(t))
  );
};

/** Returns true if all values of an object are a type using the check provided. */
export const areObjectValuesTyped = <T>(
  obj: unknown,
  check: (item: unknown) => item is T
): obj is Record<any, T> => {
  const candidate = obj as Record<any, T>;
  return (
    isPlainObject(candidate) && Object.values(candidate).every((t) => check(t))
  );
};
