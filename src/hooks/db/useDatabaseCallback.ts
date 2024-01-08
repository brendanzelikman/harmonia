import { getUserDatabase } from "indexedDB";
import { useAuthentication } from "providers/authentication";
import { useEffect } from "react";

/** Use a callback after the database loads */
export function useDatabaseCallback(callback: () => void, deps?: any[]) {
  const { user } = useAuthentication();
  useEffect(() => {
    if (!user) return;
    const db = getUserDatabase(user.uid);
    db.then((db) => !!db && callback());
  }, [...(deps ?? []), user]);
}
