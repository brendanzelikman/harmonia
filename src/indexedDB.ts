import { getSubscriptionStatus } from "providers/subscription";
import { openDB } from "idb";
import { selectProjectId } from "redux/Metadata";
import { Project, defaultProject, isProject } from "types/Project";
import {
  PRODIGY_PROJECT_LIMIT,
  MAESTRO_PROJECT_LIMIT,
  VIRTUOSO_PROJECT_LIMIT,
} from "utils/constants";
import { getAuthenticationStatus } from "providers/authentication";
import {
  INDEXED_DATABASE_NAME,
  CURRENT_ID_STORE,
  PROJECT_STORE,
} from "utils/constants";

// Get the name of the user's database
export const getUserDatabaseName = (userId: string) =>
  `${INDEXED_DATABASE_NAME}-${userId}`;

// Create a connection to the database and upgrade it if necessary
export const getUserDatabase = (userId: string) => {
  const databaseName = getUserDatabaseName(userId);
  return openDB(databaseName, undefined, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(CURRENT_ID_STORE)) {
        db.createObjectStore(CURRENT_ID_STORE);
      }
      if (!db.objectStoreNames.contains(PROJECT_STORE)) {
        db.createObjectStore(PROJECT_STORE, { keyPath: "meta.id" });
      }
    },
  });
};

// ------------------------------------------------------------
// Database Initialization
// ------------------------------------------------------------

export const initializeUserDatabase = async (userId: string) => {
  const db = await getUserDatabase(userId);

  // Try to get the current list of projects
  const projects = await db.getAll(PROJECT_STORE);

  // If no projects exist, add a new project
  if (!projects || projects.length === 0) {
    const newProject = { ...defaultProject };
    await db.add(PROJECT_STORE, newProject);
    await setCurrentProjectId(userId, newProject.meta.id);
  }
};

// ------------------------------------------------------------
// Database Projects
// ------------------------------------------------------------

/** Get a boolean indicating whether a user has reached their maximum projects */
export const hasReachedProjectLimit = async (uid: string): Promise<boolean> => {
  const db = await getUserDatabase(uid);
  const { isProdigy, isMaestro, isVirtuoso } = await getSubscriptionStatus(uid);

  // Check if the user has reached their project limit
  const projects = await db.getAll(PROJECT_STORE);
  const projectCount = projects.length;

  // Check the prodigy tier
  if (isProdigy && projectCount >= PRODIGY_PROJECT_LIMIT) {
    return true;
  }

  // Check the maestro tier
  if (isMaestro && projectCount >= MAESTRO_PROJECT_LIMIT) {
    return true;
  }

  // Check the virtuoso tier
  if (isVirtuoso && projectCount >= VIRTUOSO_PROJECT_LIMIT) {
    return true;
  }

  // Return false otherwise
  return false;
};

/** Upload a project, resolving to true if successful. */
export const uploadProjectToDB = async (
  userId: string,
  project: Project
): Promise<boolean> => {
  // Check if the project is valid
  if (!isProject(project)) throw new Error("Invalid project.");
  const db = await getUserDatabase(userId);

  // Check if the user is authenticated
  const { isAuthenticated } = await getAuthenticationStatus();
  if (!isAuthenticated) return false;

  // Check if the user has reached their project limit
  const cappedProjects = await hasReachedProjectLimit(userId);
  if (cappedProjects) return false;

  // Add the project to the database
  await db.put(PROJECT_STORE, project);

  // Set the current project ID
  await setCurrentProjectId(userId, project.meta.id);
  console.log("good");

  // Return true if successful
  return true;
};

/** Get the list of all projects as a promise. */
export async function getProjectsFromDB(uid: string): Promise<Project[]> {
  const db = await getUserDatabase(uid);

  // Check if the user is authenticated
  const { isProdigy, isMaestro, isVirtuoso } = await getSubscriptionStatus(uid);

  // Get all of the user's projects
  const projects = await db.getAll(PROJECT_STORE);

  // Delete any invalid projects from the database
  for (const project of projects) {
    if (!isProject(project)) {
      projects.splice(projects.indexOf(project), 1);
      await deleteProjectFromDB(uid, project.meta.id);
    }
  }

  // Return the projects based on the user's project limit
  if (isProdigy) return projects.slice(0, 1);
  if (isMaestro) return projects.slice(0, 100);
  if (isVirtuoso) return projects;
  return [];
}

/** Get the project with the given ID as a promise. */
export async function getProjectFromDB(
  userId: string,
  projectId: string
): Promise<Project | undefined> {
  const db = await getUserDatabase(userId);

  // Check if the user is authenticated
  const { isAuthenticated } = await getAuthenticationStatus();
  if (!isAuthenticated) return undefined;

  // Return the project if it exists
  return db.get(PROJECT_STORE, projectId);
}

/** Update the project, resolving to true if successful. */
export async function updateProjectInDB(
  userId: string,
  project: Project
): Promise<boolean> {
  // Check if the project is valid
  if (!isProject(project)) throw new Error("Invalid project.");
  const db = await getUserDatabase(userId);

  // Check if the project exists
  const existingProject = await db.get(PROJECT_STORE, selectProjectId(project));
  if (!existingProject) return false;

  // Update the project
  await db.put(PROJECT_STORE, project);

  // Return true if successful
  return true;
}

/** Delete a project by ID, resolving to true if successful. */
export async function deleteProjectFromDB(
  userId: string,
  projectId: string
): Promise<boolean> {
  const db = await getUserDatabase(userId);

  // Try to delete the project
  await db.delete(PROJECT_STORE, projectId);

  // Check the current project ID
  const currentId = await getCurrentProjectId(userId);

  // Clear the current project ID if it matches the deleted project
  if (currentId === projectId) {
    await db.delete(CURRENT_ID_STORE, "currentProject");
  }

  // Return true if successful
  return true;
}

// ------------------------------------------------------------
// Database Current Project ID
// ------------------------------------------------------------

/** Update the current project ID, resolving to true if successful. */
export async function setCurrentProjectId(
  userId: string,
  projectId: string
): Promise<boolean> {
  const db = await getUserDatabase(userId);
  const project = await db.get(PROJECT_STORE, projectId);
  if (!project) return false;
  await db.put(CURRENT_ID_STORE, { id: projectId }, "currentProject");
  return true;
}

/** Get the current project ID as a promise. */
export async function getCurrentProjectId(
  userId: string
): Promise<string | undefined> {
  const db = await getUserDatabase(userId);
  const current = await db.get(CURRENT_ID_STORE, "currentProject");
  return current?.id;
}

/** Replace the current project with a new project, resolving to the new ID if successful. */
export async function replaceCurrentProject(
  userId: string,
  project: Project
): Promise<string | undefined> {
  // Try to get the current project ID
  const currentId = await getCurrentProjectId(userId);

  // If no current project ID, add the project to the database
  if (!currentId) {
    await uploadProjectToDB(userId, project);
  }

  // Otherwise, delete the current project and add the new project
  else {
    await deleteProjectFromDB(userId, currentId);
    await uploadProjectToDB(userId, project);
  }

  // Return the new project ID
  return project.meta.id;
}
