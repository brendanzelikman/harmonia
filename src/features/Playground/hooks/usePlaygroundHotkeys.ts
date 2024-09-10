import { useProjectDispatch } from "types/hooks";
import { Hotkey, useHotkeysGlobally } from "lib/react-hotkeys-hook";
import { useNavigate } from "react-router-dom";
import { useAuth } from "providers/auth";
import { toggleEditor, hideEditor } from "types/Editor/EditorSlice";
import { selectEditorView } from "types/Editor/EditorSelectors";
import {
  selectSelectedMotif,
  selectTimelineType,
} from "types/Timeline/TimelineSelectors";
import {
  selectCanRedoProject,
  selectCanUndoProject,
} from "types/Project/ProjectSelectors";
import { createProject } from "types/Project/ProjectThunks";
import { readLocalProjects } from "types/Project/ProjectLoaders";
import { REDO_PROJECT, UNDO_PROJECT } from "providers/store";
import {
  stopTransport,
  toggleTransport,
  toggleTransportLoop,
  toggleTransportMute,
  toggleTransportRecording,
} from "types/Transport/TransportThunks";
import { exportProjectToHAM } from "types/Project/ProjectExporters";
import { Thunk } from "types/Project/ProjectTypes";
import { dispatchCustomEvent } from "utils/html";
import {
  selectFirstPortaledPatternClipId,
  selectFirstPortaledPoseClipId,
} from "types/Arrangement/ArrangementSelectors";

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
  useHotkeysGlobally(dispatch(CLOSE_DIARY_HOTKEY));

  // Editor Hotkeys
  useHotkeysGlobally(dispatch(TOGGLE_EDITOR_HOTKEY));
  useHotkeysGlobally(dispatch(CLOSE_EDITOR_HOTKEY));

  // Transport Hotkeys
  useHotkeysGlobally(dispatch(TOGGLE_TRANSPORT_HOTKEY));
  useHotkeysGlobally(dispatch(STOP_TRANSPORT_HOTKEY));
  useHotkeysGlobally(dispatch(RECORD_TRANSPORT_HOTKEY));
  useHotkeysGlobally(dispatch(LOOP_TRANSPORT_HOTKEY));
  useHotkeysGlobally(dispatch(MUTE_TRANSPORT_HOTKEY));
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
  name: "New Project",
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
    const motif = selectSelectedMotif(project);
    const type = selectTimelineType(project);
    if (motif !== undefined) {
      dispatch(toggleEditor({ data: type }));
    }
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
    const firstPatternId = selectFirstPortaledPatternClipId(project);
    const firstPoseId = selectFirstPortaledPoseClipId(project);
    dispatchCustomEvent(`close_score_${firstPatternId}`);
    dispatchCustomEvent(`close_dropdown_${firstPoseId}`);
  },
});

// -----------------------------------------------
// Diary Hotkeys
// -----------------------------------------------

export const TOGGLE_DIARY_HOTKEY: Thunk<Hotkey> = () => ({
  name: "Toggle Diary",
  description: "Toggle the project diary.",
  shortcut: "shift+d",
  callback: () => dispatchCustomEvent("toggle_diary"),
});

export const CLOSE_DIARY_HOTKEY: Thunk<Hotkey> = () => ({
  name: "Close Diary",
  description: "Close the project diary.",
  shortcut: "esc",
  callback: () => dispatchCustomEvent("close_diary"),
});

// -----------------------------------------------
// Transport Hotkeys
// -----------------------------------------------

export const TOGGLE_TRANSPORT_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Toggle Transport",
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
