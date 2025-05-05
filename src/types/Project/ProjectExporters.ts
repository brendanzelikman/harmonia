import { selectPatternClipIds } from "types/Clip/ClipSelectors";
import { exportClipsToMidi } from "types/Clip/ClipExporters";
import { Project, Thunk } from "./ProjectTypes";
import { selectProjectName } from "../Meta/MetaSelectors";
import { sanitizeProject } from "./ProjectTypes";
import { getProjects } from "app/projects";
import {
  downloadTransport,
  TransportDownloadOptions,
} from "types/Transport/TransportDownloader";
import JSZip from "jszip";
import dayjs from "dayjs";
import { downloadBlob } from "utils/event";

// -------------------------------------------------------------
// Export Project To JSON
// -------------------------------------------------------------

/** Export the project to a JSON file, using the given state if specified. */
export const exportProjectToJSON =
  (project?: Project): Thunk =>
  (_, getProject) => {
    const projectName = selectProjectName(project ?? getProject());

    // Export a new project with the same name
    const source = project || getProject();
    const sanitizedProject = sanitizeProject(source);

    // Create a blob and download it
    const projectData = JSON.stringify(sanitizedProject.present);
    const blob = new Blob([projectData], { type: "application/json" });
    const name = `${projectName ?? "project"}.json`;
    downloadBlob(blob, name);
  };

// -------------------------------------------------------------
// Export Project To MIDI
// -------------------------------------------------------------

/** Export the project to a MIDI file based on its clips, using the given project if specified. */
export const exportProjectToMIDI =
  (project?: Project, download = false): Thunk<Blob> =>
  (dispatch, getProject) => {
    const savedProject = project || getProject();
    const clipIds = selectPatternClipIds(savedProject);
    return dispatch(exportClipsToMidi(clipIds, { download }));
  };

// -------------------------------------------------------------
// Export Project To WAV
// -------------------------------------------------------------

/** Export the project to a WAV file based on its transport, using the given project if specified. */
export const exportProjectToWAV =
  (
    project?: Project,
    options?: Partial<TransportDownloadOptions>
  ): Thunk<Promise<Blob>> =>
  async (dispatch, getProject) => {
    const savedProject = project || getProject();
    return await dispatch(downloadTransport(savedProject, options));
  };

// -------------------------------------------------------------
// Export Projects To ZIP
// -------------------------------------------------------------

/** Export all projects to files and download them as a zip. */
type FileType = "json" | "midi" | "wav";
export const exportProjectsToZIP =
  (type: FileType = "json"): Thunk =>
  async (dispatch) => {
    const projects = (await getProjects()).map(sanitizeProject);
    const bases = projects.map((p) => JSON.stringify(p.present));

    // Generate the blobs for each file type
    const blobs: Blob[] = [];
    if (type === "json") {
      const type = "application/json";
      blobs.push(...bases.map((j) => new Blob([j], { type })));
    } else if (type === "midi") {
      blobs.push(...projects.map((p) => dispatch(exportProjectToMIDI(p))));
    } else if (type === "wav") {
      const promise = projects.map((p) => dispatch(exportProjectToWAV(p)));
      blobs.push(...(await Promise.all(promise)));
    }

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

    // Download the zip
    let filename = `Harmonia `;
    if (blobCount === 1) filename = "Harmonia ";
    filename += "Project" + (blobCount === 1 ? "" : "s");
    filename += ` (${dayjs().format("YYYY-MM-DD hh.mm.ss")}).zip`;
    downloadBlob(content, filename);
  };
