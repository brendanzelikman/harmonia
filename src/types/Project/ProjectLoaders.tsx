import { nanoid } from "@reduxjs/toolkit";
import { sample } from "lodash";
import { selectMeta } from "../Meta/MetaSelectors";
import { Thunk, isProject } from "./ProjectTypes";
import { mergeBaseProjects, sanitizeProject } from "./ProjectFunctions";
import { dispatchCustomEvent, promptUserForNumber } from "utils/html";
import { UPDATE_PROJECTS } from "./ProjectThunks";
import {
  getProjectFromDB,
  setCurrentProjectId,
  uploadProjectToDB,
  updateProjectInDB,
  getCurrentProjectId,
  getProjectsFromDB,
} from "providers/idb/projects";

interface ProjectFileOptions {
  merging?: boolean;
  reload?: boolean;
}

/** Open the user's file system and read local projects. */
export const readLocalProjects =
  (options?: ProjectFileOptions): Thunk =>
  (dispatch) => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = ".ham";
    input.addEventListener("change", (e) => {
      const files = (e.target as HTMLInputElement).files ?? [];
      for (const file of files) {
        dispatch(loadProjectByFile(file, options));
      }
    });
    input.click();
    input.remove();
  };

/** Try to load the project by ID from the database. */
export const loadProject =
  (id: string, callback?: () => void): Thunk<Promise<boolean>> =>
  async (dispatch) => {
    try {
      const project = await getProjectFromDB(id);
      if (!isProject(project)) throw new Error("Invalid project");
      await setCurrentProjectId(id);
      dispatch({ type: "setProject", payload: project });
    } catch (e) {
      console.error(e);
      return false;
    } finally {
      callback?.();
      return true;
    }
  };

/** Try to upload a new project or update the current project by file. */
export const loadProjectByFile =
  (file: File, options?: ProjectFileOptions): Thunk =>
  async (dispatch) => {
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
      dispatchCustomEvent(UPDATE_PROJECTS);
      if (options?.reload) window.location.reload();
    };
    reader.readAsText(file);
  };

/** Try to load the project from the given path (used for demos). */
export const loadProjectByPath =
  (path: string, callback?: () => void): Thunk =>
  async () => {
    let projectId;

    try {
      // Get the project from the path
      const baseProject = await fetch(path).then((res) => res.json());
      const project = sanitizeProject({ present: baseProject });

      // Upload the project to the database
      projectId = nanoid();
      project.present.meta.id = projectId;
      await uploadProjectToDB(project);
      setCurrentProjectId(projectId);
    } catch (e) {
      console.error(e);
    } finally {
      callback?.();
    }
  };

/** Try to load one of the user's projects at random. */
export const loadRandomProject =
  (callback?: () => void): Thunk =>
  async (dispatch) => {
    try {
      const projects = await getProjectsFromDB();
      const randomProject = sample(projects);
      if (!randomProject) return;
      const meta = selectMeta(randomProject);
      await dispatch(loadProject(meta.id));
    } catch (e) {
      console.error(e);
    } finally {
      callback?.();
    }
  };
