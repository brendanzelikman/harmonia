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
import { dispatchCustomEvent } from "utils/html";

export const CREATE_PROJECT = "createProject";
export const DELETE_PROJECT = "deleteProject";

/** Try to create a new project, using the given template if specified. */
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

/** Try to delete the project from the database. */
export const deleteProject = (id: string) => () => {
  try {
    deleteProjectFromDB(id);
  } catch (e) {
    console.error(e);
  } finally {
    dispatchCustomEvent(DELETE_PROJECT, id);
  }
};

/** Try to save the project to the database, sanitizing it first. */
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

/** Export the project to a Harmonia file, using the given state if specified. */
export const exportProjectToHAM =
  (project?: Project): Thunk =>
  (dispatch, getProject) => {
    // Serialize the project
    const sanitizedProject = sanitizeProject(project || getProject());
    const projectJSON = JSON.stringify(sanitizedProject);

    // Create a blob and download it
    const blob = new Blob([projectJSON], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const name = selectProjectName(sanitizedProject);
    link.download = `${name ?? "project"}.ham`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

/** Export the project to a MIDI file based on its clips, using the given project if specified. */
export const exportProjectToMIDI =
  (project?: Project): Thunk =>
  (dispatch, getProject) => {
    const savedProject = project || getProject();
    const clipIds = selectClipIds(savedProject);
    dispatch(exportClipsToMidi(clipIds));
  };

/** Open the user's file system and read local projects. */
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

/** Try to load the project by ID from the database. */
export const loadProject =
  (id: string, callback?: () => void): Thunk =>
  async (dispatch) => {
    try {
      const project = await getProjectFromDB(id);
      await setCurrentProjectId(id);
      dispatch({ type: "setProject", payload: project });
    } catch (e) {
      console.error(e);
    } finally {
      callback?.();
    }
  };

/** Try to load a project from a Harmonia file. */
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

/** Try to load the project from the given path. */
export const loadProjectByPath =
  (path: string, callback?: () => void): Thunk =>
  async () => {
    try {
      const project = await fetch(path).then((res) => res.json());
      await uploadProjectToDB({
        ...project,
        meta: { ...project.meta, id: nanoid() },
      });
    } catch (e) {
      console.error(e);
    } finally {
      callback?.();
    }
  };

/** Reset the project's state to the default. */
export const clearProject = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const meta = selectMetadata(project);
  dispatch({ type: "setProject", payload: { ...defaultProject, meta } });
};
