import { createSlice } from "@reduxjs/toolkit";
import { Tick } from "types/units";
import {
  DurationType,
  getDottedDuration,
  getStraightDuration,
  getTripletDuration,
  isDottedDuration,
  isTripletDuration,
} from "utils/durations";
import { defaultEditor, EditorView, EditorAction, Editor } from "./EditorTypes";
import { Action, unpackAction } from "lib/redux";

// ------------------------------------------------------------
// Editor Slice Definition
// ------------------------------------------------------------

export const editorSlice = createSlice({
  name: "editor",
  initialState: defaultEditor,
  reducers: {
    /** (PRIVATE) Set the view of the editor. */
    _setEditorView: (state, action: Action<EditorView>) => {
      state.view = unpackAction(action);
    },
    /** Clear the view of the editor. */
    hideEditor: (state: Editor, action: Action<null>) => {
      delete state.view;
    },
    /** Toggle the editor between the given ID and hidden. */
    toggleEditor: (state, action: Action<EditorView | undefined>) => {
      if (action.payload === undefined) return;
      if (state.view) delete state.view;
      else state.view = unpackAction(action);
    },
    /** Set the editor action. */
    setEditorAction: (state, action: Action<EditorAction | undefined>) => {
      if (action.payload === undefined) delete state.action;
      else state.action = unpackAction(action);
    },
    /** Toggle the editor state between the given state and idle. */
    toggleEditorAction: (state, action: Action<EditorAction>) => {
      const data = unpackAction(action);
      if (state.action === data) delete state.action;
      else state.action = data;
    },
    toggleEditorPresets: (state) => {
      state.settings.global.showSidebar = !state.settings.global.showSidebar;
    },
    toggleEditorTracks: (state, action: Action<null>) => {
      state.settings.global.showTracks = !state.settings.global.showTracks;
    },
    toggleEditorPiano: (state) => {
      state.settings.global.showPiano = !state.settings.global.showPiano;
    },
    toggleEditorTooltips: (state) => {
      state.settings.global.showTooltips = !state.settings.global.showTooltips;
    },
    setEditorNoteDuration: (state, action: Action<DurationType>) => {
      state.settings.note.duration = unpackAction(action);
    },
    setEditorClockLength: (state, action: Action<number>) => {
      state.settings.clock.clockLength = unpackAction(action);
    },
    setEditorClockTickDuration: (state, action: Action<DurationType>) => {
      state.settings.clock.tickDuration = unpackAction(action);
    },
    setEditorClockSwingPercentage: (state, action: Action<number>) => {
      state.settings.clock.swingPercentage = unpackAction(action);
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
      state.settings.recording.ticks = unpackAction(action);
    },
    /** Set the edited recording quantization. */
    setEditorRecordingQuantization: (state, action: Action<DurationType>) => {
      state.settings.recording.quantization = unpackAction(action);
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
  setEditorClockLength,
  setEditorClockTickDuration,
  setEditorClockSwingPercentage,
} = editorSlice.actions;

export default editorSlice.reducer;
