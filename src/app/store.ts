import { configureStore } from "@reduxjs/toolkit";
import { validateAudio } from "app/middleware";
import { getProject, updateProject } from "./projects";
import { REDO_PROJECT, reducer, SET_PROJECT, UNDO_PROJECT } from "./reducer";
import { sanitizeProject, timestampProject } from "types/Project/ProjectTypes";
import { defaultProject, Project } from "types/Project/ProjectTypes";
import { convertProjectToNotes } from "types/Timeline/TimelineThunks";
import { autoBindStreamToTrack } from "types/Track/TrackUtils";
import { selectPatternClips } from "types/Clip/ClipSelectors";

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

/** Directly set the project with a payload */
export const setProject = async (payload: Project) => {
  const patterns = payload.present.patterns;

  // Populate the encapsulated patterns of the project
  for (const id of patterns.ids) {
    const pattern = patterns.entities[id];
    if (!pattern?.projectId) continue;
    const project = await getProject(pattern.projectId);
    if (!project) continue;
    const stream = convertProjectToNotes(project);
    const patternClips = selectPatternClips(payload);
    const clip = patternClips.find((clip) => clip.patternId === pattern.id);
    const trackId = clip?.trackId;
    const boundStream = store.dispatch(autoBindStreamToTrack(trackId, stream));
    pattern.stream = boundStream;
  }

  // Dispatch the action
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
