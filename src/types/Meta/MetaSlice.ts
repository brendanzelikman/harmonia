import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { initializeProjectMetadata, initializeProjectDiary } from "./MetaTypes";

// ------------------------------------------------------------
// Metadata Slice Definition
// ------------------------------------------------------------

export const metaSlice = createSlice({
  name: "meta",
  initialState: initializeProjectMetadata(),
  reducers: {
    /** Update the project's name. */
    setProjectName(state, action: PayloadAction<string>) {
      state.name = action.payload;
    },
    /** Set the diary text for the given page. */
    setDiaryPage: (
      state,
      action: PayloadAction<{ page: number; text: string }>
    ) => {
      if (!state.diary) state.diary = initializeProjectDiary();
      const { page, text } = action.payload;
      state.diary[page] = text;
    },
    /** Clear the diary text for the given page. */
    clearDiaryPage: (state, action: PayloadAction<number>) => {
      if (!state.diary) state.diary = initializeProjectDiary();
      const page = action.payload;
      state.diary[page] = "";
    },
    /** Clear the diary text for all pages. */
    clearDiary: (state) => {
      state.diary = initializeProjectDiary();
    },
  },
});

export const { setProjectName, setDiaryPage, clearDiaryPage, clearDiary } =
  metaSlice.actions;
