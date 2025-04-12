import { openDB } from "idb";
import { IDB_NAME, PROJECT_STORE, SAMPLE_STORE } from "utils/constants";

/** Get the name of the database. */
export const getDatabaseName = () => `${IDB_NAME}`;

/** Create a connection to the database and upgrade it if necessary. */
export const getDatabase = async () => {
  const name = getDatabaseName();
  return await openDB(name, 3, {
    upgrade(db) {
      // Create a store for the user's projects
      if (!db.objectStoreNames.contains(PROJECT_STORE)) {
        db.createObjectStore(PROJECT_STORE, { keyPath: "present.meta.id" });
      }
      // Create a store for the user's samples
      if (!db.objectStoreNames.contains(SAMPLE_STORE)) {
        db.createObjectStore(SAMPLE_STORE, { keyPath: "id" });
      }
    },
  });
};
