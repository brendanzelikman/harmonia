import { dispatchCustomEvent } from "utils/html";
import { selectMeta } from "../Meta/MetaSelectors";
import {
  isProjectEmpty,
  sanitizeProject,
  timestampProject,
} from "./ProjectFunctions";
import { Project, initializeProject, defaultProject } from "./ProjectTypes";
import {
  uploadProjectToDB,
  setCurrentProjectId,
  updateProjectInDB,
  deleteProjectFromDB,
  getProjectsFromDB,
} from "providers/projects";
import { UPDATE_PROJECT_EVENT } from "utils/constants";
import { setProject, store } from "providers/store";

/** Try to create a new project, using the given template if specified. */
export const createProject = async (template?: Project) => {
  const project = initializeProject(template);
  const meta = selectMeta(project);
  const id = meta.id;
  try {
    await uploadProjectToDB(project);
    await setCurrentProjectId(id);
  } catch (e) {
    console.log(e);
  } finally {
    dispatchCustomEvent(UPDATE_PROJECT_EVENT, id);
  }
};

/** Save a sanitized copy of the given project to the database.. */
export const saveProject = (project?: Project) => {
  // Sanitize the project
  const sanitizedProject = sanitizeProject(project);
  const updatedProject = timestampProject(sanitizedProject);

  // Update the project in the database.
  updateProjectInDB(updatedProject);
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

/** Try to delete the project from the database. */
export const deleteProject = (id: string) => async () => {
  try {
    deleteProjectFromDB(id);
  } catch (e) {
    console.error(e);
  } finally {
    dispatchCustomEvent(UPDATE_PROJECT_EVENT, id);
  }
};

/** Get the number of empty projects. */
export const countEmptyProjects = async () => {
  try {
    const projects = await getProjectsFromDB();
    return projects.filter(isProjectEmpty).length;
  } catch (e) {
    console.error(e);
  }
  return 0;
};

/** Delete all empty projects. */
export const deleteEmptyProjects = async () => {
  try {
    const projects = await getProjectsFromDB();
    const emptyProjects = projects.filter(isProjectEmpty);
    emptyProjects.forEach((project) => {
      const meta = selectMeta(project);
      deleteProjectFromDB(meta.id);
    });
  } catch (e) {
    console.error(e);
  } finally {
    dispatchCustomEvent(UPDATE_PROJECT_EVENT, "all");
  }
};

/** Delete all projects */
export const deleteAllProjects = async () => {
  try {
    const projects = await getProjectsFromDB();
    projects.forEach((project) => {
      const meta = selectMeta(project);
      deleteProjectFromDB(meta.id);
    });
  } catch (e) {
    console.error(e);
  } finally {
    dispatchCustomEvent(UPDATE_PROJECT_EVENT, "all");
  }
};
