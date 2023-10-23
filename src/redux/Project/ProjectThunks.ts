import { nanoid } from "@reduxjs/toolkit";
import {
  uploadProjectToDB,
  setCurrentProjectId,
  updateProjectInDB,
  getProjectFromDB,
  deleteProjectFromDB,
} from "indexedDB";
import { selectMetadata, selectProjectName } from "redux/Metadata";
import { selectClipIds } from "redux/selectors";
import { Thunk } from "types/Project";
import { exportClipsToMidi } from "redux/thunks";
import {
  Project,
  defaultProject,
  isProject,
  initializeProject,
  sanitizeProject,
} from "types/Project";
import { PLAYGROUND_LINK, dispatchCustomEvent } from "utils";
import { redirect } from "react-router-dom";

export const CREATE_PROJECT = "createProject";
export const DELETE_PROJECT = "deleteProject";

/**
 * Try to create a new project, using the given template if specified.
 * @param template The template project to use.
 */
export const createProject = async (template?: Project) => {
  const project = initializeProject(template);
  const id = project.meta.id;
  try {
    await uploadProjectToDB(project);
    await setCurrentProjectId(id);
  } catch (e) {
    console.log(e);
  } finally {
    dispatchCustomEvent(CREATE_PROJECT, id);
  }
};

/**
 * Try to delete the project from the database.
 * @param id The ID of the project to delete.
 */
export const deleteProject = (id: string) => () => {
  try {
    deleteProjectFromDB(id);
  } catch (e) {
    console.error(e);
  } finally {
    dispatchCustomEvent(DELETE_PROJECT, id);
  }
};

/**
 * Try to save the project to the database, sanitizing it first.
 * @param project The state to save. If not specified, the current state is used.
 */
export const saveProject =
  (project?: Project): Thunk =>
  (dispatch, getProject) => {
    // Sanitize the project
    const sanitizedProject = sanitizeProject(project || getProject());

    // Update the project's timestamp
    const updatedProject = {
      ...sanitizedProject,
      meta: { ...sanitizedProject.meta, lastUpdated: new Date().toISOString() },
    };

    // Update the project in the database.
    updateProjectInDB(updatedProject);
  };

/**
 * Export the project to a Harmonia file, using the given state if specified.
 */
export const exportProjectToHAM =
  (project?: Project): Thunk =>
  (dispatch, getProject) => {
    // Serialize the project
    const sanitizedProject = sanitizeProject(project || getProject());
    const projectJSON = JSON.stringify(sanitizedProject);

    // Create a blob and download it
    const blob = new Blob([projectJSON], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const name = selectProjectName(sanitizedProject);
    link.download = `${name ?? "project"}.ham`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

/**
 * Export the project to a MIDI file based on its clips, using the given project if specified.
 * @param project The project to export. If not specified, the current project is used.
 */
export const exportProjectToMIDI =
  (project?: Project): Thunk =>
  (dispatch, getProject) => {
    const savedProject = project || getProject();
    const clipIds = selectClipIds(savedProject);
    dispatch(exportClipsToMidi(clipIds));
  };

/**
 * Open the user's file system and read local projects.
 */
export const openLocalProjects = (): Thunk => (dispatch) => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".ham";
  input.addEventListener("change", (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      dispatch(loadProjectByFile(file));
    }
  });
  input.click();
};

/**
 * Try to load the project by ID from the database.
 * @param id The ID of the project to load.
 */
export const loadProject =
  (id: string): Thunk =>
  async (dispatch) => {
    // Query the database
    const project = await getProjectFromDB(id);

    // Update the current project ID
    await setCurrentProjectId(id);

    // Update the Redux state
    dispatch({ type: "setState", payload: project });

    // Redirect to the playground
    window.location.href = PLAYGROUND_LINK;
  };

/**
 * Try to load a project from a Harmonia file.
 */
export const loadProjectByFile =
  (file: File): Thunk =>
  (dispatch) => {
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (!e.target?.result) return;

        // Parse the project from the file
        const projectString = e.target.result as string;
        const project = JSON.parse(projectString);

        if (!isProject(project)) {
          throw new Error("Invalid project file.");
        }

        // Upload or save the project depending on whether it already exists
        const existingProject = await getProjectFromDB(project.meta.id);
        if (!existingProject) {
          uploadProjectToDB(project);
        } else {
          updateProjectInDB(project);
        }
      };
      reader.readAsText(file);
    } catch (e) {
      console.log(e);
    } finally {
      window.location.reload();
    }
  };

/**
 * Try to load the project from the given path.
 * @param path The path to the project.
 */
export const loadProjectByPath =
  (path: string): Thunk =>
  async () => {
    try {
      // Parse the project from the file path
      const project = await fetch(path).then((res) => res.json());
      await uploadProjectToDB({
        ...project,
        meta: { ...project.meta, id: nanoid() },
      });
    } catch (e) {
      console.error(e);
    } finally {
      // Redirect to the playground
      window.location.href = PLAYGROUND_LINK;
    }
  };

/**
 * Reset the project's state to the default.
 */
export const clearProject = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const meta = selectMetadata(project);
  const newState = { ...defaultProject, meta };
  dispatch({ type: "setState", payload: newState });
};
