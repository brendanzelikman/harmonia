import { getCurrentProjectId, getProject, uploadProject } from "app/projects";
import { setProject } from "app/reducer";
import { useFetch } from "hooks/useFetch";
import { defaultProject } from "types/Project/ProjectTypes";
import { UPDATE_PROJECT_EVENT } from "utils/constants";

/** Try to load the current project from the database on mount */
export function usePlaygroundProject() {
  const { loaded } = useFetch(async () => {
    const id = getCurrentProjectId();
    const project = await getProject(id);
    if (id && project) {
      setProject(project);
      return getProject(id);
    }
    await uploadProject(defaultProject);
  }, UPDATE_PROJECT_EVENT);

  return loaded;
}
