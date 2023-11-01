import { AnyAction, ThunkAction, nanoid } from "@reduxjs/toolkit";
import { isPlainObject, isString } from "lodash";
import { store } from "redux/store";
import {
  defaultArrangementHistory,
  isNormalLiveArrangement,
} from "types/Arrangement";
import { defaultEditor, isEditor } from "types/Editor";
import { defaultPatternHistory, isPattern } from "types/Pattern";
import { defaultScaleHistory, isScaleObject } from "types/Scale";
import { defaultTimeline, isTimeline } from "types/Timeline";
import { defaultTransport, isTransport } from "types/Transport";
import { isUndoableHistory } from "utils/undoableHistory";

// ------------------------------------------------------------
// Project Definitions
// ------------------------------------------------------------

/** The `ProjectMetadata` contains the top-level info of the project. */
export interface ProjectMetadata {
  id: string;
  name: string;
  dateCreated: string;
  lastUpdated: string;
}

/** The Project type is derived from the Redux state. */
export type Project = ReturnType<typeof store.getState>;
export type Dispatch = typeof store.dispatch;
export type Thunk<ReturnType = void> = ThunkAction<
  ReturnType,
  Project,
  unknown,
  AnyAction
>;

// ------------------------------------------------------------
// Project Initialization
// ------------------------------------------------------------

/** Create project metadata with a unique ID and the current date. */
export const initializeProjectMetadata = (): ProjectMetadata => ({
  id: `harmonia-project-${nanoid()}`,
  name: "New Project",
  dateCreated: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
});

/** Create a project with unique metadata. */
export const initializeProject = (
  template: Project = defaultProject
): Project => {
  const meta = initializeProjectMetadata();
  if (template.meta.name !== "New Project") {
    meta.name = `${template.meta.name} Copy`;
  }
  return { ...template, meta };
};

export const defaultProject: Project = {
  meta: initializeProjectMetadata(),
  transport: defaultTransport,
  timeline: defaultTimeline,
  editor: defaultEditor,
  scales: defaultScaleHistory,
  patterns: defaultPatternHistory,
  arrangement: defaultArrangementHistory,
};

// ------------------------------------------------------------
// Project Type Guards
// ------------------------------------------------------------

/** Checks if a given object is of type `ProjectMetadata`. */
export const isProjectMetadata = (obj: unknown): obj is ProjectMetadata => {
  const candidate = obj as ProjectMetadata;
  return (
    isPlainObject(candidate) &&
    isString(candidate.id) &&
    isString(candidate.name) &&
    isString(candidate.dateCreated) &&
    isString(candidate.lastUpdated)
  );
};

/** Checks if a given object is of type `Project`. */
export const isProject = (obj: unknown): obj is Project => {
  const candidate = obj as Project;
  return (
    isPlainObject(candidate) &&
    isProjectMetadata(candidate.meta) &&
    isTransport(candidate.transport) &&
    isTimeline(candidate.timeline) &&
    isEditor(candidate.editor) &&
    isUndoableHistory(candidate.scales, isScaleObject) &&
    isUndoableHistory(candidate.patterns, isPattern) &&
    isUndoableHistory(candidate.arrangement) &&
    isNormalLiveArrangement(candidate.arrangement.present)
  );
};
