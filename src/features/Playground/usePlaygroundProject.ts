import { defaultProject } from "types/Project/ProjectTypes";
import { UPDATE_PROJECT_EVENT } from "utils/constants";
import { getCurrentProjectId, getProject, uploadProject } from "app/projects";
import { useFetch } from "hooks/useFetch";
import { useEvent } from "hooks/useEvent";

/** Try to load the current project from the database on mount */
export function usePlaygroundProject() {
  const { data, loading, fetchData } = useFetch(async () => {
    const id = getCurrentProjectId();
    if (id) return await getProject(id);
    await uploadProject(defaultProject);
  });
  useEvent(UPDATE_PROJECT_EVENT, fetchData);

  return !loading && !!data;
}
