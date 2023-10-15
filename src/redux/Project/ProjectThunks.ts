import { AppThunk, RootState, defaultRootState } from "redux/store";
import { exportClipsToMidi, selectClipIds } from "redux/Clip";
import { union, without } from "lodash";
import { isRootState } from "redux/util";
import { isLocalStorageAvailable } from "utils";
import { selectProject } from "./ProjectSelectors";
import { dispatchCustomEvent } from "utils/events";
import {
  CURRENT_PROJECT,
  PROJECT_LIST,
  initializeProject,
} from "types/Project";

export const CREATE_PROJECT = "createProject";
export const DELETE_PROJECT = "deleteProject";

/** Try to create a new project, using the given template if specified */
export const createNewProject =
  (template?: RootState): AppThunk =>
  () => {
    // Initialize a new project and state
    const project = initializeProject();
    const id = project.id;
    const name = template ? `${template.project.name} Copy` : project.name;
    const newState = {
      ...defaultRootState,
      ...template,
      project: { ...project, id, name },
    };

    // Try to save the state to local storage.
    try {
      if (!isLocalStorageAvailable()) return;

      // Add the state to local storage.
      const serializedState = JSON.stringify(newState);
      localStorage.setItem(id, serializedState);

      // Update the list of projects in local storage.
      const projects = localStorage.getItem(PROJECT_LIST);
      const projectList = projects ? JSON.parse(projects) : [];
      const newProjectList = union(projectList || [], [id]);
      localStorage.setItem(PROJECT_LIST, JSON.stringify(newProjectList));

      // Update the current project in local storage if specified.
      localStorage.setItem(CURRENT_PROJECT, id);

      // Dispatch the custom event
      dispatchCustomEvent(CREATE_PROJECT, id);
    } catch (e) {
      console.log(e);
    }
  };

/**
 * Save the project to local storage.
 * @param state The state to save. If not specified, the current state is used.
 */
export const saveProjectToLocalStorage =
  (state?: RootState): AppThunk =>
  (dispatch, getState) => {
    // If local storage is not available, return.
    if (!isLocalStorageAvailable()) return;

    // Make sure the project has an ID.
    const rootState = state || getState();
    const project = selectProject(rootState);
    if (!project.id) return;

    // Sanitize the state, clearing out undo history and idling the user.
    const { id } = project;
    const sanitizedState: RootState = {
      ...rootState,
      project: { ...project, lastUpdated: new Date().toISOString() },
      scales: { past: [], present: rootState.scales.present, future: [] },
      patterns: { past: [], present: rootState.patterns.present, future: [] },
      session: { past: [], present: rootState.session.present, future: [] },
      timeline: { ...rootState.timeline, state: "idle" },
      transport: {
        ...rootState.transport,
        state: "stopped",
        loaded: false,
        recording: false,
        downloading: false,
      },
    };

    // If the state is invalid, clear it from local storage and return.
    if (!isRootState(sanitizedState)) {
      localStorage.removeItem("state");
      return;
    }

    // Otherwise, save the state to local storage.
    let serializedState = JSON.stringify(sanitizedState);
    localStorage.setItem(id, serializedState);

    // Update the list of projects in local storage.
    const projects = localStorage.getItem(PROJECT_LIST);
    const projectList = projects ? JSON.parse(projects) : [];
    const newProjectList = union(projectList, [id]);
    localStorage.setItem(PROJECT_LIST, JSON.stringify(newProjectList));

    // Update the current project in local storage.
    localStorage.setItem(CURRENT_PROJECT, id);
  };

/** Save the Redux state to a Harmonia file. */
export const saveProjectAsHAM =
  (state?: RootState): AppThunk =>
  (dispatch, getState) => {
    // Serialize the state
    const rootState = state || getState();
    const serializedState = JSON.stringify(rootState);

    // Create a blob and download it
    const blob = new Blob([serializedState], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${rootState?.project?.name ?? "file"}.ham`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

/**
 * Save the current state to a MIDI file based on all clips.
 */
export const saveProjectAsMIDI = (): AppThunk => (dispatch, getState) => {
  try {
    const state = getState();
    const clipIds = selectClipIds(state);
    return dispatch(exportClipsToMidi(clipIds));
  } catch (e) {
    console.log(e);
  }
};

/** Start reading Harmonia files from the file system. */
export const readProjectFiles = (): AppThunk => (dispatch) => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".ham";
  input.addEventListener("change", (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      dispatch(loadProjectFromFile(file));
    }
  });
  input.click();
};

/** Try to load the given project from local storage */
export const loadProjectById =
  (id: string): AppThunk =>
  (dispatch) => {
    try {
      // Get the state from local storage.
      const serializedState = localStorage.getItem(id);
      if (!serializedState) return;

      // If the state is invalid, return.
      if (!isRootState(JSON.parse(serializedState))) {
        alert("Invalid file!");
        return;
      }

      // Otherwise, load the state
      dispatch(loadProjectFromString(serializedState));
    } catch (e) {
      console.log(e);
      return;
    }
  };

/** Try to load a project from a string. */
export const loadProjectFromString =
  (state: string): AppThunk =>
  (dispatch) => {
    try {
      const parsedState = JSON.parse(state);

      // If the state is invalid, return.
      if (!isRootState(parsedState)) {
        alert("Invalid file!");
        return undefined;
      }

      // Otherwise, save the state to local storage and reload the page.
      dispatch(saveProjectToLocalStorage(parsedState));
      window.location.href = window.location.origin + "/harmonia/playground";
    } catch (e) {
      console.log(e);
    }
  };

/** Try to load a project from a Harmonia file. */
export const loadProjectFromFile =
  (file: File): AppThunk =>
  (dispatch) => {
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const serializedState = e.target.result as string;
          const state = JSON.parse(serializedState);
          if (!state || !isRootState(state)) {
            alert("Invalid file!");
            return undefined;
          }
          dispatch(saveProjectToLocalStorage(state));
          window.location.reload();
        }
      };
      reader.readAsText(file);
    } catch (e) {
      console.log(e);
      return undefined;
    }
  };

/** Delete the current project from local storage. */
export const deleteCurrentProject = (): AppThunk => (dispatch, getState) => {
  const state = getState();

  // Get the project ID
  const { id } = state.project;
  if (!id) return;

  // Remove the project from local storage
  localStorage.removeItem(id);

  // Remove the project from the list of projects
  const projects = localStorage.getItem(PROJECT_LIST);
  const projectList = projects ? JSON.parse(projects) : [];
  const newProjectList = without(projectList, id);
  localStorage.setItem(PROJECT_LIST, JSON.stringify(newProjectList));

  // Remove the project if it is the current project
  const currentProject = localStorage.getItem(CURRENT_PROJECT);
  if (currentProject === id) {
    localStorage.removeItem(CURRENT_PROJECT);
  }

  // Reload the page
  window.location.reload();
};

/** Delete the project by ID from local storage. */
export const deleteProjectById =
  (id: string): AppThunk =>
  () => {
    // Remove the project from local storage
    localStorage.removeItem(id);

    // Remove the project from the list of projects
    const projects = localStorage.getItem(PROJECT_LIST);
    const projectList = projects ? JSON.parse(projects) : [];
    const newProjectList = without(projectList, id);

    if (!newProjectList.length) {
      localStorage.removeItem(PROJECT_LIST);
    } else {
      localStorage.setItem(PROJECT_LIST, JSON.stringify(newProjectList));
    }

    // Remove the project if it is the current project
    const currentProject = localStorage.getItem(CURRENT_PROJECT);
    if (currentProject === id) {
      localStorage.setItem(CURRENT_PROJECT, newProjectList[0]);
    }

    // Dispatch the custom event
    dispatchCustomEvent(DELETE_PROJECT, id);
  };
