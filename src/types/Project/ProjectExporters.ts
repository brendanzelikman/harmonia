import { selectPatternClipIds } from "types/Clip/ClipSelectors";
import { exportClipsToMidi } from "types/Clip/ClipThunks";
import { initializeProject, Project, Thunk } from "./ProjectTypes";
import { selectProjectName } from "../Meta/MetaSelectors";
import { sanitizeProject } from "./ProjectUtils";
import JSZip from "jszip";
import { downloadTransport } from "types/Transport/TransportThunks";
import dayjs from "dayjs";
import { getProjects } from "app/projects";

/** Export the project to a JSON file, using the given state if specified. */
export const exportProjectToJSON =
  (project?: Project): Thunk =>
  (dispatch, getProject) => {
    const name = selectProjectName(project ?? getProject());

    // Serialize the project with a new ID
    let sanitizedProject = initializeProject(
      sanitizeProject(project || getProject())
    );
    sanitizedProject.present.meta.name = name;

    const projectJSON = JSON.stringify(sanitizedProject.present);

    // Create a blob and download it
    const blob = new Blob([projectJSON], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `${name ?? "project"}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

/** Export the project to a MIDI file based on its clips, using the given project if specified. */
export const exportProjectToMIDI =
  (project?: Project, download = true): Thunk<Blob> =>
  (dispatch, getProject) => {
    const savedProject = project || getProject();
    const clipIds = selectPatternClipIds(savedProject);
    return dispatch(exportClipsToMidi(clipIds, { download }));
  };

export const exportProjectToWAV =
  (project?: Project, download = true): Thunk<Promise<Blob>> =>
  async (dispatch, getProject) => {
    const savedProject = project || getProject();
    return await dispatch(downloadTransport(savedProject, { download }));
  };

/** Export all projects to files and download them as a zip. */
type FileType = "json" | "midi" | "wav";
export const exportProjectsToZIP =
  (type: FileType = "json"): Thunk =>
  async (dispatch) => {
    const projects = (await getProjects()).map(sanitizeProject);
    const jsons = projects
      .map((project) => JSON.stringify(project.present))
      .map((_) => new Blob([_], { type: "application/json" }));

    const midis = projects.map((project) =>
      dispatch(exportProjectToMIDI(project, false))
    );

    const wavs = projects.map((project) =>
      dispatch(exportProjectToWAV(project, false))
    );

    const blobs =
      type === "json"
        ? jsons
        : type === "midi"
        ? midis
        : await Promise.all(wavs);

    // Keep track of overlapping project names
    const projectNames: Record<string, number> = {};
    const fileType = type === "midi" ? "mid" : type;

    // Add each blob to a new zip
    const zip = new JSZip();
    blobs.forEach((blob, i) => {
      const projectName = selectProjectName(projects[i]) ?? "project";
      projectNames[projectName] = (projectNames[projectName] || 0) + 1;
      let fileName = `${projectName}`;
      if (projectNames[projectName] > 1) {
        fileName = `${projectName} (${projectNames[projectName]})`;
      }
      fileName += `.${fileType}`;
      zip.file(fileName, blob);
    });
    const blobCount = blobs.length;

    // Finalize the archive
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const link = document.createElement("a");

    // Download the zip
    let downloadName = `${blobCount} Harmonia `;
    if (blobCount === 1) downloadName = "Harmonia ";
    downloadName += "Project" + (blobCount === 1 ? "" : "s");
    downloadName += `(${dayjs().format("YYYY-MM-DD HH-mm-ss")}).zip`;
    link.download = downloadName;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };
