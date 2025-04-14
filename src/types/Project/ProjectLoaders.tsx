import { selectProjectId } from "../Meta/MetaSelectors";
import { isProject, Project } from "./ProjectTypes";
import { sanitizeProject } from "./ProjectTypes";
import { dispatchCustomEvent } from "utils/event";
import { UPDATE_PROJECT_EVENT } from "utils/constants";
import {
  getProject,
  setCurrentProjectId,
  uploadProject,
  updateProject,
} from "app/projects";
import { initializeProjectMetadata } from "types/Meta/MetaTypes";
import { setProject } from "app/store";
import { getEventFiles } from "utils/event";
import { promptUserForFile } from "lib/prompts/html";
import { BaseProject } from "app/reducer";

/** Try to load the project by ID from the database. */
export const loadProject = async (id: string, callback?: () => void) => {
  const project = await getProject(id);
  if (!isProject(project)) throw new Error("Invalid project");
  setCurrentProjectId(id);
  setProject(project);
  callback?.();
  return true;
};

/** Try to load the demo project from the given path. */
export const loadDemoProject = async (
  base: Project | BaseProject,
  callback?: () => void
) => {
  const project = sanitizeProject("present" in base ? base : { present: base });
  project.present.meta.id = initializeProjectMetadata().id;
  await uploadProject(project);
  setProject(project);
  callback?.();
};

/** Open the user's file system and read local projects. */
export const promptUserForProjects = () => {
  promptUserForFile("*", (e) => {
    const files = getEventFiles(e);
    for (const file of files) loadProjectByFile(file);
  });
};

/** Try to upload a new project or update the current project by file. */
export const loadProjectByFile = (file: File) => {
  const reader = new FileReader();
  reader.onload = async (e) => {
    if (!e.target?.result) return window.location.reload();

    // Parse the project from the file
    const present = JSON.parse(e.target.result as string);
    const project = sanitizeProject({ present });

    // Try to get the existing project
    const id = selectProjectId(project);

    // Upload or save the project depending on whether it already exists
    const hasProject = !!(await getProject(id));
    if (hasProject) {
      await updateProject(project);
      setCurrentProjectId(id);
    } else {
      await uploadProject(project);
    }
    dispatchCustomEvent(UPDATE_PROJECT_EVENT);
  };
  reader.readAsText(file);
};
