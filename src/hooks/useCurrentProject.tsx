import {
  DATABASE_NAME,
  getCurrentProjectId,
  getProjectFromDB,
  uploadProjectToDB,
} from "indexedDB";
import { useEffect, useState } from "react";
import { useAppDispatch } from "redux/hooks";
import { defaultProject } from "types/Project";

export function useCurrentProject() {
  const dispatch = useAppDispatch();
  const [loaded, setLoaded] = useState(false);

  // Try to load the current project from the database on mount
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
      if (!project) return;

      // If the project loads, set the state
      dispatch({ type: "setState", payload: project });
      setLoaded(true);
    };
  }, []);

  return loaded;
}
