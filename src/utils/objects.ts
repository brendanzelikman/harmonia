import { inRange } from "lodash";
import { ID } from "types/units";

/** Create a map connecting IDs to objects from an array of objects. */
export const createMap = <T extends { id: ID; [key: string]: any }>(
  values: T[]
) => {
  return values.reduce((acc, value) => {
    acc[value.id] = value;
    return acc;
  }, {} as Record<ID, T>);
};

/** Create a map grouping objects with the field provided. */
export const createMapByField = <T extends Record<ID, any>>(
  values: T[],
  field: keyof T
): Record<string, T[]> => {
  return values.reduce((acc, value) => {
    const key = value[field];
    acc[key] = [...(acc[key] ?? []), value];
    return acc;
  }, {} as Record<string, T[]>);
};

/** Create a map overwriting values with the provided function */
export const createMapWithFn = <
  OldValue extends { id: ID; [key: string]: any },
  OldEntry extends OldValue | OldValue[],
  NewValue extends unknown
>(
  oldRecord: Record<ID, OldEntry>,
  fn: (oldEntry: OldEntry) => NewValue
) => {
  return Object.keys(oldRecord).reduce((acc, key) => {
    acc[key] = fn(oldRecord[key]);
    return acc;
  }, {} as Record<string, NewValue>);
};

/** Create a string from an item or array of items. */
export const toString = <T>(items?: T | T[], _toString?: (t: T) => string) => {
  const toString = (t: T) => (_toString ? _toString(t) : JSON.stringify(t));
  return Array.isArray(items)
    ? items.map(toString).join(",")
    : items
    ? toString(items)
    : "";
};

/** Gets the keys of an object or an array of objects. */
export const getKeys = <T extends Record<string, any>>(
  obj?: T | T[]
): string[] => {
  if (!obj) return [];
  return Array.isArray(obj)
    ? obj.flatMap((o) => Object.keys(o))
    : Object.keys(obj);
};

/** Gets the values of an object or an array of objects. */
export const getValues = <T extends Record<string, any>>(
  obj: T | T[]
): T[keyof T][] => {
  return Array.isArray(obj)
    ? obj.flatMap((o) => Object.values(o))
    : Object.values(obj);
};

/** Get an object from a record by key or return undefined. */
export const getValueByKey = <T, K extends keyof T>(obj?: T, key?: K) => {
  return key !== undefined ? obj?.[key] : undefined;
};

/** Get an array from a record by key or return an empty array. */
export const getArrayByKey = <T, K extends keyof T>(obj?: T, key?: K) => {
  return getValueByKey(obj, key) || ([] as T[K]);
};

/** Get an array of objects from a record using the given keys. */
export const getValuesByKeys = <T, K extends keyof T>(
  obj: T,
  keys: (K | undefined)[]
): T[K][] => {
  return keys.map((key) => getValueByKey(obj, key)).filter(Boolean) as T[K][];
};

/** Returns the number of keys of an object. */
export const getKeyCount = (obj: Record<string, any>) => {
  return Object.keys(obj).length;
};

/** Returns true if an object has any keys. */
export const hasKeys = (obj: Record<string, any>) => {
  return Object.keys(obj).length > 0;
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
