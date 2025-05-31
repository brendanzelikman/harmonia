import {
  getCurrentProjectId,
  getProject,
  getProjects,
  setCurrentProjectId,
  uploadProject,
} from "app/projects";
import { setProject } from "app/store";
import { useFetch } from "hooks/useFetch";
import { selectProjectId } from "types/Meta/MetaSelectors";
import { UPDATE_PROJECT_EVENT } from "utils/constants";

/** Load the current project or upload a new one */
export function useProjects() {
  const { loaded } = useFetch(async () => {
    const id = getCurrentProjectId();
    const project = await getProject(id);

    // If the project is found, update the store and return it
    if (id && project) {
      setProject(project);
      return getProject(id);
    }

    // If the project is not found, upload a new project if there are no more projects
    const projects = await getProjects();
    if (projects.length) {
      const project = projects[projects.length - 1];
      setCurrentProjectId(selectProjectId(project));
      setProject(project);
      return project;
    } else {
      uploadProject();
    }
  }, UPDATE_PROJECT_EVENT);

  // Return the load state
  return loaded;
}
