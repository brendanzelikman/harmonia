import {
  getCurrentProjectId,
  getProject,
  getProjects,
  uploadProject,
} from "app/projects";
import { setProject } from "app/store";
import { useFetch } from "hooks/useFetch";
import { defaultProject } from "types/Project/ProjectTypes";
import { UPDATE_PROJECT_EVENT } from "utils/constants";

/** Load the current project or upload a new one */
export function useProject() {
  const { loaded } = useFetch(async () => {
    // Try to get the current project
    const id = getCurrentProjectId();
    const project = await getProject(id);

    // If the project is found, update the store and return it
    if (id && project) {
      setProject(project);
      return getProject(id);
    }

    // If the project is not found, upload a new project if there are no more projects
    const projects = await getProjects();
    if (!projects.length) await uploadProject(defaultProject);
  }, UPDATE_PROJECT_EVENT);

  // Return the load state
  return loaded;
}
