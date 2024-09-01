import { Thunk } from "types/Project/ProjectTypes";
import {
  clearTimelineState,
  setSelectedTrackId,
} from "types/Timeline/TimelineSlice";
import { TrackId } from "types/Track/TrackTypes";
import {
  isEditorAddingNotes,
  isScaleEditorOpen,
  isInstrumentEditorOpen,
} from "./EditorFunctions";
import {
  toggleEditorAction,
  setEditorAction,
  _setEditorView,
  hideEditor,
  toggleEditorTracks,
} from "./EditorSlice";
import { EditorView } from "./EditorTypes";
import { selectCustomPatterns } from "types/Pattern/PatternSelectors";
import {
  selectTimelineType,
  selectSelectedPattern,
  selectSelectedScale,
  selectSelectedTrackId,
} from "types/Timeline/TimelineSelectors";
import { selectEditor } from "./EditorSelectors";
import { Payload } from "lib/redux";
import { setSelectedPattern } from "types/Media/MediaThunks";
import { PatternId } from "types/Pattern/PatternTypes";

/** Show the editor with the given ID and track if provided. */
export const showEditor =
  ({
    data,
    undoType,
  }: Payload<{ view?: EditorView; trackId?: TrackId }>): Thunk =>
  (dispatch, getProject) => {
    const { view, trackId } = data;
    if (!view) return;
    const project = getProject();
    const editor = selectEditor(project);
    const customPatterns = selectCustomPatterns(project);
    const pattern = selectSelectedPattern(project);
    const scale = selectSelectedScale(project);

    // Start adding notes if opening a custom pattern
    const onPatterns = view === "pattern";
    const isAdding = isEditorAddingNotes(editor);
    const isCustom = pattern && customPatterns.some((p) => p.id === pattern.id);
    if (onPatterns && !isAdding && isCustom) {
      dispatch(toggleEditorAction({ data: "addingNotes", undoType }));
    } else {
      dispatch(setEditorAction({ data: undefined, undoType }));
    }

    if (scale && !scale.notes.length && editor.action === "removingNotes") {
      dispatch(setEditorAction({ data: undefined }));
    }

    // Set the editor view
    dispatch(_setEditorView({ data: view, undoType }));
    dispatch(clearTimelineState({ data: null, undoType }));

    // Set the selected track if specified
    if (trackId) dispatch(setSelectedTrackId({ data: trackId, undoType }));
  };

/** Toggle the editor of a pattern. */
export const togglePatternEditor =
  (id: PatternId): Thunk =>
  (dispatch, getProject) => {
    const undoType = "editor/togglePatternEditor";
    const project = getProject();
    const editor = selectEditor(project);
    const pattern = selectSelectedPattern(project);
    const onPattern = editor.view === "pattern" && pattern !== undefined;

    // Toggle the editor
    if (onPattern) {
      dispatch(hideEditor({ data: null, undoType }));
    } else {
      dispatch(showEditor({ data: { view: "pattern" }, undoType }));
      dispatch(setSelectedPattern({ data: id, undoType }));
    }
  };

/** Toggle the scale editor of a track.*/
export const toggleTrackScaleEditor =
  (id?: TrackId): Thunk =>
  (dispatch, getProject) => {
    const undoType = "editor/toggleTrackScaleEditor";
    const project = getProject();

    // Check if the editor is already on the track scale
    const selectedTrackId = selectSelectedTrackId(project);
    const editor = selectEditor(project);
    const onScale = isScaleEditorOpen(editor);
    const onTrack = id === selectedTrackId;

    // Toggle the editor
    if (onScale && onTrack) {
      dispatch(hideEditor({ data: null, undoType }));
    } else {
      dispatch(showEditor({ data: { view: "scale", trackId: id }, undoType }));

      // Show tracks if they are hidden
      if (!editor.settings.global.showTracks) {
        dispatch(toggleEditorTracks({ data: null, undoType }));
      }
    }
  };

/** Toggle the instrument editor of a track. */
export const toggleTrackInstrumentEditor =
  (id?: TrackId): Thunk =>
  (dispatch, getProject) => {
    const undoType = "editor/toggleTrackInstrumentEditor";
    const project = getProject();

    // Check if the editor is already on the track instrument
    const selectedTrackId = selectSelectedTrackId(project);
    const editor = selectEditor(project);
    const onInstrument = isInstrumentEditorOpen(editor);
    const onEditor = id === selectedTrackId && onInstrument;

    // Toggle the editor
    if (onEditor) {
      dispatch(hideEditor({ data: null, undoType }));
    } else {
      dispatch(
        showEditor({ data: { view: "instrument", trackId: id }, undoType })
      );

      // Show tracks if they are hidden
      if (!editor.settings.global.showTracks) {
        dispatch(toggleEditorTracks({ data: null, undoType }));
      }
    }
  };
