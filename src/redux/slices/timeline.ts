import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  MAX_CELL_HEIGHT,
  MAX_CELL_WIDTH,
  MIN_CELL_HEIGHT,
  MIN_CELL_WIDTH,
} from "appConstants";
import { clamp } from "lodash";

import {
  defaultTimeline,
  orderedSubdivisions,
  TimelineClipboard,
  TimelineState,
} from "types/timeline";
import { Subdivision } from "types/units";

export const timelineSlice = createSlice({
  name: "timeline",
  initialState: defaultTimeline,
  reducers: {
    setCellWidth(state, action: PayloadAction<number>) {
      state.cell.width = clamp(action.payload, MIN_CELL_WIDTH, MAX_CELL_WIDTH);
    },
    setCellHeight(state, action: PayloadAction<number>) {
      state.cell.height = clamp(
        action.payload,
        MIN_CELL_HEIGHT,
        MAX_CELL_HEIGHT
      );
    },
    setSubdivision(state, action: PayloadAction<Subdivision>) {
      state.subdivision = action.payload;
    },
    increaseSubdivision(state) {
      const index = orderedSubdivisions.indexOf(state.subdivision);
      if (index < 0) return;
      if (index < orderedSubdivisions.length - 1) {
        state.subdivision = orderedSubdivisions[index + 1];
      }
    },
    decreaseSubdivision(state) {
      const index = orderedSubdivisions.indexOf(state.subdivision);
      if (index > orderedSubdivisions.length - 1) return;
      if (index > 0) {
        state.subdivision = orderedSubdivisions[index - 1];
      }
    },
    setTimelineState: (state, action: PayloadAction<TimelineState>) => {
      state.state = action.payload;
    },
    clearTimelineState: (state) => {
      state.state = "idle";
    },
    setClipboard: (state, action: PayloadAction<TimelineClipboard>) => {
      const clipboard = action.payload;
      state.clipboard = clipboard;
    },
    toggleAddingClip: (state) => {
      const isAdding = state.state === "adding";
      state.state = isAdding ? "idle" : "adding";
    },
    toggleCuttingClip: (state) => {
      const isCutting = state.state === "cutting";
      state.state = isCutting ? "idle" : "cutting";
    },
    toggleMergingClips: (state) => {
      const isMerging = state.state === "merging";
      state.state = isMerging ? "idle" : "merging";
    },
    toggleRepeatingClips: (state) => {
      const isRepeating = state.state === "repeating";
      state.state = isRepeating ? "idle" : "repeating";
    },
    toggleTransposingClip: (state) => {
      const isTransposing = state.state === "transposing";
      state.state = isTransposing ? "idle" : "transposing";
    },
  },
});

export const {
  setTimelineState,
  clearTimelineState,

  toggleAddingClip,
  toggleCuttingClip,
  toggleMergingClips,
  toggleRepeatingClips,
  toggleTransposingClip,

  setCellWidth,
  setCellHeight,
  setSubdivision,
  increaseSubdivision,
  decreaseSubdivision,

  setClipboard,
} = timelineSlice.actions;

export default timelineSlice.reducer;
