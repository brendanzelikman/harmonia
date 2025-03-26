import { dispatchCustomEvent } from "utils/html";
import { selectMeta } from "../Meta/MetaSelectors";
import {
  isProjectEmpty,
  sanitizeProject,
  timestampProject,
} from "./ProjectFunctions";
import {
  Project,
  initializeProject,
  Thunk,
  defaultProject,
} from "./ProjectTypes";
import {
  uploadProjectToDB,
  setCurrentProjectId,
  updateProjectInDB,
  deleteProjectFromDB,
  getProjectsFromDB,
} from "providers/idb/projects";

export const UPDATE_PROJECTS = "updateProjects";

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
    dispatchCustomEvent(UPDATE_PROJECTS, id);
  }
};

/** Save a sanitized copy of the given project to the database.. */
export const saveProject =
  (project?: Project): Thunk =>
  async (dispatch, getProject) => {
    // Sanitize the project
    const sanitizedProject = sanitizeProject(project || getProject());
    const updatedProject = timestampProject(sanitizedProject);

    // Update the project in the database.
    updateProjectInDB(updatedProject);
  };

/** Reset the project's state to the default. */
export const clearProject = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const meta = selectMeta(project);
  dispatch({
    type: "setProject",
    payload: sanitizeProject({
      ...defaultProject,
      present: { ...defaultProject.present, meta },
      _latestUnfiltered: project._latestUnfiltered,
    }),
  });
};

/** Try to delete the project from the database. */
export const deleteProject = (id: string) => async () => {
  try {
    deleteProjectFromDB(id);
  } catch (e) {
    console.error(e);
  } finally {
    dispatchCustomEvent(UPDATE_PROJECTS, id);
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
    dispatchCustomEvent(UPDATE_PROJECTS, "all");
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
    dispatchCustomEvent(UPDATE_PROJECTS, "all");
  }
};
