import { nanoid } from "@reduxjs/toolkit";
import { selectMeta } from "../Meta/MetaSelectors";
import { isProject } from "./ProjectTypes";
import { mergeBaseProjects, sanitizeProject } from "./ProjectFunctions";
import { dispatchCustomEvent, promptUserForNumber } from "utils/html";
import { UPDATE_PROJECT_EVENT } from "utils/constants";
import {
  getProjectFromDB,
  setCurrentProjectId,
  uploadProjectToDB,
  updateProjectInDB,
  getCurrentProjectId,
} from "providers/projects";
import { store } from "providers/store";

interface ProjectFileOptions {
  merging?: boolean;
  reload?: boolean;
}

/** Try to load the project by ID from the database. */
export const loadProject = async (id: string, callback?: () => void) => {
  try {
    const project = await getProjectFromDB(id);
    if (!isProject(project)) throw new Error("Invalid project");
    await setCurrentProjectId(id);
    store.dispatch({ type: "setProject", payload: project });
  } catch (e) {
    console.error(e);
    return false;
  } finally {
    callback?.();
    return true;
  }
};

/** Try to load the project from the given path (used for demos). */
export const loadProjectByPath = async (
  path: string,
  callback?: () => void
) => {
  // Fetch and sanitize the project
  const baseProject = await fetch(path).then((res) => res.json());
  const project = sanitizeProject({ present: baseProject });

  // Upload the project to the database
  let projectId = nanoid();
  project.present.meta.id = projectId;
  await uploadProjectToDB(project);
  await setCurrentProjectId(projectId);
  callback?.();
};

/** Open the user's file system and read local projects. */
export const readLocalProjects = (options?: ProjectFileOptions) => {
  const input = document.createElement("input");
  input.type = "file";
  input.multiple = true;
  input.accept = ".json";
  input.addEventListener("change", (e) => {
    const files = (e.target as HTMLInputElement).files ?? [];
    for (const file of files) {
      loadProjectByFile(file, options);
    }
  });
  input.click();
  input.remove();
};

/** Try to upload a new project or update the current project by file. */
export const loadProjectByFile = (file: File, options?: ProjectFileOptions) => {
  const reader = new FileReader();
  reader.onload = async (e) => {
    if (!e.target?.result) {
      return window.location.reload();
    }

    // Parse the project from the file
    const projectString = e.target.result as string;
    const baseProject = JSON.parse(projectString);
    const project = sanitizeProject({ present: baseProject });

    if (!isProject(project)) {
      throw new Error("Invalid project.");
    }

    // Try to get the existing project
    const meta = selectMeta(project);
    const existingProject = await getProjectFromDB(meta.id);

    if (!options?.merging) {
      // Upload or save the project depending on whether it already exists
      if (!existingProject) {
        await uploadProjectToDB(project);
      } else {
        await updateProjectInDB(project);
        await setCurrentProjectId(meta.id);
      }

      // Reload the page
    } else {
      // Merge the project with the existing project
      const currentProjectId = getCurrentProjectId();
      const currentProject = await getProjectFromDB(currentProjectId);
      if (!currentProject) return;
      await promptUserForNumber(
        `What Would You Like to Import?`,
        <>
          <p>Type 1 to Import Motifs</p>
          <p>Type 2 to Import Motifs and Tracks</p>
          <p>Type 3 to Import Motifs, Tracks, and Clips</p>
        </>,
        async (option) => {
          const mergedBaseProject = mergeBaseProjects(
            currentProject.present,
            project.present,
            option === 1
              ? { mergeMotifs: true, mergeTracks: false, mergeClips: false }
              : option === 2
              ? { mergeMotifs: true, mergeTracks: true, mergeClips: false }
              : option === 3
              ? { mergeMotifs: true, mergeTracks: true, mergeClips: true }
              : undefined
          );
          await updateProjectInDB({
            ...currentProject,
            present: mergedBaseProject,
          });
        }
      )();
    }
    dispatchCustomEvent(UPDATE_PROJECT_EVENT);
    if (options?.reload) window.location.reload();
  };
  reader.readAsText(file);
};
