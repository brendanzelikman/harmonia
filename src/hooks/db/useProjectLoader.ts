import {
  getProjectFromDB,
  getUserDatabaseName,
  uploadProjectToDB,
} from "providers/idb";
import { getCurrentProjectId } from "providers/idb";
import { useEffect, useState } from "react";
import { useProjectDispatch } from "types/hooks";
import { useAuthentication } from "providers/authentication";
import { defaultProject } from "types/Project/ProjectTypes";
import { SET_PROJECT } from "providers/store";

/** Try to load the current project from the database on mount */
export function useProjectLoader() {
  const { uid, isAdmin } = useAuthentication();
  const dispatch = useProjectDispatch();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!uid) return;
    const req = indexedDB.open(getUserDatabaseName(uid));
    req.onsuccess = async () => {
      // Get the current project ID
      const id = getCurrentProjectId();
      const project = await getProjectFromDB(uid, id);

      // If there is no current project, create one
      if (!id || !project) {
        await uploadProjectToDB(uid, defaultProject);
        setLoaded(true);
        return;
      }

      // If the project loads, set the state
      dispatch({ type: SET_PROJECT, payload: project });

      setLoaded(true);
    };
  }, [isAdmin, uid]);

  return loaded;
}
