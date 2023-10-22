import { openDB } from "idb";
import { selectProjectId } from "redux/Metadata";
import { Project, defaultProject, isProject } from "types/Project";
import { User, UserUpdate, initializeUser } from "types/User";

// Database
export const DATABASE_NAME = import.meta.env.VITE_DATABASE_NAME;
export const PROJECT_STORE = import.meta.env.VITE_PROJECT_STORE;
export const CURRENT_ID_STORE = import.meta.env.VITE_CURRENT_STORE;
export const USER_STORE = import.meta.env.VITE_USER_STORE;
export const AUTH_STORE = import.meta.env.VITE_AUTH_STORE;

export const db = openDB(DATABASE_NAME, undefined, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(USER_STORE)) {
      db.createObjectStore(USER_STORE);
    }
    if (!db.objectStoreNames.contains(CURRENT_ID_STORE)) {
      db.createObjectStore(CURRENT_ID_STORE);
    }
    if (!db.objectStoreNames.contains(PROJECT_STORE)) {
      db.createObjectStore(PROJECT_STORE, { keyPath: "meta.id" });
    }
    if (!db.objectStoreNames.contains(AUTH_STORE)) {
      db.createObjectStore(AUTH_STORE);
    }
  },
});
export const dbPromise = openDB(DATABASE_NAME);

const initializeDB = async () => {
  const db = await dbPromise;
  // Try to get the user
  let user = await db.get(USER_STORE, "user");

  // If no user, add the user to the database
  if (!user) {
    user = initializeUser();
    await db.add(USER_STORE, user, "user");
  }

  // Try to get the current list of projects
  const projects = await db.getAll(PROJECT_STORE);

  // If no projects exist, add a new project
  if (!projects || projects.length === 0) {
    const newProject = { ...defaultProject };
    await db.add(PROJECT_STORE, newProject);
    await setCurrentProjectId(newProject.meta.id);
  }
};

initializeDB().catch(console.error);

/**
 * Try to set the authentication status.
 * @param status The status to set.
 */
export async function setAuthenticatedStatus(status: boolean): Promise<void> {
  const db = await dbPromise;
  await db.put(AUTH_STORE, status, "authenticated");
}

/**
 * Try to get the authentication status.
 */
export async function getAuthenticatedStatus(): Promise<boolean> {
  const db = await dbPromise;
  return db.get(AUTH_STORE, "authenticated");
}

/**
 * Try to get the user from the database.
 * @returns A promise that resolves to the user or undefined if it doesn't exist.
 */
export async function getUserFromDB(): Promise<User | undefined> {
  const db = await dbPromise;
  return db.get(USER_STORE, "user");
}

/**
 * Try to update the user in the database.
 * @param user Partial. The user to update.
 * @returns A promise that resolves to true if the update was successful.
 */
export async function updateUserInDB(user: UserUpdate): Promise<boolean> {
  const db = await dbPromise;
  const currentUser = await db.get(USER_STORE, "user");
  if (!currentUser) return false;
  await db.put(USER_STORE, { ...currentUser, ...user }, "user");
  return true;
}

/**
 * Create a new project in the database.
 * @param project The project to upload.
 * @returns A promise that resolves to true if the upload was successful.
 * @error The promise is rejected if the project is invalid.
 */
export const uploadProjectToDB = async (project: Project): Promise<boolean> => {
  if (!isProject(project)) throw new Error("Invalid project.");
  const db = await dbPromise;
  await db.put(PROJECT_STORE, project);
  await setCurrentProjectId(project.meta.id);
  return true;
};

/**
 * Update the project in the database only if it exists.
 * @param project The state to update.
 * @returns A promise that resolves to true if the update was successful.
 * @error The promise is rejected if the state is invalid.
 */
export async function updateProjectInDB(project: Project): Promise<boolean> {
  if (!isProject(project)) throw new Error("Invalid state.");
  const db = await dbPromise;
  const existingProject = await db.get(PROJECT_STORE, selectProjectId(project));
  if (!existingProject) return false;
  await db.put(PROJECT_STORE, project);
  return true;
}

/**
 * Delete the project from the database.
 * @param id The ID of the project to delete.
 * @returns A promise that resolves to true if the deletion was successful.
 */
export async function deleteProjectFromDB(id: string): Promise<boolean> {
  const db = await dbPromise;
  await db.delete(PROJECT_STORE, id);
  const currentId = await getCurrentProjectId();
  if (currentId === id) {
    await db.delete(CURRENT_ID_STORE, "currentProject");
  }
  return true;
}

/**
 * Get all projects from the database.
 * @returns A promise that resolves to an array of projects.
 */
export async function getProjectsFromDB(): Promise<Project[]> {
  const db = await dbPromise;
  return db.getAll(PROJECT_STORE);
}

/**
 * Get the project with the given ID from the database.
 * @param id The ID of the project to get.
 * @returns A promise that resolves to the project or undefined if it doesn't exist.
 */
export async function getProjectFromDB(
  id: string
): Promise<Project | undefined> {
  const db = await dbPromise;
  return db.get(PROJECT_STORE, id);
}

/**
 * Set the ID of the current project in the database.
 * @param id The ID of the project to set as current.
 * @returns A promise that resolves to true if the update was successful.
 */
export async function setCurrentProjectId(id: string): Promise<boolean> {
  const db = await dbPromise;
  const project = await db.get(PROJECT_STORE, id);
  if (!project) return false;
  await db.put(CURRENT_ID_STORE, { id }, "currentProject");
  return true;
}

/**
 * Get the ID of the current project from the database.
 * @returns A promise that resolves to the current project ID or undefined if it doesn't exist.
 */
export async function getCurrentProjectId(): Promise<string | undefined> {
  const db = await dbPromise;
  const current = await db.get(CURRENT_ID_STORE, "currentProject");
  return current?.id;
}
