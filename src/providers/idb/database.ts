import { openDB } from "idb";
import { initializeProject } from "types/Project/ProjectTypes";
import { IDB_NAME, PROJECT_STORE, SAMPLE_STORE } from "utils/constants";
import { uploadProjectToDB } from "./projects";

export const getDatabaseName = () => `${IDB_NAME}`;

/** Create a connection to the database and upgrade it if necessary. */
export const getDatabase = async () => {
  const name = getDatabaseName();
  return await openDB(name, import.meta.env.VITE_IDB_VERSION, {
    upgrade(db) {
      // Create a store for the list of projects
      if (!db.objectStoreNames.contains(PROJECT_STORE)) {
        db.createObjectStore(PROJECT_STORE, { keyPath: "present.meta.id" });
        uploadProjectToDB(initializeProject());
      }
      // Create a store for the list of samples
      if (!db.objectStoreNames.contains(SAMPLE_STORE)) {
        db.createObjectStore(SAMPLE_STORE, { keyPath: "id" });
      }
    },
  });
};
