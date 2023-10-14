import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "redux/store";
import { TrackId } from "types/Track";
import { Duration, Tick, Timing } from "types/units";
import { defaultEditor, EditorId, EditorState } from "types/Editor";

/**
 * The editor slice contains information about the editor.
 *
 * @property `showEditor` - Show the editor with the given ID.
 * @property `hideEditor` - Hide the editor and set the ID to "hidden".
 * @property `setEditorState` - Set the editor state.
 * @property `setEditorNoteDuration` - Set the note duration within the editor.
 * @property `setEditorNoteTiming` - Set the note timing within the editor.
 * @property `setEditorNoteVelocity` - Set the note velocity within the editor.
 * @property `setEditorRecordingDuration` - Set the recording duration within the editor.
 * @property `setEditorRecordingTiming` - Set the recording timing within the editor.
 * @property `setEditorRecordingQuantization` - Set whether the recording should be quantized within the editor.
 */
export const editorSlice = createSlice({
  name: "editor",
  initialState: defaultEditor,
  reducers: {
    /**
     * Show the editor with the given ID.
     * @param state The editor state.
     * @param action The payload action;
     */
    _showEditor: (state, action: PayloadAction<EditorId>) => {
      state.id = action.payload;
      state.show = true;
    },
    /**
     * Hide the editor and set the ID to "hidden".
     * @param state The editor state.
     */
    hideEditor: (state) => {
      state.id = "hidden";
      state.show = false;
    },
    /**
     * Toggle the editor between the given ID and "hidden".
     * @param state The editor state.
     * @param action The payload action.
     */
    toggleEditor: (state, action: PayloadAction<EditorId>) => {
      state.id = state.id === action.payload ? "hidden" : action.payload;
      state.show = state.id !== "hidden";
    },
    /**
     * Set the editor state.
     * @param state The editor state.
     * @param action The payload action.
     */
    setEditorState: (state, action: PayloadAction<EditorState>) => {
      state.state = action.payload;
    },
    /**
     * Toggle the editor state between the given state and idle.
     * @param state The editor state.
     * @param action The payload action.
     */
    toggleEditorState: (state, action: PayloadAction<EditorState>) => {
      state.state = state.state === action.payload ? "idle" : action.payload;
    },
    /**
     * Set the note duration within the editor.
     * @param state The editor state.
     * @param action The payload action.
     */
    setEditorNoteDuration: (state, action: PayloadAction<Duration>) => {
      state.noteDuration = action.payload;
    },
    /**
     * Set the note timing within the editor.
     * @param state The editor state.
     * @param action The payload action.
     */
    setEditorNoteTiming: (state, action: PayloadAction<Timing>) => {
      state.noteTiming = action.payload;
    },
    /**
     * Set the note velocity within the editor.
     * @param state The editor state.
     * @param action The payload action.
     */
    setEditorNoteVelocity: (state, action: PayloadAction<number>) => {
      state.noteVelocity = action.payload;
    },
    /**
     * Set the recording duratino within the editor.
     * @param state The editor state.
     * @param action The payload action.
     */
    setEditorRecordingDuration: (state, action: PayloadAction<Tick>) => {
      state.recordingDuration = action.payload;
    },
    /**
     * Set the recording timing within the editor.
     * @param state The editor state.
     * @param action The payload action.
     */
    setEditorRecordingTiming: (state, action: PayloadAction<Timing>) => {
      state.recordingTiming = action.payload;
    },
    /**
     * Set whether the recording should be quantized within the editor.
     * @param state The editor state.
     * @param action The payload action.
     */
    setEditorRecordingQuantization: (
      state,
      action: PayloadAction<Duration>
    ) => {
      state.recordingQuantization = action.payload;
    },
  },
});

export const {
  _showEditor,
  hideEditor,
  toggleEditor,
  setEditorState,
  toggleEditorState,
  setEditorNoteDuration,
  setEditorNoteTiming,
  setEditorNoteVelocity,
  setEditorRecordingDuration,
  setEditorRecordingTiming,
  setEditorRecordingQuantization,
} = editorSlice.actions;

export default editorSlice.reducer;
