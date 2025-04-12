import { configureStore } from "@reduxjs/toolkit";
import { validateAudio } from "app/middleware";
import { updateProject } from "./projects";
import { REDO_PROJECT, reducer, SET_PROJECT, UNDO_PROJECT } from "./reducer";
import { sanitizeProject, timestampProject } from "types/Project/ProjectTypes";
import { defaultProject, Project } from "types/Project/ProjectTypes";

// ------------------------------------------------------------
// Redux Store Configuration
// ------------------------------------------------------------

/** Configure the store with audio-validating middleware. */
export const store = configureStore({
  reducer,
  middleware: (gDM) => gDM().concat(validateAudio),
});

/** Auto-save and timestamp the current project. */
store.subscribe(async () => {
  const state = store.getState();
  const project = sanitizeProject(state);
  const updatedProject = timestampProject(project);
  updateProject(updatedProject);
});

/** Directly set the project */
export const setProject = (payload: Project) => {
  store.dispatch({ type: SET_PROJECT, payload });
};

/** Undo the project */
export const undoProject = () => {
  if (store.getState().past.length > 0) {
    store.dispatch({ type: UNDO_PROJECT });
  }
};

/** Redo the project */
export const redoProject = () => {
  if (store.getState().future.length > 0) {
    store.dispatch({ type: REDO_PROJECT });
  }
};

/** Reset the project's state to the default. */
export const clearProject = () => {
  const project = store.getState();
  const past = [...project.past, project.present];
  const present = { ...defaultProject.present, meta: project.present.meta };
  const emptyProject = { ...project, past, present, future: [], group: null };
  emptyProject._latestUnfiltered = emptyProject.present;
  setProject(emptyProject);
};
