import { IDBPDatabase, openDB } from "idb";
import { UPDATE_PROJECTS } from "types/Project/ProjectThunks";
import {
  IDB_NAME,
  PROJECT_STORE,
  PRESET_STORE,
  SHORTCUT_STORE,
} from "utils/constants";
import { dispatchCustomEvent } from "utils/html";

export let DATABASE: IDBPDatabase | null = null;
export const getDatabase = () => DATABASE;
export const getDatabaseName = (userId: string) => `${IDB_NAME}-${userId}`;

/** Create a connection to the database and upgrade it if necessary. */
export const initializeDatabase = async (userId: string | null) => {
  if (!userId) return;
  const databaseName = getDatabaseName(userId);
  const db = await openDB(databaseName, import.meta.env.VITE_IDB_VERSION, {
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
  // Dispatch an event to update the projects
  dispatchCustomEvent(UPDATE_PROJECTS);
  DATABASE = db;
};
