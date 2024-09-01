import { getDatabase } from "providers/idb";
import { useEffect } from "react";

/** Use a callback after the database loads */
export async function useDatabaseCallback(callback: () => void, deps?: any[]) {
  useEffect(() => {
    const db = getDatabase();
    if (db) callback();
  }, [...(deps ?? [])]);
}
