import { selectClipIds } from "types/Clip/ClipSelectors";
import { exportClipsToMidi } from "types/Clip/ClipThunks";
import { Project, Thunk } from "./ProjectTypes";
import { selectProjectName } from "./MetadataSelectors";
import { sanitizeProject } from "./ProjectFunctions";
import { getProjectsFromDB } from "providers/idb";
import { getAuthenticationStatus } from "providers/authentication";
import JSZip from "jszip";

/** Export the project to a Harmonia file, using the given state if specified. */
export const exportProjectToHAM =
  (project?: Project): Thunk =>
  (dispatch, getProject) => {
    // Serialize the project
    const sanitizedProject = sanitizeProject(project || getProject());
    const projectJSON = JSON.stringify(sanitizedProject);

    // Create a blob and download it
    const blob = new Blob([projectJSON], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const name = selectProjectName(sanitizedProject);
    link.download = `${name ?? "project"}.ham`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

/** Export the project to a MIDI file based on its clips, using the given project if specified. */
export const exportProjectToMIDI =
  (project?: Project): Thunk =>
  (dispatch, getProject) => {
    const savedProject = project || getProject();
    const clipIds = selectClipIds(savedProject);
    dispatch(exportClipsToMidi(clipIds));
  };

/** Export all projects to Harmonia files and download them as a zip. */
export const exportProjectsToZIP = async () => {
  const { uid } = await getAuthenticationStatus();
  if (!uid) return;
  try {
    // Convert the projects to blobs
    const projects = (await getProjectsFromDB(uid)).map(sanitizeProject);
    const jsons = projects.map((project) => JSON.stringify(project));
    const blobs = jsons.map((_) => new Blob([_], { type: "application/json" }));

    // Add each blob to a new zip
    const zip = new JSZip();
    blobs.forEach((blob, i) => {
      const projectName = selectProjectName(projects[i]);
      const fileName = `${projectName ?? "project"}.ham`;
      zip.file(fileName, blob);
    });

    // Finalize the archive
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const link = document.createElement("a");

    // Download the zip
    link.download = "harmonia_projects.zip";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error(e);
  }
};
