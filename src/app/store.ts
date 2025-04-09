import { configureStore } from "@reduxjs/toolkit";
import { validateAudio } from "app/middleware";
import { updateProject } from "./projects";
import { reducer } from "./reducer";
import {
  sanitizeProject,
  timestampProject,
} from "types/Project/ProjectFunctions";

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
