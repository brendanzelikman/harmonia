import { Selector, createSelectorCreator, defaultMemoize } from "reselect";
import { isEqual } from "lodash";
import { PayloadAction, Slice } from "@reduxjs/toolkit";
import { Project } from "types/Project";
import { getArrayByKey, getValueByKey, getValuesByKeys } from "utils/objects";

export type ActionType = { type: string; payload: any };
export type ActionGroup = { [key: string]: (action: ActionType) => string };

export const isSliceAction = (slice: string) => (action: PayloadAction) =>
  action.type.startsWith(slice);

export const getSliceActions = (slice: Slice) => {
  return Object.keys(slice.actions).map((key) => `${slice.name}/${key}`);
};

/** A deep equal selector for nested objects and arrays. */
export const createDeepEqualSelector = createSelectorCreator(
  defaultMemoize,
  isEqual
);

/** Convert a map selector into an ID-based value selector. */

// Overload #1: Default value is provided
export function createValueSelector<T>(
  mapSelector: (project: Project) => Record<string, T>,
  defaultValue: T
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
    const value = getValueByKey(mapSelector(project), id);
    if (value === undefined && defaultValue !== undefined) return defaultValue;
    return value;
  };
}

/** Convert a map selector into an ID-based array selector. */
export const createArraySelector =
  <T extends any[]>(mapSelector: (project: Project) => Record<string, T>) =>
  (project: Project, id?: string) =>
    getArrayByKey(mapSelector(project), id);

/** Convert a map selector into an ID-list based value list selector. */
export const createValueListSelector =
  <T extends any>(mapSelector: (project: Project) => Record<string, T>) =>
  (project: Project, ids: string[]) =>
    getValuesByKeys(mapSelector(project), ids);

/** Create a chained value selector by applying a transformer to a value selector */
export const createTransformedValueSelector =
  <S extends any, T extends any>(
    mapSelector: (project: Project) => Record<string, S>,
    transformer: (project: Project, value: S) => T
  ) =>
  (project: Project, id?: string) => {
    const value = getValueByKey(mapSelector(project), id);
    if (!value) return undefined;
    return transformer(project, value);
  };

/** Create a chained array selector by applying a transformer to a value selector */
export const createTransformedArraySelector =
  <S extends any[], T extends any[]>(
    mapSelector: (project: Project) => Record<string, S>,
    transformer: (project: Project, value: S) => T
  ) =>
  (project: Project, id?: string) => {
    const value = getArrayByKey(mapSelector(project), id);
    return transformer(project, value);
  };
