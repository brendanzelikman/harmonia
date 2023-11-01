import { createSlice, PayloadAction as Action } from "@reduxjs/toolkit";
import { Tick } from "types/units";
import { defaultEditor, EditorView, EditorAction } from "types/Editor";
import {
  DurationType,
  getDottedDuration,
  getStraightDuration,
  getTripletDuration,
  isDottedDuration,
  isTripletDuration,
} from "utils/durations";

// ------------------------------------------------------------
// Editor Slice Definition
// ------------------------------------------------------------

export const editorSlice = createSlice({
  name: "editor",
  initialState: defaultEditor,
  reducers: {
    /** (PRIVATE) Set the view of the editor. */
    _setEditorView: (state, action: Action<EditorView>) => {
      state.view = action.payload;
    },
    /** Clear the view of the editor. */
    hideEditor: (state) => {
      delete state.view;
    },
    /** Toggle the editor between the given ID and hidden. */
    toggleEditor: (state, action: Action<EditorView>) => {
      if (state.view) delete state.view;
      else state.view = action.payload;
    },
    /** Set the editor action. */
    setEditorAction: (state, action: Action<EditorAction | undefined>) => {
      if (action.payload === undefined) delete state.action;
      else state.action = action.payload;
    },
    /** Toggle the editor state between the given state and idle. */
    toggleEditorAction: (state, action: Action<EditorAction>) => {
      if (state.action === action.payload) delete state.action;
      else state.action = action.payload;
    },
    /** Toggle the editor preset visibility. */
    toggleEditorPresets: (state) => {
      state.settings.global.showSidebar = !state.settings.global.showSidebar;
    },
    /** Toggle the editor track visibility. */
    toggleEditorTracks: (state) => {
      state.settings.global.showTracks = !state.settings.global.showTracks;
    },
    /** Toggle the editor piano visibility. */
    toggleEditorPiano: (state) => {
      state.settings.global.showPiano = !state.settings.global.showPiano;
    },
    /** Toggle the editor tooltip visibility. */
    toggleEditorTooltips: (state) => {
      state.settings.global.showTooltips = !state.settings.global.showTooltips;
    },
    /** Set the edited note duration. */
    setEditorNoteDuration: (state, action: Action<DurationType>) => {
      state.settings.note.duration = action.payload;
    },
    /** Toggle the edited note duration between straight and dotted. */
    toggleEditorDottedDuration: (state) => {
      const duration = state.settings.note.duration;
      if (isDottedDuration(duration)) {
        state.settings.note.duration = getStraightDuration(duration);
      } else {
        state.settings.note.duration = getDottedDuration(duration);
      }
    },
    /** Toggle the edited note duration between straight and triplet. */
    toggleEditorTripletDuration: (state) => {
      const duration = state.settings.note.duration;
      if (isTripletDuration(duration)) {
        state.settings.note.duration = getStraightDuration(duration);
      } else {
        state.settings.note.duration = getTripletDuration(duration);
      }
    },
    /** Set the edited recording length. */
    setEditorRecordingLength: (state, action: Action<Tick>) => {
      state.settings.recording.ticks = action.payload;
    },
    /** Set the edited recording quantization. */
    setEditorRecordingQuantization: (state, action: Action<DurationType>) => {
      state.settings.recording.quantization = action.payload;
    },
  },
});

export const {
  _setEditorView,
  hideEditor,
  toggleEditor,
  setEditorAction,
  toggleEditorAction,
  setEditorNoteDuration,
  toggleEditorPresets,
  toggleEditorTracks,
  toggleEditorPiano,
  toggleEditorTooltips,
  toggleEditorDottedDuration,
  toggleEditorTripletDuration,
  setEditorRecordingLength,
  setEditorRecordingQuantization,
} = editorSlice.actions;

export default editorSlice.reducer;
