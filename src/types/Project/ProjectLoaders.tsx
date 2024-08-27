import { nanoid } from "@reduxjs/toolkit";
import {
  getProjectFromDB,
  uploadProjectToDB,
  updateProjectInDB,
  getProjectsFromDB,
  setCurrentProject,
  setCurrentProjectId,
  getCurrentProjectId,
} from "providers/idb";
import { sample } from "lodash";
import { getAuthenticationStatus } from "providers/authentication";
import { getSubscriptionStatus } from "providers/subscription";
import { selectMetadata } from "../Meta/MetaSelectors";
import { Thunk, isProject } from "./ProjectTypes";
import { mergeBaseProjects } from "./ProjectFunctions";
import { promptUserForNumber } from "utils/html";

/** Open the user's file system and read local projects. */
export const readLocalProjects =
  (options?: { merging: boolean }): Thunk =>
  (dispatch) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".ham";
    input.addEventListener("change", (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        dispatch(loadProjectByFile(file, !!options?.merging));
      }
    });
    input.click();
  };

/** Try to load the project by ID from the database. */
export const loadProject =
  (id: string, callback?: () => void): Thunk<Promise<boolean>> =>
  async (dispatch) => {
    const { uid } = await getAuthenticationStatus();
    if (!uid) return false;

    try {
      const project = await getProjectFromDB(uid, id);
      if (!isProject(project)) throw new Error("Invalid project");
      await setCurrentProjectId(uid, id);
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
  (file: File, merging = false): Thunk =>
  async (dispatch) => {
    const { uid, isAuthorized } = await getAuthenticationStatus();
    const { isAtLeastStatus } = await getSubscriptionStatus();
    if (!uid || !isAuthorized) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (!e.target?.result) {
          return window.location.reload();
        }

        // Parse the project from the file
        const projectString = e.target.result as string;
        const project = JSON.parse(projectString);

        if (!isProject(project)) {
          throw new Error("Invalid project.");
        }

        // Try to get the existing project
        const meta = selectMetadata(project);
        const existingProject = await getProjectFromDB(uid, meta.id);

        if (!merging) {
          // Replace the current project if the free tier has a project
          if (!isAtLeastStatus("maestro")) {
            await setCurrentProject(uid, project);
            return;
          }

          // Upload or save the project depending on whether it already exists
          if (!existingProject) {
            await uploadProjectToDB(uid, project);
          } else {
            await updateProjectInDB(uid, project);
          }

          // Reload the page
          window.location.reload();
        } else {
          // Merge the project with the existing project
          const currentProjectId = getCurrentProjectId();
          const currentProject = await getProjectFromDB(uid, currentProjectId);
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
              await updateProjectInDB(uid, {
                ...currentProject,
                present: mergedBaseProject,
              });
              window.location.reload();
            }
          )();
        }
      };
      reader.readAsText(file);
    } catch (e) {
      console.log(e);
    }
  };

/** Try to load the project from the given path (used for demos). */
export const loadProjectByPath =
  (path: string, callback?: () => void): Thunk =>
  async () => {
    // Check if the user is authenticated
    const { uid, isAuthorized } = await getAuthenticationStatus();
    const { isAtLeastStatus } = await getSubscriptionStatus();
    if (!uid || !isAuthorized) return;

    let projectId;

    try {
      // Get the project from the path
      const project = await fetch(path).then((res) => res.json());

      // Replace the current project if the free tier has a project
      if (!isAtLeastStatus("maestro")) {
        await setCurrentProject(uid, project);
        projectId = project.meta.id;
      }

      // Upload the project to the database
      else {
        projectId = nanoid();
        await uploadProjectToDB(uid, {
          ...project,
          meta: { ...project.meta, id: projectId },
        });
      }

      setCurrentProjectId(uid, projectId);
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
    const { uid } = await getAuthenticationStatus();
    if (!uid) return;
    try {
      const projects = await getProjectsFromDB(uid);
      const randomProject = sample(projects);
      if (!randomProject) return;
      const meta = selectMetadata(randomProject);
      await dispatch(loadProject(meta.id));
    } catch (e) {
      console.error(e);
    } finally {
      callback?.();
    }
  };
