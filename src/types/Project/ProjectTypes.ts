import { AnyAction, ThunkAction } from "@reduxjs/toolkit";
import { isPlainObject, isString } from "lodash";
import { BaseProject, store } from "providers/store";
import { defaultArrangement } from "types/Arrangement/ArrangementTypes";
import { defaultTimeline } from "types/Timeline/TimelineTypes";
import { defaultTransport } from "types/Transport/TransportTypes";
import { Safe } from "types/util";
import {
  defaultProjectMetadata,
  initializeProjectMetadata,
  NEW_PROJECT_NAME,
  ProjectMetadata,
} from "../Meta/MetaTypes";
import { useToggledState } from "hooks/useToggledState";

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
  timeline: defaultTimeline,
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
  if (template.present.meta.name !== NEW_PROJECT_NAME) {
    meta.name = `${template.present.meta.name} Copy`;
  }
  const project: Project = {
    ...template,
    present: { ...template.present, meta },
  };
  return project;
};

// The project can be directly edited with a custom window
export const useTerminal = () => useToggledState("terminal");

// ------------------------------------------------------------
// Project Type Guards
// ------------------------------------------------------------

/** Checks if a given object is of type `ProjectMetadata`. */
export const isProjectMetadata = (obj: unknown): obj is ProjectMetadata => {
  const candidate = obj as ProjectMetadata;
  return isPlainObject(candidate) && isString(candidate.id);
};

/** Checks if a given object is of type `Project`. */
export const isProject = (obj: unknown): obj is Project => {
  const candidate = obj as Project;
  return (
    isPlainObject(candidate?.present) &&
    isProjectMetadata(candidate.present.meta)
  );
};
