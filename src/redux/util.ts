import { isNormalizedState } from "types/util";
import { RootState } from "./store";
import { isEditor } from "types/Editor";
import { isProject } from "types/Project";
import { isTimeline } from "types/Timeline";
import { isTransport } from "types/Transport";
import { createSelectorCreator, defaultMemoize } from "reselect";
import { isEqual } from "lodash";
import { PayloadAction, Slice } from "@reduxjs/toolkit";

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

export const isRootState = (obj: any): obj is RootState => {
  const { session, scales, patterns, project, editor, timeline, transport } =
    obj;

  // Validate session
  if (!session?.present) return false;
  const { clips, transpositions, patternTracks, scaleTracks } = session.present;
  if (!isNormalizedState(clips)) return false;
  if (!isNormalizedState(transpositions)) return false;
  if (!isNormalizedState(patternTracks)) return false;
  if (!isNormalizedState(scaleTracks)) return false;

  // Validate scales
  if (!scales?.present) return false;
  if (!isNormalizedState(scales.present)) return false;

  // Validate patterns
  if (!patterns?.present) return false;
  if (!isNormalizedState(patterns.present)) return false;

  // Validate editor
  if (!editor) return false;
  if (!isEditor(editor)) return false;

  // Validate project
  if (!project) return false;
  if (!isProject(project)) return false;

  // Validate timeline
  if (!timeline) return false;
  if (!isTimeline(timeline)) return false;

  // Validate transport
  if (!transport) return false;
  if (!isTransport(transport)) return false;

  // Return true if all validations pass
  return true;
};
