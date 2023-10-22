import { Project } from "types/Project";
import { ID } from "./units";

/**
 * Create a map connecting IDs to objects from an array of objects.
 * @param values The array of objects.
 * @returns A record mapping IDs to objects.
 */
export const createMap = <T extends Record<ID, any>>(values: any[]): T => {
  return values.reduce((acc, value) => {
    acc[value.id] = value;
    return acc;
  }, {} as T);
};

/**
 * A normalized state consists of a map of objects by ID and an array of IDs.
 * @param K The type of the ID.
 * @param V The type of the object.
 */
export interface NormalizedState<K extends ID, V> {
  byId: Record<K, V>;
  allIds: K[];
}

/**
 * Checks if a given object is of type NormalizedState.
 * @param obj The object to check.
 * @returns True if the object is a NormalizedState, otherwise false.
 */
export const isNormalizedState = <K extends ID, V>(
  obj: unknown
): obj is NormalizedState<K, V> => {
  const candidate = obj as NormalizedState<K, V>;
  return candidate?.byId !== undefined && candidate?.allIds !== undefined;
};

/**
 * Create a normalized state from an initial array of values.
 * @param initialValues The initial array of values.
 * @returns A normalized state.
 */
export const initializeState = <K extends ID, V extends { id: ID }>(
  initialValues?: V[]
): NormalizedState<K, V> => {
  if (!initialValues) return { byId: {} as Record<K, V>, allIds: [] };
  const allIds = initialValues.map((value) => value.id as K) ?? [];
  const byId = createMap<Record<K, V>>(initialValues);
  return { byId, allIds };
};

/**
 * Get a property from a record by key.
 * @param obj The object to query.
 * @param key Optional. The key of the property to get.
 * @returns The object with the given ID. If no key is given, returns undefined.
 */
export const getProperty = <T, K extends keyof T>(obj: T, key?: K) => {
  return key !== undefined ? obj[key] : undefined;
};

/**
 * Get an array of properties from a record by ID.
 * @param obj The record of objects.
 * @param ids The IDs to look up.
 * @returns The objects with the given IDs.
 */
export const getProperties = <T, K extends keyof T>(
  obj: T,
  keys: (K | undefined)[]
): T[K][] => {
  return keys.map((key) => getProperty(obj, key)).filter(Boolean) as T[K][];
};

/**
 * Gets the keys of an object or an array of objects.
 * @param obj The object or array of objects.
 * @returns An array of keys.
 */
export const getKeys = <T extends Record<string, any>>(
  obj: T | T[]
): string[] => {
  return Array.isArray(obj)
    ? obj.flatMap((o) => Object.keys(o))
    : Object.keys(obj);
};

/**
 * Returns true if an object has any keys.
 * @param obj The object to check.
 * @returns True if the object has any keys, otherwise false.
 */
export const hasKeys = (obj: Record<string, any>) => {
  return Object.keys(obj).length > 0;
};

/**
 * Select an ID, ignoring state.
 * @param project The Project object.
 * @param id Optional. The ID to select.
 * @returns The ID.
 */
export const selectId = (project: Project, id: ID) => id;

/**
 * Select a list of IDs from the state.
 * @param project The Project object.
 * @param ids Optional. The IDs to select.
 * @returns The IDs.
 */
export const selectIds = (project: Project, ids: ID[]) => ids ?? [];

/**
 * Select a tick, ignoring state.
 * @param project The Project object.
 * @param tick Optional. The tick to select.
 * @returns The tick.
 */
export const selectTick = (project: Project, tick: number) => tick;

/**
 * Create a string of tags from an array of items.
 */
export const createTag = <T>(items: T | T[], createTag: (t: T) => string) => {
  return Array.isArray(items)
    ? items.map(createTag).join(",")
    : createTag(items);
};
