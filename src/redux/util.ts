import { createSelectorCreator, defaultMemoize } from "reselect";
import { isEqual } from "lodash";
import { PayloadAction, Slice } from "@reduxjs/toolkit";

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
