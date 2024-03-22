import { getUserDatabase } from "indexedDB";
import { useAuthentication } from "providers/authentication";
import { useEffect } from "react";

/** Use a callback after the database loads */
export function useDatabaseCallback(callback: () => void, deps?: any[]) {
  const { uid } = useAuthentication();
  useEffect(() => {
    if (!uid) return;
    const db = getUserDatabase(uid);
    db.then((db) => !!db && callback());
  }, [...(deps ?? []), uid]);
}
