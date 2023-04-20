import { createSlice } from "@reduxjs/toolkit";

const tourSlice = createSlice({
  name: "tour",
  initialState: {
    step: 1,
    active: false,
  },
  reducers: {
    setTourStep: (state, action) => {
      state.step = action.payload;
    },
    startTour: (state) => {
      state.active = true;
    },
    endTour: (state) => {
      state.active = false;
      state.step = 1;
    },
    nextTourStep: (state) => {
      state.step += 1;
    },
    prevTourStep: (state) => {
      state.step -= 1;
    },
  },
});

export const { setTourStep, startTour, endTour, nextTourStep, prevTourStep } =
  tourSlice.actions;

export default tourSlice.reducer;
