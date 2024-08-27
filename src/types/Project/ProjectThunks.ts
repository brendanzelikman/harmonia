import {
  uploadProjectToDB,
  updateProjectInDB,
  deleteProjectFromDB,
  getProjectsFromDB,
} from "providers/idb";
import { setCurrentProjectId } from "providers/idb";
import { dispatchCustomEvent } from "utils/html";
import { getAuthenticationStatus } from "providers/authentication";
import { selectMetadata } from "../Meta/MetaSelectors";
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

export const CREATE_PROJECT = "createProject";
export const DELETE_PROJECT = "deleteProject";

/** Try to create a new project, using the given template if specified. */
export const createProject = async (template?: Project) => {
  const { uid } = await getAuthenticationStatus();
  if (!uid) return;
  const project = initializeProject(template);
  const meta = selectMetadata(project);
  const id = meta.id;
  try {
    await uploadProjectToDB(uid, project);
    await setCurrentProjectId(uid, id);
  } catch (e) {
    console.log(e);
  } finally {
    dispatchCustomEvent(CREATE_PROJECT, id);
  }
};

/** Save a sanitized copy of the given project to the database.. */
export const saveProject =
  (project?: Project): Thunk =>
  async (dispatch, getProject) => {
    const { uid } = await getAuthenticationStatus();
    if (!uid) return;

    // Sanitize the project
    const sanitizedProject = sanitizeProject(project || getProject());
    const updatedProject = timestampProject(sanitizedProject);

    // Update the project in the database.
    updateProjectInDB(uid, updatedProject);
  };

/** Reset the project's state to the default. */
export const clearProject = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const meta = selectMetadata(project);
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
  const { uid } = await getAuthenticationStatus();
  if (!uid) return;

  try {
    deleteProjectFromDB(uid, id);
  } catch (e) {
    console.error(e);
  } finally {
    dispatchCustomEvent(DELETE_PROJECT, id);
  }
};

/** Delete all empty projects. */
export const deleteEmptyProjects = async () => {
  const { uid } = await getAuthenticationStatus();
  if (!uid) return;

  try {
    const projects = await getProjectsFromDB(uid);
    const emptyProjects = projects.filter(isProjectEmpty);
    emptyProjects.forEach((project) => {
      const meta = selectMetadata(project);
      deleteProjectFromDB(uid, meta.id);
    });
  } catch (e) {
    console.error(e);
  } finally {
    dispatchCustomEvent(DELETE_PROJECT, "all");
  }
};
