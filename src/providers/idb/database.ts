import { openDB } from "idb";
import { IDB_NAME, PROJECT_STORE, SAMPLE_STORE } from "utils/constants";

export const getDatabaseName = (userId: string | null) =>
  `${IDB_NAME}-${userId}`;

/** Create a connection to the database and upgrade it if necessary. */
export const getDatabase = async (userId: string | null) => {
  if (!userId) return null;
  const name = getDatabaseName(userId);
  return await openDB(name, import.meta.env.VITE_IDB_VERSION, {
    upgrade(db) {
      // Create a store for the list of projects
      if (!db.objectStoreNames.contains(PROJECT_STORE)) {
        db.createObjectStore(PROJECT_STORE, { keyPath: "present.meta.id" });
      }
      // Create a store for the list of samples
      if (!db.objectStoreNames.contains(SAMPLE_STORE)) {
        db.createObjectStore(SAMPLE_STORE, { keyPath: "id" });
      }
    },
  });
};
