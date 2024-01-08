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
  const { user } = useAuthentication();
  const dispatch = useProjectDispatch();
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const req = indexedDB.open(getUserDatabaseName(user.uid));
    req.onsuccess = async () => {
      // Get the current project ID
      const id = await getCurrentProjectId(user.uid);

      // If there is no current project, create one
      if (!id) {
        await uploadProjectToDB(user.uid, defaultProject);
        setLoaded(true);
        return;
      }

      // Otherwise, try to load the project
      const project = await getProjectFromDB(user.uid, id);
      if (!isProject(project)) {
        navigate("/");
        return;
      }

      // If the project loads, set the state
      dispatch({ type: "setProject", payload: project });

      setLoaded(true);
    };
  }, []);

  return loaded;
}
