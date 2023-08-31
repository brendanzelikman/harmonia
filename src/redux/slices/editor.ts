import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { AppThunk } from "redux/store";
import { TrackId } from "types/tracks";
import { Duration, Timing } from "types/units";
import { setSelectedTrack } from "./root";
import { defaultEditor, EditorId, EditorState } from "types/editor";

export const editorSlice = createSlice({
  name: "editor",
  initialState: defaultEditor,
  reducers: {
    _showEditor: (state, action) => {
      state.id = action.payload;
      state.show = true;
    },
    hideEditor: (state) => {
      state.id = "hidden";
      state.show = false;
    },
    setEditorState: (state, action: PayloadAction<EditorState>) => {
      state.state = action.payload;
    },
    setEditorNoteDuration: (state, action: PayloadAction<Duration>) => {
      state.selectedDuration = action.payload;
    },
    setEditorNoteTiming: (state, action: PayloadAction<Timing>) => {
      state.selectedTiming = action.payload;
    },
  },
});

export const {
  _showEditor,
  hideEditor,
  setEditorState,
  setEditorNoteDuration,
  setEditorNoteTiming,
} = editorSlice.actions;

export const showEditor =
  ({ id, trackId }: { id: EditorId; trackId?: TrackId }): AppThunk =>
  (dispatch) => {
    dispatch(_showEditor(id));
    dispatch(setSelectedTrack(trackId));
  };

export default editorSlice.reducer;
