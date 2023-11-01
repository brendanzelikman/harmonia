import { db } from "indexedDB";
import { useEffect } from "react";

/** Use a callback after the database loads */
export function useDatabaseCallback(callback: () => void) {
  useEffect(() => {
    db.then((db) => !!db && callback());
  }, []);
}
