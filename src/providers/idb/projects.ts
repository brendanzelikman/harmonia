import { PROJECT_ID } from "utils/constants";
import { fetchUser } from "providers/auth/user";
import { PROJECT_STORE } from "utils/constants";
import { Project, isProject } from "types/Project/ProjectTypes";
import { selectProjectId } from "types/Meta/MetaSelectors";
import { hasReachedProjectLimit } from "./util";
import { dispatchCustomEvent } from "utils/html";
import { UPDATE_PROJECTS } from "types/Project/ProjectThunks";
import { MAESTRO_PROJECT_LIMIT, PRODIGY_PROJECT_LIMIT } from "utils/rank";

/** Get the list of all projects as a promise. */
export async function getProjectsFromDB(): Promise<Project[]> {
  const user = await fetchUser();
  if (!user.db) return [];

  // Get all of the user's projects
  const projects = await user.db.getAll(PROJECT_STORE);

  // Delete any invalid projects from the database
  for (const project of projects) {
    if (!isProject(project)) {
      projects.splice(projects.indexOf(project), 1);
      await deleteProjectFromDB(project.meta.id);
    }
  }

  // Return the projects based on the user's project limit
  if (user.isAdmin) return projects;
  if (user.isProdigy) return projects.slice(0, PRODIGY_PROJECT_LIMIT);
  if (user.isMaestro) return projects.slice(0, MAESTRO_PROJECT_LIMIT);
  if (user.isVirtuoso) return projects;
  return [];
}

/** Get the project with the given ID as a promise. */
export async function getProjectFromDB(
  projectId?: string
): Promise<Project | undefined> {
  if (!projectId) return undefined;

  // Check if the user is authenticated
  const { db, isAuthorized } = await fetchUser();
  if (!db || !isAuthorized) return undefined;

  // Return the project if it exists
  return db.get(PROJECT_STORE, projectId);
}

/** Upload a project, resolving to true if successful. */
export async function uploadProjectToDB(project: Project): Promise<boolean> {
  // Check if the project is valid
  if (!isProject(project)) throw new Error("Invalid project.");

  // Check if the user is authorized
  const { db, isAuthorized } = await fetchUser();
  if (!db || !isAuthorized) return false;

  // Check if the user has reached their project limit and is uploading
  const cappedProjects = await hasReachedProjectLimit();
  const projectId = selectProjectId(project);
  const isUpdating = !!getProjectFromDB(projectId);
  if (cappedProjects && !isUpdating) return false;

  // Add the project to the database and update the current project ID
  await db.put(PROJECT_STORE, project);
  await setCurrentProjectId(projectId);
  dispatchCustomEvent(UPDATE_PROJECTS, projectId);
  return true;
}

/** Update the project, resolving to true if successful. */
export async function updateProjectInDB(project: Project): Promise<boolean> {
  // Check if the project is valid
  if (!isProject(project)) throw new Error("Invalid project.");

  const { db } = await fetchUser();
  if (!db) return false;

  // Check if the project exists
  const existingProject = await db.get(PROJECT_STORE, selectProjectId(project));
  if (!existingProject) return false;

  // Try to update the project
  await db.put(PROJECT_STORE, project);
  return true;
}

/** Delete a project by ID, resolving to true if successful. */
export async function deleteProjectFromDB(projectId: string): Promise<boolean> {
  const { db } = await fetchUser();
  if (!db) return false;

  // Clear the current project ID if it matches the deleted project
  const currentId = getCurrentProjectId();
  if (currentId === projectId) clearCurrentProjectId();

  // Try to delete the project
  await db.delete(PROJECT_STORE, projectId);
  return true;
}

// ------------------------------------------------------------
// Database Current Project ID
// ------------------------------------------------------------

/** Get the current project ID. */
export function getCurrentProjectId() {
  return localStorage.getItem(PROJECT_ID) ?? undefined;
}

/** Clear the current project ID. */
export function clearCurrentProjectId() {
  localStorage.removeItem(PROJECT_ID);
}

/** Set the ID of the project that should be currently loaded. */
export async function setCurrentProjectId(projectId: string): Promise<boolean> {
  const { db } = await fetchUser();
  if (!db) return false;

  // Make sure the ID exists in the database
  const projects = await db.getAll(PROJECT_STORE);
  if (!projects.some((p) => selectProjectId(p) === projectId)) return false;

  // Set the current project ID
  localStorage.setItem(PROJECT_ID, projectId);
  return true;
}

/** Replace the current project with a new project, resolving to the new ID if successful. */
export async function setCurrentProject(
  project: Project
): Promise<string | undefined> {
  // If the current project exists, delete it
  const currentId = getCurrentProjectId();
  if (currentId) await deleteProjectFromDB(currentId);

  // Upload the new project and return the new project ID
  await uploadProjectToDB(project);
  return selectProjectId(project);
}
