import { Dictionary } from "@reduxjs/toolkit";
import { inRange, isNumber } from "lodash";

export type Dict<T = any> = Dictionary<T>;

/** Gets the values of a dictionary. */
export const getDictValues = <T>(obj: Dictionary<T>) => {
  return Object.values(obj).filter((v) => v !== undefined) as T[];
};

/** Get an object from a record by key or return undefined. */
export const getValueByKey = <T, K extends keyof T>(obj?: T, key?: K) => {
  return key === undefined ? undefined : obj?.[key];
};

/** Get a properly typed array from a record by key or return an empty array. */
export const getArrayByKey = <
  T extends Dictionary<S>,
  S extends any = NonNullable<T[keyof T]>
>(
  obj?: T,
  key?: keyof T
) => {
  if (obj === undefined || obj === null) return [] as NonNullable<S>;
  if (key === undefined || key === null) return [] as NonNullable<S>;
  const value = obj?.[key];
  if (value === undefined || value === null) return [] as NonNullable<S>;
  return value as NonNullable<S>;
};

/** Get an array of objects from a record using the given keys. */
export const getValuesByKeys = <T, K extends keyof T>(obj: T, keys: K[]) => {
  return keys
    .map((key) => getValueByKey(obj, key))
    .filter(Boolean) as NonNullable<T[K]>[];
};

/** Find the first entry containing the value within the given record. */
export const findEntry = (value: unknown, object: Record<any, unknown>) => {
  return Object.entries(object).find(([, v]) => v === value);
};

/** Splice or push to an array */
export const spliceOrPush = <T>(
  array: T[],
  value: T,
  index: number | undefined
) => {
  if (index !== undefined && inRange(index, 0, array.length)) {
    array.splice(index, 0, value);
  } else {
    array.push(value);
  }
};

/** Pick a key from an object using a record of weights */
export const pickKeyByWeight = <T extends Record<string, number>>(
  weights: T
): keyof T => {
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  for (const key in weights) {
    random -= weights[key];
    if (random <= 0) return key;
  }
  return Object.keys(weights)[0];
};

/** Fold an array into an object indicating true for all members */
export const foldArrayToObject = <T extends string | number>(
  array: T[]
): Dict<boolean> => {
  return array.reduce((acc, key) => ({ ...acc, [key]: true }), {});
};
