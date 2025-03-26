import { useCallback, useEffect, useState } from "react";
import { useProjectDispatch } from "types/hooks";
import { defaultProject } from "types/Project/ProjectTypes";
import { SET_PROJECT } from "providers/store";
import { useCustomEventListener } from "hooks/useCustomEventListener";
import { UPDATE_PROJECTS } from "types/Project/ProjectThunks";
import { getDatabaseName } from "providers/idb/database";
import {
  getCurrentProjectId,
  getProjectFromDB,
  uploadProjectToDB,
} from "providers/idb/projects";

/** Try to load the current project from the database on mount */
export function usePlaygroundProject() {
  const dispatch = useProjectDispatch();
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
      dispatch({ type: SET_PROJECT, payload: project });
      setLoaded(true);
    };
    updateProject();
  }, []);

  useEffect(() => {
    const req = indexedDB.open(getDatabaseName());
    req.onsuccess = updatePlayground;
  }, []);

  useCustomEventListener(UPDATE_PROJECTS, updatePlayground);
  return loaded;
}
