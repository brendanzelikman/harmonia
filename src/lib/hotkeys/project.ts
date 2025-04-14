import { redoProject, undoProject } from "app/store";
import { Hotkey } from ".";
import {
  exportProjectToJSON,
  exportProjectToMIDI,
} from "types/Project/ProjectExporters";
import { promptUserForProjects } from "types/Project/ProjectLoaders";
import { downloadTransport } from "types/Transport/TransportDownloader";
import { uploadProject } from "app/projects";

// ------------------------------------------------
// Project Hotkeys
// ------------------------------------------------

export const CreateProjectHotkey: Hotkey = {
  name: "Create New Project",
  description: "Create a new project from scratch.",
  shortcut: "alt+meta+shift+˜",
  callback: () => uploadProject(),
};

export const OpenProjectHotkey: Hotkey = {
  name: "Open Project from File",
  description: "Open a project from a JSON file.",
  shortcut: "meta+o",
  callback: () => promptUserForProjects(),
};

export const SaveJsonHotkey: Hotkey = {
  name: "Export Project to JSON",
  description: "Save the current project as a JSON file.",
  shortcut: "meta+s",
  callback: (dispatch) => dispatch(exportProjectToJSON()),
};

export const SaveMidiHotkey: Hotkey = {
  name: "Export Project to MIDI",
  description: "Export the timeline to a MIDI file",
  shortcut: "meta+m",
  callback: (dispatch) => dispatch(exportProjectToMIDI(undefined, true)),
};

export const SaveWavHotkey: Hotkey = {
  name: "Export Project to WAV",
  description: "Export the timeline to a WAV file",
  shortcut: "meta+l",
  callback: (dispatch) => dispatch(downloadTransport()),
};

export const UndoProjectHotkey: Hotkey = {
  name: "Undo Last Change",
  description: "Undo the last change to the project.",
  shortcut: "meta+z",
  callback: () => undoProject(),
};

export const RedoProjectHotkey: Hotkey = {
  name: "Redo Last Change",
  description: "Redo the last change to the project.",
  shortcut: "meta+shift+z",
  callback: () => redoProject(),
};

// -----------------------------------------------
// Export Hotkeys
// -----------------------------------------------

export const ProjectHotkeys = [
  CreateProjectHotkey,
  OpenProjectHotkey,
  SaveJsonHotkey,
  SaveMidiHotkey,
  SaveWavHotkey,
  UndoProjectHotkey,
  RedoProjectHotkey,
];
