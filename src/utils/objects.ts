import { Dictionary, EntityId } from "@reduxjs/toolkit";
import { inRange } from "lodash";
import { Vector } from "types/units";

/** Create a map connecting IDs to objects from an array of objects. */
export const createDictionary = <T extends { id: EntityId }>(values: T[]) => {
  const result = {} as Dictionary<T>;
  for (const value of values) {
    result[value.id] = value;
  }
  return result;
};

/** Create a map overwriting values with the provided function */
export const createMapWithFn = <
  OldRecord extends Dictionary<S>,
  F extends (oldEntry: NonNullable<S>) => ReturnType<F>,
  S extends any = OldRecord[keyof OldRecord],
  NewRecord extends Dictionary<ReturnType<F>> = Dictionary<ReturnType<F>>
>(
  oldRecord: OldRecord,
  fn: F
): NewRecord => {
  const result = {} as Dictionary<ReturnType<F>>;
  for (const id in oldRecord) {
    const oldEntry = oldRecord[id];
    if (oldEntry !== undefined && oldEntry !== null) {
      const newEntry = fn(oldEntry);
      result[id as Extract<keyof NewRecord, string>] = newEntry;
    }
  }
  return result as NewRecord;
};

/** Get the keys of a dictionary. */
export const getDictKeys = <T>(obj: Dictionary<T>): (keyof T)[] => {
  return Object.keys(obj) as (keyof T)[];
};

/** Gets the values of a dictionary. */
export const getDictValues = <T>(obj: Dictionary<T>) => {
  return Object.values(obj).filter((v) => v !== undefined) as T[];
};

/** Get the keys of a record. */
export const getRecordKeys = <T extends Record<any, any>>(
  obj?: T
): (keyof T)[] => {
  if (obj === undefined) return [];
  return Object.keys(obj) as (keyof T)[];
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

/** Returns true if an object has any keys. */
export const hasKeys = (obj?: Record<string, any>) => {
  return obj !== undefined && Object.keys(obj).length > 0;
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

/** Sum the numerical values in an array of records. */
export const sumVectors = <T extends Vector>(
  ...records: (T | undefined)[]
): T => {
  const result = {} as T;
  for (const record of records) {
    if (record === undefined) continue;
    for (const key in record) {
      const oldValue = result[key] ?? 0;
      const newValue = record[key] ?? 0;
      result[key] = (oldValue + newValue) as T[Extract<keyof T, string>];
    }
  }
  return result;
};
