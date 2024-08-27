import { openDB } from "idb";
import { selectProjectId } from "types/Project/MetadataSelectors";
import { initializeProject } from "types/Project/ProjectTypes";
import {
  IDB_NAME,
  PROJECT_STORE,
  PRESET_STORE,
  SHORTCUT_STORE,
} from "utils/constants";
import { setCurrentProjectId } from "./projects";

/** Get the name of the user's database */
export const getUserDatabaseName = (userId: string) => `${IDB_NAME}-${userId}`;

/** Create a connection to the database and upgrade it if necessary. */
export const getUserDatabase = (userId: string) => {
  const databaseName = getUserDatabaseName(userId);
  return openDB(databaseName, import.meta.env.VITE_IDB_VERSION, {
    upgrade(db) {
      // Create a store for the list of projects
      if (!db.objectStoreNames.contains(PROJECT_STORE)) {
        db.createObjectStore(PROJECT_STORE, { keyPath: "present.meta.id" });
      }

      // Create a store for global presets
      if (!db.objectStoreNames.contains(PRESET_STORE)) {
        db.createObjectStore(PRESET_STORE, { keyPath: "id" });
      }

      // Create a store for global shortcuts
      if (!db.objectStoreNames.contains(SHORTCUT_STORE)) {
        db.createObjectStore(SHORTCUT_STORE, { keyPath: "id" });
      }
    },
  });
};

/** Initialize the user's database with a default project. */
export const initializeUserDatabase = async (userId: string) => {
  const db = await getUserDatabase(userId);

  // Try to get the current list of projects
  const projects = await db.getAll(PROJECT_STORE);

  // If no projects exist, add a new project and select it
  if (!projects || projects.length === 0) {
    const newProject = initializeProject();
    const newProjectId = selectProjectId(newProject);
    await db.add(PROJECT_STORE, newProject);
    await setCurrentProjectId(userId, newProjectId);
  }
};
