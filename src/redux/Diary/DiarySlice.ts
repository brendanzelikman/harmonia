import { PayloadAction, createSlice } from "@reduxjs/toolkit";

// A diary is an array of pages
export type DiaryPage = string;
export type Diary = DiaryPage[];
const pageCount = 100;
const defaultDiary = new Array(pageCount).fill("") as Diary;

export const diarySlice = createSlice({
  name: "diary",
  initialState: defaultDiary,
  reducers: {
    /** Set the diary text for the given page. */
    setDiaryPage: (
      state,
      action: PayloadAction<{ page: number; text: string }>
    ) => {
      const { page, text } = action.payload;
      state[page] = text;
    },
    /** Clear the diary text for the given page. */
    clearDiaryPage: (state, action: PayloadAction<number>) => {
      const page = action.payload;
      state[page] = "";
    },
    /** Clear the diary text for all pages. */
    clearDiary: (state) => {
      state.clear();
      state.push(...defaultDiary);
    },
  },
});

export const { setDiaryPage, clearDiaryPage, clearDiary } = diarySlice.actions;

export default diarySlice.reducer;
