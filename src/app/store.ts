import { configureStore } from "@reduxjs/toolkit";
import { validateAudio } from "app/middleware";
import {
  getCurrentProjectId,
  getProject,
  getProjects,
  setCurrentProjectId,
  updateProject,
} from "./projects";
import { REDO_PROJECT, reducer, SET_PROJECT, UNDO_PROJECT } from "./reducer";
import { sanitizeProject, timestampProject } from "types/Project/ProjectTypes";
import { defaultProject, Project } from "types/Project/ProjectTypes";
import { convertProjectToNotes } from "types/Timeline/TimelineThunks";
import { selectMeta, selectProjectId } from "types/Meta/MetaSelectors";
import { mod } from "utils/math";
import { autoBindNoteToTrack } from "types/Track/TrackUtils";
import { getPatternBlockWithNewNotes } from "types/Pattern/PatternUtils";
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

/** Directly set the project */
export const setProject = async (payload: Project) => {
  const patterns = payload.present.patterns;
  for (const id of patterns.ids) {
    const pattern = patterns.entities[id];
    if (pattern.projectId) {
      const project = await getProject(pattern.projectId);
      if (!project) continue;
      const stream = convertProjectToNotes(project);
      const clip = selectPatternClips(payload).find(
        (clip) => clip.patternId === pattern.id
      );
      const boundStream = stream.map((b) =>
        getPatternBlockWithNewNotes(b, (n) =>
          n.map((n) => store.dispatch(autoBindNoteToTrack(clip?.trackId, n)))
        )
      );
      pattern.stream = boundStream;
    }
  }
  store.dispatch({ type: SET_PROJECT, payload });
};

/** Set to the previous project. */
export const skipProject = async (offset = 0) => {
  const projects = (await getProjects()).toSorted((a, b) => {
    const dateA = new Date(selectMeta(a).lastUpdated);
    const dateB = new Date(selectMeta(b).lastUpdated);
    return dateB.getTime() - dateA.getTime();
  });
  if (!projects.length) throw new Error("No projects found.");
  const id = getCurrentProjectId();
  if (!id) return;
  const match = projects.findIndex((p) => selectProjectId(p) === id);
  if (match === -1) return;
  const project = projects[mod(match + offset, projects.length)];
  setCurrentProjectId(selectProjectId(project));
  setProject(project);
};

export const selectPreviousProject = async () => skipProject(-1);
export const selectNextProject = async () => skipProject(1);

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
