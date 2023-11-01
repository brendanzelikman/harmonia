import {
  selectCustomPatterns,
  selectEditor,
  selectSelectedTrackId,
} from "redux/selectors";
import { Thunk } from "types/Project";
import { TrackId } from "types/Track";
import {
  _setEditorView,
  hideEditor,
  setEditorAction,
  toggleEditorAction,
} from "./EditorSlice";
import {
  EditorView,
  isEditorAddingNotes,
  isInstrumentEditorOpen,
  isScaleEditorOpen,
} from "types/Editor";
import {
  clearTimelineState,
  selectSelectedPattern,
  setSelectedTrackId,
} from "redux/Timeline";

/** Show the editor with the given ID and track if provided. */
export const showEditor =
  (view: EditorView, trackId?: TrackId): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const editor = selectEditor(project);
    const customPatterns = selectCustomPatterns(project);
    const pattern = selectSelectedPattern(project);

    // Start adding notes if opening a custom pattern
    const onPatterns = view === "patterns";
    const isAdding = isEditorAddingNotes(editor);
    const isCustom = pattern && customPatterns.some((p) => p.id === pattern.id);
    if (onPatterns && !isAdding && isCustom) {
      dispatch(toggleEditorAction("addingNotes"));
    } else if (onPatterns && isAdding && isCustom) {
    } else {
      dispatch(setEditorAction(undefined));
    }

    // Set the editor view
    dispatch(_setEditorView(view));
    dispatch(clearTimelineState());

    // Set the selected track if specified
    if (trackId) dispatch(setSelectedTrackId(trackId));
  };

/** Toggle the scale editor of a track.*/
export const toggleTrackScaleEditor =
  (id?: TrackId): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();

    // Check if the editor is already on the track scale
    const selectedTrackId = selectSelectedTrackId(project);
    const editor = selectEditor(project);
    const onScale = isScaleEditorOpen(editor);
    const onTrack = id === selectedTrackId;

    // Toggle the editor
    if (onScale && onTrack) {
      dispatch(hideEditor());
    } else {
      dispatch(showEditor("scale", id));
    }
  };

/** Toggle the instrument editor of a track. */
export const toggleTrackInstrumentEditor =
  (id?: TrackId): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();

    // Check if the editor is already on the track instrument
    const selectedTrackId = selectSelectedTrackId(project);
    const editor = selectEditor(project);
    const onInstrument = isInstrumentEditorOpen(editor);
    const onEditor = id === selectedTrackId && onInstrument;

    // Toggle the editor
    if (onEditor) {
      dispatch(hideEditor());
    } else {
      dispatch(showEditor("instrument", id));
    }
  };
