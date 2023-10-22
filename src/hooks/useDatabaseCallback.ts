import { db } from "indexedDB";
import { useEffect } from "react";

export function useDatabaseCallback(callback: () => void) {
  useEffect(() => {
    db.then((db) => !!db && callback());
  }, []);
}
