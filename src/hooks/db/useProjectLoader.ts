import {
  getCurrentProjectId,
  getProjectFromDB,
  getUserDatabaseName,
  uploadProjectToDB,
} from "indexedDB";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjectDispatch } from "redux/hooks";
import { defaultProject, isProject } from "types/Project";
import { useAuthentication } from "providers/authentication";

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
      const id = await getCurrentProjectId(uid);
      const project = await getProjectFromDB(uid, id);

      // If there is no current project, create one
      if (!id || !project) {
        await uploadProjectToDB(uid, defaultProject);
        setLoaded(true);
        return;
      }

      // If the project loads, set the state
      dispatch({ type: "setProject", payload: project });

      setLoaded(true);
    };
  }, [isAdmin, uid]);

  return loaded;
}
