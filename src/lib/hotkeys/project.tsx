import { redoProject, undoProject } from "app/reducer";
import { Hotkey } from ".";
import {
  exportProjectToJSON,
  exportProjectToMIDI,
} from "types/Project/ProjectExporters";
import { readLocalProjects } from "types/Project/ProjectLoaders";
import { createProject } from "types/Project/ProjectFunctions";
import { downloadTransport } from "types/Transport/TransportThunks";

// ------------------------------------------------
// Project Hotkeys
// ------------------------------------------------

export const CreateProjectHotkey: Hotkey = {
  name: "Create New Project",
  description: "Create a new project from scratch.",
  shortcut: "alt+meta+shift+˜",
  callback: () => createProject(),
};

export const OpenProjectHotkey: Hotkey = {
  name: "Open Project from File",
  description: "Open a project from a JSON file.",
  shortcut: "meta+o",
  callback: () => readLocalProjects(),
};

export const SaveJsonHotkey: Hotkey = {
  name: "Save Project to File",
  description: "Save the current project as a JSON file.",
  shortcut: "meta+s",
  callback: (dispatch) => dispatch(exportProjectToJSON()),
};

export const SaveMidiHotkey: Hotkey = {
  name: "Export Project to MIDI",
  description: "Export the timeline to a MIDI file",
  shortcut: "meta+shift+m",
  callback: (dispatch) => dispatch(exportProjectToMIDI()),
};

export const SaveWavHotkey: Hotkey = {
  name: "Export Project to WAV",
  description: "Export the timeline to a WAV file",
  shortcut: "meta+shift+l",
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
