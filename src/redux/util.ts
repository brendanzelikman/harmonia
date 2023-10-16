import { isNormalizedState } from "types/util";
import { Project } from "./store";
import { isEditor } from "types/Editor";
import { isProjectMetaData } from "types/Project";
import { isTimeline } from "types/Timeline";
import { isTransport } from "types/Transport";
import { createSelectorCreator, defaultMemoize } from "reselect";
import { isEqual } from "lodash";
import { PayloadAction, Slice } from "@reduxjs/toolkit";
import { isTrackHierarchy } from "types/TrackHierarchy";

export const isSliceAction = (slice: string) => (action: PayloadAction) =>
  action.type.startsWith(slice);

export const getSliceActions = (slice: Slice) => {
  return Object.keys(slice.actions).map((key) => `${slice.name}/${key}`);
};

export const createDeepEqualSelector = createSelectorCreator(
  defaultMemoize,
  isEqual
);

export const createPromptedAction =
  (promptStr: string, dispatchFn: (input: number) => unknown) => () => {
    const input = prompt(promptStr);
    const sanitizedInput = parseInt(input ?? "");
    if (!isNaN(sanitizedInput)) dispatchFn(sanitizedInput);
  };
