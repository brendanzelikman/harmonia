import { EntityId, EntityState, nanoid } from "@reduxjs/toolkit";
import { difference, merge, omit, union } from "lodash";
import { Id } from "./units";

// ------------------------------------------------------------
// Basic Helpers
// ------------------------------------------------------------

// Create an id with the given prefix (e.g. "id_001")
export const createId = <T extends EntityId = string>(
  prefix: T = "id" as T
): Id<T> => `${prefix}_${nanoid()}`;

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
export const isEntityState = <T extends { id: EntityId }>(
  obj: Safe<EntityState<T, T["id"]>>
): obj is EntityState<T, T["id"]> => {
  return !!obj?.entities && !!obj?.ids;
};

/** Returns true if an entity is in a state based on a guard. */
export const isEntityInState = <T extends { id: EntityId }>(
  state: Safe<EntityState<T, T["id"]>>,
  guard: (entity: T) => boolean
) => {
  if (!isEntityState(state)) return false;
  return state.ids.some(
    (id) => state.entities[id] && guard(state.entities[id])
  );
};

/* Returns true if an entity state contains an id properly */
export const isIdInState = <T extends { id: EntityId }>(
  state: Safe<EntityState<T, T["id"]>>,
  id: T["id"] = ""
) => {
  if (!isEntityState(state)) return false;
  return id in state.entities && state.ids.includes(id);
};

/** Remove entities from a state that don't match a predicate. */
export const filterEntityState = <T extends { id: EntityId }>(
  state: EntityState<T, T["id"]>,
  guard?: (entity: T) => boolean
): EntityState<T, T["id"]> => {
  const ids = state.ids.filter(
    (id) => !state.entities[id] || (guard && !guard(state.entities[id]))
  );
  return {
    entities: omit(state.entities, ids) as EntityState<T, T["id"]>["entities"],
    ids: difference(state.ids, ids),
  };
};

/** Sanitize a normalized state with entities and IDs. */
export const mergeStates = <T extends { id: EntityId }>(
  state: Safe<EntityState<T, T["id"]>>,
  defaultState: Safe<EntityState<T, T["id"]>>,
  guard?: (item: T) => boolean
): EntityState<T, T["id"]> => {
  const sanitizedState = {
    ids: union(defaultState?.ids ?? [], state?.ids ?? []),
    entities: merge({}, defaultState?.entities ?? {}, state?.entities ?? {}),
  } as EntityState<T, T["id"]>;

  // Filter the entities based on the guard
  return filterEntityState(sanitizedState, guard);
};
