import {
  getProjectFromDB,
  getDatabaseName,
  uploadProjectToDB,
} from "providers/idb";
import { getCurrentProjectId } from "providers/idb";
import { useEffect, useState } from "react";
import { useProjectDispatch } from "types/hooks";
import { useAuth } from "providers/auth";
import { defaultProject } from "types/Project/ProjectTypes";
import { SET_PROJECT } from "providers/store";

/** Try to load the current project from the database on mount */
export function usePlaygroundProject() {
  const { uid } = useAuth();
  const dispatch = useProjectDispatch();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!uid) return;
    const req = indexedDB.open(getDatabaseName(uid));
    req.onsuccess = async () => {
      // Get the current project ID
      const id = getCurrentProjectId();
      const project = await getProjectFromDB(id);

      // If there is no current project, create one
      if (!id || !project) {
        await uploadProjectToDB(defaultProject);
        setLoaded(true);
        return;
      }

      // If the project loads, set the state
      dispatch({ type: SET_PROJECT, payload: project });
      setLoaded(true);
    };
  }, [uid]);

  return loaded;
}
