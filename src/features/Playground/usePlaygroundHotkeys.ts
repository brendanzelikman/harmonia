import { Hotkey, useDispatchedHotkey } from "lib/hotkeys";
import { selectCanRedo, selectCanUndo } from "types/Project/ProjectSelectors";
import { createProject } from "types/Project/ProjectThunks";
import { readLocalProjects } from "types/Project/ProjectLoaders";
import {
  downloadTransport,
  startRecordingTransport,
  stopRecordingTransport,
  stopTransport,
  toggleTransport,
} from "types/Transport/TransportThunks";
import {
  exportProjectToJSON,
  exportProjectToMIDI,
} from "types/Project/ProjectExporters";
import { Thunk } from "types/Project/ProjectTypes";
import { dispatchClose, dispatchToggle, getToggleValue } from "hooks/useToggle";
import { noop } from "lodash";
import { setLoop, setMute } from "types/Transport/TransportSlice";
import { RECORD_TRANSPORT } from "types/Transport/TransportTypes";
import { REDO_PROJECT, UNDO_PROJECT } from "app/reducer";

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
  description: "Open a project from a JSON file.",
  shortcut: "meta+o",
  callback: () => readLocalProjects(),
});

export const SAVE_PROJECT_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Save Project to File",
  description: "Save the current project as a JSON file.",
  shortcut: "meta+s",
  callback: () => dispatch(exportProjectToJSON()),
});

export const UNDO_PROJECT_HOTKEY: Thunk<Hotkey> = (dispatch, getProject) => ({
  name: "Undo Last Change",
  description: "Undo the last change to the project.",
  shortcut: "meta+z",
  callback: () =>
    selectCanUndo(getProject()) && dispatch({ type: UNDO_PROJECT }),
});

export const REDO_PROJECT_HOTKEY: Thunk<Hotkey> = (dispatch, getProject) => ({
  name: "Redo Last Change",
  description: "Redo the last change to the project.",
  shortcut: "meta+shift+z",
  callback: () =>
    selectCanRedo(getProject()) && dispatch({ type: REDO_PROJECT }),
});

// -----------------------------------------------
// Diary Hotkeys
// -----------------------------------------------

export const TOGGLE_DIARY_HOTKEY: Thunk<Hotkey> = () => ({
  name: "Toggle Diary",
  description: "Toggle the project diary.",
  shortcut: "shift+d",
  callback: () => dispatchToggle("diary"),
});

export const TOGGLE_TERMINAL_HOTKEY: Thunk<Hotkey> = () => ({
  name: "Toggle Diary",
  description: "Toggle the project diary.",
  shortcut: "shift+d",
  callback: () => dispatchToggle("diary"),
});

export const CLOSE_MODALS_HOTKEY: Thunk<Hotkey> = () => ({
  name: "Close Modals",
  description: "Close the project terminal, editor, and diary.",
  shortcut: "esc",
  callback: () => {
    dispatchClose("diary");
    dispatchClose("terminal");
    dispatchClose("shortcuts");
  },
});

// -----------------------------------------------
// Shortcut Hotkeys
// -----------------------------------------------

export const TOGGLE_SHORTCUTS_HOTKEY: Thunk<Hotkey> = () => ({
  name: "Toggle Shortcuts",
  description: "Toggle the shortcuts menu.",
  shortcut: "\\",
  callback: () => dispatchToggle("shortcuts"),
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
  callback: () => {
    !!getToggleValue(RECORD_TRANSPORT)
      ? stopRecordingTransport()
      : startRecordingTransport();
  },
});

export const LOOP_TRANSPORT_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Loop Playback",
  description: "Toggle whether the transport is looping.",
  shortcut: "shift+l",
  callback: () => dispatch(setLoop()),
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
  callback: () => dispatch(setMute()),
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
