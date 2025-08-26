import { Action, ThunkAction } from "@reduxjs/toolkit";
import { BaseProject } from "app/reducer";
import { defaultArrangement } from "types/Arrangement/ArrangementTypes";
import { defaultTimeline } from "types/Timeline/TimelineTypes";
import { defaultTransport } from "types/Transport/TransportTypes";
import { createId, isObject, Safe } from "types/utils";
import {
  defaultProjectMetadata,
  initializeProjectMetadata,
  NEW_PROJECT_NAME,
  ProjectMetadata,
} from "../Meta/MetaTypes";
import { store } from "app/store";
import dayjs from "dayjs";
import { sanitizeBaseProject } from "./ProjectMergers";
import { defaultGame } from "types/Game/GameTypes";

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
  Action
>;

// The default base project
export const defaultBaseProject: BaseProject = {
  meta: defaultProjectMetadata,
  ...defaultArrangement,
  timeline: defaultTimeline,
  transport: defaultTransport,
  game: defaultGame,
};

// The default project state.
export const defaultProject: Project = {
  past: [],
  present: defaultBaseProject,
  future: [],
};
defaultProject._latestUnfiltered = defaultProject.present;

/** Update the present of a project */
export const getProjectWithNewMeta = (
  project: Project,
  meta: Partial<ProjectMetadata>
) => {
  const newMeta = { ...project.present.meta, ...meta };
  const present = { ...project.present, meta: newMeta };
  const updatedProject = { ...project, present };
  updatedProject._latestUnfiltered = updatedProject.present;
  return updatedProject;
};

/** Update the id of a project. */
export const getProjectWithNewId = (project: Project) => {
  const id = createId("project");
  const newMeta = { ...project.present.meta, id };
  const present = { ...project.present, meta: newMeta };
  const updatedProject = { ...project, present };
  updatedProject._latestUnfiltered = updatedProject.present;
  return updatedProject;
};

/** Create a project with unique metadata. */
export const initializeProject = (template: Project = defaultProject) => {
  const meta = initializeProjectMetadata();
  if (template.present.meta.name !== NEW_PROJECT_NAME) {
    meta.name = `${template.present.meta.name} Copy`;
  }
  return getProjectWithNewMeta(template, meta);
};

// ------------------------------------------------------------
// Project Type Guards
// ------------------------------------------------------------

/** Checks if a given object is of type `Project`. */
export const isProject = (obj: unknown): obj is Project => isObject(obj);
export const canUndo = (project: Project) => project.past.length > 0;
export const canRedo = (project: Project) => project.future.length > 0;

/** Sanitize the project and clear the undo history. */
export const sanitizeProject = (project: SafeProject): Project => ({
  _latestUnfiltered: sanitizeBaseProject(project?._latestUnfiltered),
  group: project?.group,
  past: [],
  present: sanitizeBaseProject(project?.present),
  future: [],
});

/** Update the project with a newest timestamp */
export const timestampProject = (project: Project): Project => {
  return getProjectWithNewMeta(project, { lastUpdated: dayjs().format() });
};
