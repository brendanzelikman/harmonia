import { nanoid } from "@reduxjs/toolkit";
import {
  uploadProjectToDB,
  setCurrentProjectId,
  updateProjectInDB,
  getProjectFromDB,
  deleteProjectFromDB,
  getProjectsFromDB,
  getCurrentProjectId,
  replaceCurrentProject,
} from "indexedDB";
import { selectMetadata, selectProjectName } from "redux/Metadata";
import { selectClipIds } from "redux/selectors";
import { Thunk, isProjectEmpty, mergeProjects } from "types/Project";
import { exportClipsToMidi } from "redux/thunks";
import {
  Project,
  defaultProject,
  isProject,
  initializeProject,
  sanitizeProject,
} from "types/Project";
import { dispatchCustomEvent } from "utils/html";
import { sample } from "lodash";
import JSZip from "jszip";
import isElectron from "is-electron";
import { store } from "redux/store";
import { getSubscriptionStatus } from "providers/subscription";
import { getAuthenticationStatus } from "providers/authentication";

export const CREATE_PROJECT = "createProject";
export const DELETE_PROJECT = "deleteProject";

/** Try to create a new project, using the given template if specified. */
export const createProject = async (template?: Project) => {
  const { user } = await getAuthenticationStatus();
  if (!user) return;
  const project = initializeProject(template);
  const id = project.meta.id;
  try {
    await uploadProjectToDB(user.uid, project);
    await setCurrentProjectId(user.uid, id);
  } catch (e) {
    console.log(e);
  } finally {
    dispatchCustomEvent(CREATE_PROJECT, id);
  }
};

/** Try to delete the project from the database. */
export const deleteProject = (id: string) => async () => {
  const { user } = await getAuthenticationStatus();
  if (!user) return;

  try {
    deleteProjectFromDB(user.uid, id);
  } catch (e) {
    console.error(e);
  } finally {
    dispatchCustomEvent(DELETE_PROJECT, id);
  }
};

/** Delete all empty projects. */
export const deleteEmptyProjects = async () => {
  const { user } = await getAuthenticationStatus();
  if (!user) return;

  try {
    const projects = await getProjectsFromDB(user.uid);
    const emptyProjects = projects.filter(isProjectEmpty);
    emptyProjects.forEach((project) =>
      deleteProjectFromDB(user.uid, project.meta.id)
    );
  } catch (e) {
    console.error(e);
  } finally {
    dispatchCustomEvent(DELETE_PROJECT, "all");
  }
};

/** Try to save the project to the database, sanitizing it first. */
export const saveProject =
  (project?: Project): Thunk =>
  async (dispatch, getProject) => {
    const { user } = await getAuthenticationStatus();
    if (!user) return;

    // Sanitize the project
    const sanitizedProject = sanitizeProject(project || getProject());

    // Update the project's timestamp
    const updatedProject = {
      ...sanitizedProject,
      meta: { ...sanitizedProject.meta, lastUpdated: new Date().toISOString() },
    };

    // Update the project in the database.
    updateProjectInDB(user.uid, updatedProject);
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

/** Export all projects to Harmonia files and download them as a zip. */
export const exportProjectsToZIP = async () => {
  const { user } = await getAuthenticationStatus();
  if (!user) return;
  try {
    // Convert the projects to blobs
    const projects = (await getProjectsFromDB(user.uid)).map(sanitizeProject);
    const jsons = projects.map((project) => JSON.stringify(project));
    const blobs = jsons.map((_) => new Blob([_], { type: "application/json" }));

    // Add each blob to a new zip
    const zip = new JSZip();
    blobs.forEach((blob, i) => {
      const projectName = selectProjectName(projects[i]);
      const fileName = `${projectName ?? "project"}.ham`;
      zip.file(fileName, blob);
    });

    // Finalize the archive
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const link = document.createElement("a");

    // Download the zip
    link.download = "harmonia_projects.zip";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error(e);
  }
};

/** Open the user's file system and read local projects. */
export const loadFromLocalProjects = (): Thunk => (dispatch) => {
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
  (id: string, callback?: () => void): Thunk<Promise<boolean>> =>
  async (dispatch) => {
    const { user } = await getAuthenticationStatus();
    if (!user) return false;

    try {
      const project = await getProjectFromDB(user.uid, id);
      if (!isProject(project)) throw new Error("Invalid project");
      await setCurrentProjectId(user.uid, id);
      dispatch({ type: "setProject", payload: project });
    } catch (e) {
      console.error(e);
      return false;
    } finally {
      callback?.();
      return true;
    }
  };

/** Open the user's file system and read local projects. */
export const mergeFromLocalProjects = (): Thunk => (dispatch) => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".ham";
  input.addEventListener("change", (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      dispatch(mergeProjectByFile(file));
    }
  });
  input.click();
};

/** Try to merge a project from a Harmonia file. */
export const mergeProjectByFile =
  (file: File): Thunk =>
  async (dispatch) => {
    const { user } = await getAuthenticationStatus();
    if (!user) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (!e.target?.result) return;

        // Parse the project from the file
        const projectString = e.target.result as string;
        const project = JSON.parse(projectString);

        if (!isProject(project)) {
          throw new Error("Invalid project.");
        }

        // Merge the project with the current project
        const currentProjectId = await getCurrentProjectId(user.uid);
        if (!currentProjectId) return;
        const currentProject = await getProjectFromDB(
          user.uid,
          currentProjectId
        );
        if (!currentProject) return;
        const mergedProject = mergeProjects(currentProject, project);

        // Upload or save the project depending on whether it already exists
        const existingProject = await getProjectFromDB(
          user.uid,
          mergedProject.meta.id
        );
        if (!existingProject) {
          uploadProjectToDB(user.uid, mergedProject);
        } else {
          updateProjectInDB(user.uid, mergedProject);
        }
      };
      reader.readAsText(file);
    } catch (e) {
      console.log(e);
    } finally {
      window.location.reload();
    }
  };

/** Try to load a project from a Harmonia file. */
export const loadProjectByFile =
  (file: File): Thunk =>
  async (dispatch) => {
    const { user, isAuthenticated } = await getAuthenticationStatus();
    const { isProdigy } = await getSubscriptionStatus();
    if (!user || !isAuthenticated) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (!e.target?.result) return;

        // Parse the project from the file
        const projectString = e.target.result as string;
        const project = JSON.parse(projectString);

        if (!isProject(project)) {
          throw new Error("Invalid project.");
        }

        // Try to get the existing project
        const existingProject = await getProjectFromDB(
          user.uid,
          project.meta.id
        );

        // Replace the current project if the free tier has a project
        if (isProdigy) {
          await replaceCurrentProject(user.uid, project);
        }

        // Upload or save the project depending on whether it already exists
        if (!existingProject) {
          uploadProjectToDB(user.uid, project);
        } else {
          updateProjectInDB(user.uid, project);
        }
      };
      reader.readAsText(file);
    } catch (e) {
      console.log(e);
    } finally {
    }
  };

/** Try to load the project from the given path. */
export const loadProjectByPath =
  (path: string, callback?: () => void): Thunk =>
  async () => {
    // Check if the user is authenticated
    const { user, isAuthenticated } = await getAuthenticationStatus();
    const { isProdigy } = await getSubscriptionStatus();
    if (!user || !isAuthenticated) return;

    try {
      // Get the project from the path
      const project = await fetch(path).then((res) => res.json());

      // Replace the current project if the free tier has a project
      if (isProdigy) {
        await replaceCurrentProject(user.uid, project);
      }

      // Upload the project to the database
      else {
        await uploadProjectToDB(user.uid, {
          ...project,
          meta: { ...project.meta, id: nanoid() },
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      callback?.();
    }
  };

/** Try to load a project at random. */
export const loadRandomProject =
  (callback?: () => void): Thunk =>
  async (dispatch) => {
    const { user } = await getAuthenticationStatus();
    if (!user) return;
    try {
      const projects = await getProjectsFromDB(user.uid);
      const randomProject = sample(projects);
      if (!randomProject) return;
      await dispatch(loadProject(randomProject.meta.id));
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
