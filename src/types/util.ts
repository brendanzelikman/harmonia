import { EntityId, EntityState, nanoid } from "@reduxjs/toolkit";
import { difference, isArray, isPlainObject, merge, omit, union } from "lodash";
import { Id } from "./units";

// ------------------------------------------------------------
// Basic Helpers
// ------------------------------------------------------------

// Create an id with the given prefix (e.g. "id_001")
export const createId = <T extends EntityId = string>(
  prefix: T = "id" as T
): Id<T> => `${prefix}_${nanoid()}`;

// Require at least one key from a type (src: u/KPD on SO)
type Choose<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
type Free<T, K extends keyof T> = { [P in K]-?: Assert<T, K, P> };
type Assert<T, K extends keyof T, P> = Picked<T, K> & Maybe<T, Exclude<K, P>>;
type Picked<T, K extends keyof T> = Required<Pick<T, K>>;
type Maybe<T, K extends keyof T> = Partial<Pick<T, K>>;
export type NonEmpty<T, K extends keyof T> = Choose<T, K> & Free<T, K>[K];

// Recursively allow properties to be optional
export type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

// Safely access an unsanitized object
export type Safe<T> = RecursivePartial<T> | undefined;

// ------------------------------------------------------------
// Entity State Helpers
// ------------------------------------------------------------

/** Returns true if an object is an entity state. */
export const isEntityState = <T>(
  obj: Safe<EntityState<T>>
): obj is EntityState<T> => {
  return !!obj?.entities && !!obj?.ids;
};

/** Returns true if an entity is in a state based on a guard. */
export const isEntityInState = <T>(
  state: Safe<EntityState<T>>,
  guard: (entity: T) => boolean
) => {
  if (!isEntityState(state)) return false;
  return state.ids.some(
    (id) => state.entities[id] && guard(state.entities[id])
  );
};

/* Returns true if an entity state contains an id properly */
export const isIdInState = <T>(
  state: Safe<EntityState<T>>,
  id: EntityId = ""
) => {
  if (!isEntityState(state)) return false;
  return id in state.entities && state.ids.includes(id);
};

/* Add an entity to a state, returning the new state */
export const addEntityToState = <T extends { id: EntityId }>(
  state: EntityState<T>,
  entity: T
): EntityState<T> => {
  return {
    entities: { ...state.entities, [entity.id]: entity },
    ids: union(state.ids, [entity.id]),
  };
};

/** Add a list of entities to a state. */
export const addEntitiesToState = <T extends { id: EntityId }>(
  state: EntityState<T>,
  entities: T[]
): EntityState<T> => {
  return {
    entities: merge(
      {},
      state.entities,
      ...entities.map((e) => ({ [e.id]: e }))
    ),
    ids: union(
      state.ids,
      entities.map((e) => e.id)
    ),
  };
};

/** Remove an entity from a state, returning the new state */
export const removeEntityFromState = <T extends { id: EntityId }>(
  state: EntityState<T>,
  id: EntityId
): EntityState<T> => {
  if (!isIdInState(state, id)) return state;
  const { [id]: _, ...entities } = state.entities;
  return {
    entities,
    ids: difference(state.ids, [id]),
  };
};

/** Remove a list of entities from a state. */
export const removeEntitiesFromState = <T extends { id: EntityId }>(
  state: EntityState<T>,
  ids: EntityId[]
): EntityState<T> => {
  return {
    entities: omit(state.entities, ids),
    ids: difference(state.ids, ids),
  };
};

/** Remove entities from a state that don't match a predicate. */
export const filterEntityState = <T extends { id: EntityId }>(
  state: EntityState<T>,
  guard?: (entity: T) => boolean
): EntityState<T> => {
  const ids = state.ids.filter(
    (id) => !state.entities[id] || (guard && !guard(state.entities[id]))
  );
  return removeEntitiesFromState(state, ids);
};

/** Sanitize a normalized state with entities and IDs. */
export const mergeStates = <T extends { id: EntityId }>(
  state: Safe<EntityState<T>>,
  defaultState: Safe<EntityState<T>>,
  guard?: (item: T) => boolean
): EntityState<T> => {
  const sanitizedState = {
    ids: union(defaultState?.ids ?? [], state?.ids ?? []),
    entities: merge({}, defaultState?.entities ?? {}, state?.entities ?? {}),
  } as EntityState<T>;

  // Filter the entities based on the guard
  return filterEntityState(sanitizedState, guard);
};

// ------------------------------------------------------------
// Type Guards
// ------------------------------------------------------------

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
