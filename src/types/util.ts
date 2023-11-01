import { isArray, isPlainObject } from "lodash";

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
