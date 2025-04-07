import { useCallback, useEffect, useState } from "react";
import { useDispatch } from "types/hooks";
import { defaultProject } from "types/Project/ProjectTypes";
import { setProject } from "providers/store";
import { useCustomEventListener } from "hooks/useCustomEventListener";
import { UPDATE_PROJECT_EVENT } from "utils/constants";
import { getDatabaseName } from "providers/database";
import {
  getCurrentProjectId,
  getProjectFromDB,
  uploadProjectToDB,
} from "providers/projects";

/** Try to load the current project from the database on mount */
export function usePlaygroundProject() {
  const dispatch = useDispatch();
  const [loaded, setLoaded] = useState(false);

  const updatePlayground = useCallback(() => {
    const id = getCurrentProjectId();
    const updateProject = async () => {
      const project = await getProjectFromDB(id);

      // If there is no current project, create one
      if (!id || !project) {
        await uploadProjectToDB(defaultProject);
        setLoaded(true);
        return;
      }

      // If the project loads, set the state
      setProject(project);
      setLoaded(true);
    };
    updateProject();
  }, [dispatch]);

  // Update the playground when the database is loaded
  useEffect(() => {
    const req = indexedDB.open(getDatabaseName());
    req.onsuccess = updatePlayground;
  }, []);

  useCustomEventListener(UPDATE_PROJECT_EVENT, updatePlayground);
  return loaded;
}
