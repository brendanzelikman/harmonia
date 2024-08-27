import { AnyAction, ThunkAction } from "@reduxjs/toolkit";
import { isPlainObject, isString } from "lodash";
import { BaseProject, store } from "providers/store";
import { defaultArrangement } from "types/Arrangement/ArrangementTypes";
import { defaultEditor, isEditor } from "types/Editor/EditorTypes";
import { defaultTimeline, isTimeline } from "types/Timeline/TimelineTypes";
import { defaultTransport, isTransport } from "types/Transport/TransportTypes";
import { isOptionalType } from "types/util";
import { Safe } from "types/units";
import {
  defaultProjectMetadata,
  initializeProjectMetadata,
  ProjectMetadata,
} from "../Meta/MetaTypes";
import { defaultMotifState } from "types/Motif/MotifTypes";

// ------------------------------------------------------------
// Project Definitions
// ------------------------------------------------------------

/** The Project type is the undoable history derived from the state. */
export type Project = ReturnType<typeof store.getState>;
export type Dispatch = typeof store.dispatch;

/** The UnsafeProject type safely accesses the fields of a project. */
export type SafeProject = Safe<Project>;

/** The Thunk type creates callbacks for the project. */
export type Thunk<ReturnType = void> = ThunkAction<
  ReturnType,
  Project,
  unknown,
  AnyAction
>;

// The default base project
export const defaultBaseProject: BaseProject = {
  meta: defaultProjectMetadata,
  ...defaultArrangement,
  motifs: defaultMotifState,
  timeline: defaultTimeline,
  editor: defaultEditor,
  transport: defaultTransport,
};

// The default project state.
export const defaultProject: Project = {
  past: [],
  present: defaultBaseProject,
  future: [],
};
defaultProject._latestUnfiltered = defaultProject.present;

/** Create a project with unique metadata. */
export const initializeProject = (template: Project = defaultProject) => {
  const meta = initializeProjectMetadata();
  if (template.present.meta.name !== "New Project") {
    meta.name = `${template.present.meta.name} Copy`;
  }
  const project: Project = {
    ...template,
    present: { ...template.present, meta },
  };
  return project;
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
    isOptionalType(candidate.name, isString) &&
    isOptionalType(candidate.dateCreated, isString) &&
    isOptionalType(candidate.lastUpdated, isString)
  );
};

/** Checks if a given object is of type `Project`. */
export const isProject = (obj: unknown): obj is Project => {
  const candidate = obj as Project;
  return (
    isPlainObject(candidate?.present) &&
    isProjectMetadata(candidate.present.meta) &&
    isTimeline(candidate.present.timeline) &&
    isEditor(candidate.present.editor) &&
    isTransport(candidate.present.transport)
  );
};
