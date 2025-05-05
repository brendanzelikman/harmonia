import { PROJECT_ID } from "utils/constants";
import { PROJECT_STORE } from "utils/constants";
import {
  Project,
  getProjectWithNewId,
  initializeProject,
  isProject,
} from "types/Project/ProjectTypes";
import { selectProjectId } from "types/Meta/MetaSelectors";
import { dispatchCustomEvent } from "utils/event";
import { UPDATE_PROJECT_EVENT } from "utils/constants";
import { getDatabase } from "./database";

// ------------------------------------------------------------
// User Projects
// ------------------------------------------------------------

/** Get the list of all projects as a promise. */
export async function getProjects(): Promise<Project[]> {
  const db = await getDatabase();
  if (!db) return [];
  return await db.getAll(PROJECT_STORE);
}

/** Get a project from the database by ID. */
export async function getProject(id?: string): Promise<Project | undefined> {
  const db = await getDatabase();
  let projectId = id ?? getCurrentProjectId();
  if (!projectId || !db) return undefined;
  return await db.get(PROJECT_STORE, projectId);
}

/** Upload a project, resolving to true if successful. */
export async function uploadProject(project?: Project, newId = false) {
  const db = await getDatabase();
  if (!db) return;
  let newProject = project || (newId ? undefined : initializeProject());
  if (newId && !newProject) {
    const p = await getProject();
    if (p) newProject = getProjectWithNewId(p);
  }
  const id = await db.put(PROJECT_STORE, newProject);
  setCurrentProjectId(id.toString());
  dispatchCustomEvent(UPDATE_PROJECT_EVENT);
}

/** Update the project, resolving to true if successful. */
export async function updateProject(project: Project): Promise<boolean> {
  // Check if the project is valid
  if (!isProject(project)) throw new Error("Invalid project.");

  const db = await getDatabase();
  if (!db) return false;

  // Check if the project exists
  const existingProject = await db.get(PROJECT_STORE, selectProjectId(project));
  if (!existingProject) return false;

  // Try to update the project
  await db.put(PROJECT_STORE, project);
  return true;
}

/** Delete a project by ID, resolving to true if successful. */
export async function deleteProject(projectId: string) {
  const db = await getDatabase();
  if (!db) return;

  // Clear the current project ID if it matches the deleted project
  const currentId = getCurrentProjectId();
  if (currentId === projectId) clearCurrentProjectId();

  // Try to delete the project
  await db.delete(PROJECT_STORE, projectId);
  dispatchCustomEvent(UPDATE_PROJECT_EVENT);
}

/** Delete all projects */
export async function deleteProjects() {
  const db = await getDatabase();
  if (!db) return;
  const projects = await getProjects();
  await Promise.all(
    projects.map(async (p) => {
      const projectId = selectProjectId(p);
      const currentId = getCurrentProjectId();
      if (currentId === projectId) clearCurrentProjectId();
      await db.delete(PROJECT_STORE, projectId);
    })
  );
  dispatchCustomEvent(UPDATE_PROJECT_EVENT);
}

// ------------------------------------------------------------
// Current Project ID
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
export function setCurrentProjectId(projectId: string) {
  localStorage.setItem(PROJECT_ID, projectId);
}
