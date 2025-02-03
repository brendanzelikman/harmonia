import { useProjectDispatch } from "types/hooks";
import { Hotkey, useHotkeysGlobally } from "lib/react-hotkeys-hook";
import { useNavigate } from "react-router-dom";
import { useAuth } from "providers/auth";
import { hideEditor } from "types/Editor/EditorSlice";
import {
  selectEditorView,
  selectIsEditorOpen,
} from "types/Editor/EditorSelectors";
import {
  selectSelectedClips,
  selectSelectedScaleTrack,
} from "types/Timeline/TimelineSelectors";
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
import { createNewTracks } from "types/Track/TrackUtils";
import { showEditor } from "types/Editor/EditorThunks";

export function usePlaygroundHotkeys() {
  const dispatch = useProjectDispatch();

  // Project Hotkeys
  useHotkeysGlobally(dispatch(VIEW_PROJECTS_HOTKEY));
  useHotkeysGlobally(dispatch(NEW_PROJECT_HOTKEY));
  useHotkeysGlobally(dispatch(OPEN_PROJECT_HOTKEY));
  useHotkeysGlobally(dispatch(SAVE_PROJECT_HOTKEY));
  useHotkeysGlobally(dispatch(UNDO_PROJECT_HOTKEY));
  useHotkeysGlobally(dispatch(REDO_PROJECT_HOTKEY));

  // Diary Hotkeys
  useHotkeysGlobally(dispatch(TOGGLE_DIARY_HOTKEY));
  useHotkeysGlobally(dispatch(CLOSE_MODALS_HOTKEY));

  // Editor Hotkeys
  useHotkeysGlobally(dispatch(TOGGLE_EDITOR_HOTKEY));
  useHotkeysGlobally(dispatch(CLOSE_EDITOR_HOTKEY));

  // Shortcut Hotkeys
  useHotkeysGlobally(dispatch(TOGGLE_SHORTCUTS_HOTKEY));
  useHotkeysGlobally(dispatch(CLOSE_SHORTCUTS_HOTKEY));

  // Transport Hotkeys
  useHotkeysGlobally(dispatch(TOGGLE_TRANSPORT_HOTKEY));
  useHotkeysGlobally(dispatch(STOP_TRANSPORT_HOTKEY));
  useHotkeysGlobally(dispatch(RECORD_TRANSPORT_HOTKEY));
  useHotkeysGlobally(dispatch(LOOP_TRANSPORT_HOTKEY));
  useHotkeysGlobally(dispatch(MUTE_TRANSPORT_HOTKEY));
  useHotkeysGlobally(dispatch(EXPORT_MIDI_HOTKEY));
  useHotkeysGlobally(dispatch(EXPORT_AUDIO_HOTKEY));

  // Generative Hotkeys
  useHotkeysGlobally(dispatch(GENERATE_TRACKS_HOTKEY));
}

// -----------------------------------------------
// Project Hotkeys
// -----------------------------------------------

export const VIEW_PROJECTS_HOTKEY: Thunk<Hotkey> = () => {
  const navigate = useNavigate();
  const { isAtLeastRank } = useAuth();
  return {
    name: "View Projects",
    description: "View the list of projects.",
    shortcut: "meta+shift+p",
    callback: () => {
      navigate(isAtLeastRank("maestro") ? "/projects" : "/demos");
    },
  };
};

export const NEW_PROJECT_HOTKEY: Thunk<Hotkey> = () => ({
  name: "Create New Project",
  description: "Create a new project from scratch.",
  shortcut: "meta+alt+n",
  callback: () => createProject(),
});

export const OPEN_PROJECT_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Open Project",
  description: "Open a project from a HAM file.",
  shortcut: "meta+o",
  callback: () => dispatch(readLocalProjects()),
});

export const SAVE_PROJECT_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Save Project",
  description: "Save the current project as a HAM file.",
  shortcut: "meta+s",
  callback: () => dispatch(exportProjectToHAM()),
});

export const UNDO_PROJECT_HOTKEY: Thunk<Hotkey> = (dispatch, getProject) => ({
  name: "Undo Arrangement",
  description: "Undo the last change to the project.",
  shortcut: "meta+z",
  callback: () =>
    selectCanUndoProject(getProject()) && dispatch({ type: UNDO_PROJECT }),
});

export const REDO_PROJECT_HOTKEY: Thunk<Hotkey> = (dispatch, getProject) => ({
  name: "Redo Arrangement",
  description: "Redo the last change to the project.",
  shortcut: "meta+shift+z",
  callback: () =>
    selectCanRedoProject(getProject()) && dispatch({ type: REDO_PROJECT }),
});

// -----------------------------------------------
// Editor Hotkeys
// -----------------------------------------------

export const TOGGLE_EDITOR_HOTKEY: Thunk<Hotkey> = (dispatch, getProject) => ({
  name: "Toggle Editor",
  description: "Toggle the editor if a valid motif is selected.",
  shortcut: "meta+e",
  callback: () => {
    const project = getProject();
    const isOpen = selectIsEditorOpen(project);
    if (isOpen) {
      return dispatch(hideEditor());
    }
    const track = selectSelectedScaleTrack(project);
    const clip = selectSelectedClips(project)[0];
    const type = clip ? clip.type : track ? track.type : undefined;
    dispatch(
      showEditor({ data: { view: type, trackId: track?.id, clipId: clip?.id } })
    );
  },
});

export const CLOSE_EDITOR_HOTKEY: Thunk<Hotkey> = (dispatch, getProject) => ({
  name: "Close Editor",
  description: "Close the editor if it is open.",
  shortcut: "esc",
  callback: () => {
    const project = getProject();
    const isVisible = selectEditorView(project);
    if (isVisible) {
      dispatch(hideEditor());
    }
  },
});

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
  name: "Close Terminal/Diary",
  description: "Close the project terminal and diary.",
  shortcut: "esc",
  callback: () => {
    dispatchCustomEvent(CLOSE_STATE("diary"));
    dispatchCustomEvent(CLOSE_STATE("terminal"));
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

export const CLOSE_SHORTCUTS_HOTKEY: Thunk<Hotkey> = () => ({
  name: "Close Shortcuts",
  description: "Close the shortcuts menu.",
  shortcut: "esc",
  callback: () => dispatchCustomEvent(CLOSE_STATE("shortcuts")),
});

// -----------------------------------------------
// Transport Hotkeys
// -----------------------------------------------

export const TOGGLE_TRANSPORT_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Play/Pause Transport",
  description: `Start or pause the transport playback`,
  shortcut: "space",
  callback: () => dispatch(toggleTransport()),
});

export const STOP_TRANSPORT_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Stop Transport",
  description: "Stop the transport playback.",
  shortcut: "enter",
  callback: () => dispatch(stopTransport()),
});

export const RECORD_TRANSPORT_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Record Transport",
  description: "Toggle whether the transport is recording.",
  shortcut: "alt+shift+r",
  callback: () => dispatch(toggleTransportRecording()),
});

export const LOOP_TRANSPORT_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Loop Transport",
  description: "Toggle whether the transport is looping.",
  shortcut: "alt+shift+l",
  callback: () => dispatch(toggleTransportLoop()),
});

export const MUTE_TRANSPORT_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Mute Transport",
  description: "Toggle whether the transport is muted.",
  shortcut: "alt+shift+m",
  callback: () => dispatch(toggleTransportMute()),
});

export const EXPORT_MIDI_HOTKEY: Thunk<Hotkey> = (dispatch) => {
  return {
    name: "Export to MIDI",
    description: "Export the timeline to a MIDI file",
    shortcut: "meta+shift+m",
    callback: () => dispatch(exportProjectToMIDI()),
  };
};

export const EXPORT_AUDIO_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Export to WAV",
  description: "Export the timeline to a WAV file",
  shortcut: "meta+shift+w",
  callback: () => dispatch(downloadTransport()),
});

export const GENERATE_TRACKS_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Create Nested Tracks",
  description: "Create a chain of nested tracks based on the given input",
  shortcut: "g",
  callback: () => dispatch(createNewTracks),
});

export const PLAYGROUND_HOTKEYS: Thunk<Hotkey[]> = (dispatch) => [
  dispatch(SAVE_PROJECT_HOTKEY),
  dispatch(OPEN_PROJECT_HOTKEY),
  dispatch(NEW_PROJECT_HOTKEY),
  dispatch(VIEW_PROJECTS_HOTKEY),
  dispatch(UNDO_PROJECT_HOTKEY),
  dispatch(REDO_PROJECT_HOTKEY),
  dispatch(TOGGLE_DIARY_HOTKEY),
  dispatch(TOGGLE_SHORTCUTS_HOTKEY),
  dispatch(EXPORT_MIDI_HOTKEY),
  dispatch(EXPORT_AUDIO_HOTKEY),
];

export const TRANSPORT_HOTKEYS: Thunk<Hotkey[]> = (dispatch) => [
  dispatch(TOGGLE_TRANSPORT_HOTKEY),
  dispatch(STOP_TRANSPORT_HOTKEY),
  dispatch(MUTE_TRANSPORT_HOTKEY),
  dispatch(RECORD_TRANSPORT_HOTKEY),
  dispatch(LOOP_TRANSPORT_HOTKEY),
];
