import { createSelectorCreator, defaultMemoize } from "reselect";
import { isEqual, isObject } from "lodash";
import {
  createSlice,
  EntityAdapter,
  EntityId,
  EntityState,
  nanoid,
  PayloadAction,
  SliceCaseReducers,
  ValidateSliceCaseReducers,
} from "@reduxjs/toolkit";
import { getArrayByKey, getValuesByKeys } from "utils/objects";
import { Project } from "types/Project/ProjectTypes";
import { Update } from "types/units";

// Allow for empty payloads and optional undo types
export type Payload<
  T = null,
  isEmpty = T extends null ? true : false
> = isEmpty extends true
  ? { data?: T; undoType?: string } | undefined
  : { data: T; undoType?: string };

export type Action<T, isEmpty = T extends null ? true : false> = PayloadAction<
  T | Payload<T, isEmpty>
>;

/** Get the data from a payload */
export const unpackData = <T>(payload?: Payload<T, true>) =>
  payload?.data ?? (payload as T);

/** Get the data from an action */
export const unpackAction = <T>(action: Action<T>) => {
  return (
    isObject(action.payload) && "data" in action.payload
      ? action.payload.data
      : action.payload
  ) as T;
};

export const createUndoType = (prefix?: string, ...payload: any) =>
  `${prefix}(${JSON.stringify(payload)})`;

export const unpackUndoType = <T>(
  _payload?: Payload<T, true>,
  prefix?: string
) => {
  const payload = _payload ?? {};
  const undoType = "undoType" in payload ? payload.undoType : undefined;
  const data = "data" in payload ? payload.data : undefined;
  return undoType ?? createUndoType(prefix, data, nanoid());
};

/** A deep equal selector for nested objects and arrays. */
export const createDeepSelector = createSelectorCreator(
  defaultMemoize,
  isEqual
);

// Overload #1: Default value is provided
export function createValueSelector<T>(
  mapSelector: (project: Project) => Record<string, T | undefined>,
  defaultValue: T
): (project: Project, id?: T extends string ? T : string) => T;

// Overload #1: Default value is provided as a callback
export function createValueSelector<T>(
  mapSelector: (project: Project) => Record<string, T>,
  defaultValue: (id: string) => T
): (project: Project, id?: string) => T;

// Overload #2: Default value is not provided
export function createValueSelector<T>(
  mapSelector: (project: Project) => Record<string, T>
): (project: Project, id?: string) => T | undefined;

// Implementation: Returns value or undefined if no default value specified
export function createValueSelector<T>(
  mapSelector: (project: Project) => Record<string, T>,
  defaultValue?: T
) {
  return (project: Project, id?: string) => {
    const value = id ? mapSelector(project)[id] : undefined;
    if (value === undefined && defaultValue !== undefined) {
      return typeof defaultValue === "function"
        ? defaultValue(id)
        : defaultValue;
    }
    return value;
  };
}

/** Convert a map selector into an ID-based array selector. */
export const createArraySelector =
  <T extends any>(mapSelector: (project: Project) => Record<string, T & {}>) =>
  (project: Project, id?: string) =>
    getArrayByKey(mapSelector(project), id);

/** Convert a map selector into an ID-list based value list selector. */
export const createValueListSelector =
  <T extends any>(mapSelector: (project: Project) => Record<string, T>) =>
  (project: Project, ids: string[]) =>
    getValuesByKeys(mapSelector(project), ids);

export const createNormalSlice = <
  T,
  ID extends EntityId = T extends { id: EntityId } ? T["id"] : EntityId,
  R extends SliceCaseReducers<EntityState<T, ID>> = SliceCaseReducers<
    EntityState<T, ID>
  >
>({
  name,
  adapter,
  initialState,
  reducers = {} as ValidateSliceCaseReducers<EntityState<T, ID>, R>,
}: {
  name: string;
  adapter: EntityAdapter<T, ID>;
  initialState?: EntityState<T, ID>;
  reducers?: ValidateSliceCaseReducers<EntityState<T, ID>, R>;
}) =>
  createSlice({
    name,
    initialState: initialState ?? adapter.getInitialState(),
    reducers: {
      ...reducers,
      addOne: (state: EntityState<T, ID>, action: Action<T>) => {
        const data = unpackAction(action);
        adapter.addOne(state, data);
      },
      addMany: (state: EntityState<T, ID>, action: Action<T[]>) => {
        const data = unpackAction(action);
        adapter.addMany(state, data);
      },
      setOne: (state: EntityState<T, ID>, action: Action<T>) => {
        const data = unpackAction(action);
        adapter.setOne(state, data);
      },
      setMany: (state: EntityState<T, ID>, action: Action<T[]>) => {
        const data = unpackAction(action);
        adapter.setMany(state, data);
      },
      setAll: (state: EntityState<T, ID>, action: Action<T[]>) => {
        const data = unpackAction(action);
        adapter.setAll(state, data);
      },
      setIds: (state: EntityState<T, ID>, action: Action<ID[]>) => {
        const data = unpackAction(action);
        state.ids = data;
      },
      removeOne: (state: EntityState<T, ID>, action: Action<ID>) => {
        const data = unpackAction(action);
        adapter.removeOne(state, data);
      },
      removeMany: (state: EntityState<T, ID>, action: Action<ID[]>) => {
        const data = unpackAction(action);
        adapter.removeMany(state, data);
      },
      removeAll: (state: EntityState<T, ID>) => {
        adapter.removeAll(state);
      },
      updateOne: (state: EntityState<T, ID>, action: Action<Update<T>>) => {
        const data = unpackAction(action);
        const { id, ...changes } = data;
        adapter.updateOne(state, {
          id: id as ID,
          changes: changes as Partial<T>,
        });
      },
      updateMany: (state: EntityState<T, ID>, action: Action<Update<T>[]>) => {
        const data = unpackAction(action);
        adapter.updateMany(
          state,
          data.map(({ id, ...changes }) => ({
            id: id as ID,
            changes: changes as Partial<T>,
          }))
        );
      },
      upsertOne: (state: EntityState<T, ID>, action: Action<T>) => {
        const data = unpackAction(action);
        adapter.upsertOne(state, data);
      },
      upsertMany: (state: EntityState<T, ID>, action: Action<T[]>) => {
        const data = unpackAction(action);
        adapter.upsertMany(state, data);
      },
    },
  });
