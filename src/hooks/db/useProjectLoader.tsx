import {
  DATABASE_NAME,
  getCurrentProjectId,
  getProjectFromDB,
  uploadProjectToDB,
} from "indexedDB";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjectDispatch } from "redux/hooks";
import { defaultProject, isProject } from "types/Project";

/** Try to load the current project from the database on mount */
export function useProjectLoader() {
  const dispatch = useProjectDispatch();
  const [loaded, setLoaded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const req = indexedDB.open(DATABASE_NAME);
    req.onsuccess = async () => {
      // Get the current project ID
      const id = await getCurrentProjectId();

      // If there is no current project, create one
      if (!id) {
        await uploadProjectToDB(defaultProject);
        setLoaded(true);
        return;
      }

      // Otherwise, try to load the project
      const project = await getProjectFromDB(id);
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
