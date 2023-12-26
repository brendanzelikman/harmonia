import { openDB } from "idb";
import { selectProjectId } from "redux/Metadata";
import { Project, defaultProject, isProject } from "types/Project";
import { User, UserUpdate, initializeUser } from "types/User";
import {
  FREE_PROJECT_LIMIT,
  PRO_PROJECT_LIMIT,
  VIRTUOSO_PROJECT_LIMIT,
} from "utils/constants";

// ------------------------------------------------------------
// Database Constants
// ------------------------------------------------------------

export const DATABASE_NAME = import.meta.env.VITE_DATABASE_NAME;
export const PROJECT_STORE = import.meta.env.VITE_PROJECT_STORE;
export const CURRENT_ID_STORE = import.meta.env.VITE_CURRENT_STORE;
export const USER_STORE = import.meta.env.VITE_USER_STORE;
export const AUTH_STORE = import.meta.env.VITE_AUTH_STORE;

export const db = openDB(DATABASE_NAME, undefined, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(AUTH_STORE)) {
      db.createObjectStore(AUTH_STORE);
    }
    if (!db.objectStoreNames.contains(USER_STORE)) {
      db.createObjectStore(USER_STORE);
    }
    if (!db.objectStoreNames.contains(CURRENT_ID_STORE)) {
      db.createObjectStore(CURRENT_ID_STORE);
    }
    if (!db.objectStoreNames.contains(PROJECT_STORE)) {
      db.createObjectStore(PROJECT_STORE, { keyPath: "meta.id" });
    }
  },
});
export const dbPromise = openDB(DATABASE_NAME);

// ------------------------------------------------------------
// Database Initialization
// ------------------------------------------------------------

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

// ------------------------------------------------------------
// Database Authentication
// ------------------------------------------------------------

export type AuthenticationStatus = undefined | "free" | "pro" | "virtuoso";

/** Try to set the authentication status. */
export async function setAuthenticationStatus(
  status: AuthenticationStatus
): Promise<void> {
  const db = await dbPromise;
  await db.put(AUTH_STORE, status, "authenticated");
}

/** Try to get the authentication status. */
export async function getAuthenticationStatus(): Promise<AuthenticationStatus> {
  const db = await dbPromise;
  return db.get(AUTH_STORE, "authenticated");
}

// ------------------------------------------------------------
// Database User
// ------------------------------------------------------------

/** Get the current user as a promise. */
export async function getUserFromDB(): Promise<User | undefined> {
  const db = await dbPromise;
  return db.get(USER_STORE, "user");
}

/** Update the current user, resolving to true if successful. */
export async function updateUserInDB(user: UserUpdate): Promise<boolean> {
  const db = await dbPromise;
  const currentUser = await db.get(USER_STORE, "user");
  if (!currentUser) return false;
  await db.put(USER_STORE, { ...currentUser, ...user }, "user");
  return true;
}

// ------------------------------------------------------------
// Database Current Project ID
// ------------------------------------------------------------

/** Update the current project ID, resolving to true if successful. */
export async function setCurrentProjectId(id: string): Promise<boolean> {
  const db = await dbPromise;
  const project = await db.get(PROJECT_STORE, id);
  if (!project) return false;
  await db.put(CURRENT_ID_STORE, { id }, "currentProject");
  return true;
}

/** Get the current project ID as a promise. */
export async function getCurrentProjectId(): Promise<string | undefined> {
  const db = await dbPromise;
  const current = await db.get(CURRENT_ID_STORE, "currentProject");
  return current?.id;
}

/** Replace the current project with a new project, resolving to the new ID if successful. */
export async function replaceCurrentProject(
  project: Project
): Promise<string | undefined> {
  const db = await dbPromise;

  // Try to get the current project ID
  const currentId = await getCurrentProjectId();

  // If no current project ID, add the project to the database
  if (!currentId) {
    await uploadProjectToDB(project);
  }

  // Otherwise, delete the current project and add the new project
  else {
    await deleteProjectFromDB(currentId);
    await uploadProjectToDB(project);
  }

  // Return the new project ID
  return project.meta.id;
}

// ------------------------------------------------------------
// Database Projects
// ------------------------------------------------------------

/** Upload a project, resolving to true if successful. */
export const uploadProjectToDB = async (project: Project): Promise<boolean> => {
  // Check if the project is valid
  if (!isProject(project)) throw new Error("Invalid project.");
  const db = await dbPromise;

  // Check if the user is authenticated
  const auth = await getAuthenticationStatus();
  if (auth === undefined) return false;

  // Check if the user has reached their project limit
  const projects = await db.getAll(PROJECT_STORE);
  const projectCount = projects.length;
  if (auth === "free" && projectCount >= FREE_PROJECT_LIMIT) {
    return false;
  } else if (auth === "pro" && projectCount >= PRO_PROJECT_LIMIT) {
    return false;
  } else if (auth === "virtuoso" && projectCount >= VIRTUOSO_PROJECT_LIMIT) {
    return false;
  }

  // Add the project to the database
  await db.put(PROJECT_STORE, project);

  // Set the current project ID
  await setCurrentProjectId(project.meta.id);

  // Return true if successful
  return true;
};

/** Update the project, resolving to true if successful. */
export async function updateProjectInDB(project: Project): Promise<boolean> {
  // Check if the project is valid
  if (!isProject(project)) throw new Error("Invalid project.");
  const db = await dbPromise;

  // Check if the project exists
  const existingProject = await db.get(PROJECT_STORE, selectProjectId(project));
  if (!existingProject) return false;

  // Update the project
  await db.put(PROJECT_STORE, project);

  // Return true if successful
  return true;
}

/** Delete a project by ID, resolving to true if successful. */
export async function deleteProjectFromDB(id: string): Promise<boolean> {
  const db = await dbPromise;

  // Try to delete the project
  await db.delete(PROJECT_STORE, id);

  // Check the current project ID
  const currentId = await getCurrentProjectId();

  // Clear the current project ID if it matches the deleted project
  if (currentId === id) {
    await db.delete(CURRENT_ID_STORE, "currentProject");
  }

  // Return true if successful
  return true;
}

/** Get the list of all projects as a promise. */
export async function getProjectsFromDB(): Promise<Project[]> {
  const db = await dbPromise;

  // Check if the user is authenticated
  const auth = await getAuthenticationStatus();
  if (auth === undefined) return [];

  // Get all of the user's projects
  const projects = await db.getAll(PROJECT_STORE);

  // Delete any invalid projects from the database
  for (const project of projects) {
    if (!isProject(project)) {
      projects.splice(projects.indexOf(project), 1);
      await deleteProjectFromDB(project.meta.id);
    }
  }

  // Return the projects based on the user's project limit
  if (auth === "free") return projects.slice(0, 1);
  if (auth === "pro") return projects.slice(0, 100);
  return projects;
}

/** Get the project with the given ID as a promise. */
export async function getProjectFromDB(
  id: string
): Promise<Project | undefined> {
  const db = await dbPromise;

  // Check if the user is authenticated
  const auth = await getAuthenticationStatus();
  if (auth === undefined) return undefined;

  // Return the project if it exists
  return db.get(PROJECT_STORE, id);
}
