import { DATABASE_NAME, db } from "indexedDB";
import { useEffect } from "react";

export function useDatabaseCallback(callback: () => void) {
  useEffect(() => {
    if (db) {
      callback();
    } else {
      const req = indexedDB.open(DATABASE_NAME);
      req.onsuccess = callback;
    }
  }, []);
}
