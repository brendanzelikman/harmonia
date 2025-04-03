import { Hotkey, useDispatchedHotkey } from "lib/react-hotkeys-hook";
import {
  selectCanRedoProject,
  selectCanUndoProject,
} from "types/Project/ProjectSelectors";
import { createProject } from "types/Project/ProjectThunks";
import { readLocalProjects } from "types/Project/ProjectLoaders";
import { REDO_PROJECT, UNDO_PROJECT } from "providers/store";
import {
  downloadTransport,
  stopTransport,
  toggleTransport,
  toggleTransportLoop,
  toggleTransportMute,
  toggleTransportRecording,
} from "types/Transport/TransportThunks";
import {
  exportProjectToHAM,
  exportProjectToMIDI,
} from "types/Project/ProjectExporters";
import { Thunk } from "types/Project/ProjectTypes";
import { dispatchCustomEvent } from "utils/html";
import { CLOSE_STATE, TOGGLE_STATE } from "hooks/useToggledState";
import { noop } from "lodash";

export function usePlaygroundHotkeys() {
  // Project Hotkeys
  useDispatchedHotkey(NEW_PROJECT_HOTKEY);
  useDispatchedHotkey(OPEN_PROJECT_HOTKEY);
  useDispatchedHotkey(SAVE_PROJECT_HOTKEY);
  useDispatchedHotkey(UNDO_PROJECT_HOTKEY);
  useDispatchedHotkey(REDO_PROJECT_HOTKEY);

  // Modal Hotkeys
  useDispatchedHotkey(TOGGLE_DIARY_HOTKEY);
  useDispatchedHotkey(CLOSE_MODALS_HOTKEY);

  // Shortcut Hotkeys
  useDispatchedHotkey(TOGGLE_SHORTCUTS_HOTKEY);

  // Transport Hotkeys
  useDispatchedHotkey(TOGGLE_TRANSPORT_HOTKEY);
  useDispatchedHotkey(STOP_TRANSPORT_HOTKEY);
  useDispatchedHotkey(RECORD_TRANSPORT_HOTKEY);
  useDispatchedHotkey(LOOP_TRANSPORT_HOTKEY);
  useDispatchedHotkey(MUTE_TRANSPORT_HOTKEY);
  useDispatchedHotkey(EXPORT_MIDI_HOTKEY);
  useDispatchedHotkey(EXPORT_AUDIO_HOTKEY);
}

// -----------------------------------------------
// Project Hotkeys
// -----------------------------------------------

export const NEW_PROJECT_HOTKEY: Thunk<Hotkey> = () => ({
  name: "Create New Project",
  description: "Create a new project from scratch.",
  shortcut: "meta+alt+n",
  callback: () => createProject(),
});

export const OPEN_PROJECT_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Open Project from File",
  description: "Open a project from a HAM file.",
  shortcut: "meta+o",
  callback: () => dispatch(readLocalProjects()),
});

export const SAVE_PROJECT_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Save Project to File",
  description: "Save the current project as a HAM file.",
  shortcut: "meta+s",
  callback: () => dispatch(exportProjectToHAM()),
});

export const UNDO_PROJECT_HOTKEY: Thunk<Hotkey> = (dispatch, getProject) => ({
  name: "Undo Last Change",
  description: "Undo the last change to the project.",
  shortcut: "meta+z",
  callback: () =>
    selectCanUndoProject(getProject()) && dispatch({ type: UNDO_PROJECT }),
});

export const REDO_PROJECT_HOTKEY: Thunk<Hotkey> = (dispatch, getProject) => ({
  name: "Redo Last Change",
  description: "Redo the last change to the project.",
  shortcut: "meta+shift+z",
  callback: () =>
    selectCanRedoProject(getProject()) && dispatch({ type: REDO_PROJECT }),
});

// -----------------------------------------------
// Editor Hotkeys
// -----------------------------------------------

// -----------------------------------------------
// Diary Hotkeys
// -----------------------------------------------

export const TOGGLE_DIARY_HOTKEY: Thunk<Hotkey> = () => ({
  name: "Toggle Diary",
  description: "Toggle the project diary.",
  shortcut: "shift+d",
  callback: () => dispatchCustomEvent(TOGGLE_STATE("diary")),
});

export const CLOSE_MODALS_HOTKEY: Thunk<Hotkey> = () => ({
  name: "Close Modals",
  description: "Close the project terminal, editor, and diary.",
  shortcut: "esc",
  callback: () => {
    dispatchCustomEvent(CLOSE_STATE("diary"));
    dispatchCustomEvent(CLOSE_STATE("terminal"));
    dispatchCustomEvent(CLOSE_STATE("shortcuts"));
  },
});

// -----------------------------------------------
// Shortcut Hotkeys
// -----------------------------------------------

export const TOGGLE_SHORTCUTS_HOTKEY: Thunk<Hotkey> = () => ({
  name: "Toggle Shortcuts",
  description: "Toggle the shortcuts menu.",
  shortcut: "shift + slash",
  callback: () => dispatchCustomEvent(TOGGLE_STATE("shortcuts")),
});

// -----------------------------------------------
// Transport Hotkeys
// -----------------------------------------------

export const TOGGLE_TRANSPORT_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Toggle Playback",
  description: `Start or pause the transport playback`,
  shortcut: "space",
  callback: () => dispatch(toggleTransport()),
});

export const STOP_TRANSPORT_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Stop Playback",
  description: "Stop the transport playback.",
  shortcut: "enter",
  callback: () => stopTransport(),
});

export const RECORD_TRANSPORT_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Record Playback",
  description: "Toggle whether the transport is recording.",
  shortcut: "shift+r",
  callback: () => dispatch(toggleTransportRecording()),
});

export const LOOP_TRANSPORT_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Loop Playback",
  description: "Toggle whether the transport is looping.",
  shortcut: "shift+l",
  callback: () => dispatch(toggleTransportLoop()),
});

export const DEBUG_TRANSPORT_HOTKEY: Thunk<Hotkey> = () => ({
  name: "Debug Transport",
  description: "Troubleshoot sound issues.",
  shortcut: "Refresh",
  callback: noop,
});

export const MUTE_TRANSPORT_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Mute Playback",
  description: "Toggle whether the transport is muted.",
  shortcut: "shift+m",
  callback: () => dispatch(toggleTransportMute()),
});

export const EXPORT_MIDI_HOTKEY: Thunk<Hotkey> = (dispatch) => {
  return {
    name: "Export Project to MIDI",
    description: "Export the timeline to a MIDI file",
    shortcut: "meta+shift+m",
    callback: () => dispatch(exportProjectToMIDI()),
  };
};

export const EXPORT_AUDIO_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Export Project to WAV",
  description: "Export the timeline to a WAV file",
  shortcut: "meta+shift+w",
  callback: () => dispatch(downloadTransport()),
});
