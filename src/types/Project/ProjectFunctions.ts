import { dispatchCustomEvent } from "utils/event";
import { selectMeta } from "../Meta/MetaSelectors";
import { isProjectEmpty } from "./ProjectUtils";
import { Project, initializeProject, defaultProject } from "./ProjectTypes";
import { uploadProject, deleteProject, getProjects } from "app/projects";
import { UPDATE_PROJECT_EVENT } from "utils/constants";
import { store } from "app/store";
import { setProject } from "app/reducer";

/** Try to create a new project, using the given template if specified. */
export const createProject = async (template?: Project) => {
  const project = initializeProject(template);
  await uploadProject(project);
};

/** Reset the project's state to the default. */
export const clearProject = () => {
  const project = store.getState();
  const emptyProject = {
    ...project,
    past: [...project.past, project.present],
    present: { ...defaultProject.present, meta: project.present.meta },
    future: [],
    group: null,
  };
  emptyProject._latestUnfiltered = emptyProject.present;
  setProject(emptyProject);
};

/** Get the number of empty projects. */
export const countEmptyProjects = async () => {
  try {
    const projects = await getProjects();
    return projects.filter(isProjectEmpty).length;
  } catch (e) {
    console.error(e);
  }
  return 0;
};

/** Delete all empty projects. */
export const deleteEmptyProjects = async () => {
  try {
    const projects = await getProjects();
    const emptyProjects = projects.filter(isProjectEmpty);
    emptyProjects.forEach((project) => {
      const meta = selectMeta(project);
      deleteProject(meta.id);
    });
  } catch (e) {
    console.error(e);
  } finally {
    dispatchCustomEvent(UPDATE_PROJECT_EVENT);
  }
};

/** Delete all projects */
export const deleteAllProjects = async () => {
  try {
    const projects = await getProjects();
    projects.forEach((project) => {
      const meta = selectMeta(project);
      deleteProject(meta.id);
    });
  } catch (e) {
    console.error(e);
  } finally {
    dispatchCustomEvent(UPDATE_PROJECT_EVENT);
  }
};
