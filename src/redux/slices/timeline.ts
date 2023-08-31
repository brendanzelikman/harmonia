import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  DEFAULT_CELL_WIDTH,
  MAX_CELL_WIDTH,
  MIN_CELL_WIDTH,
} from "appConstants";
import { clamp } from "lodash";
import { Clip } from "types/clips";
import { Transform } from "types/transform";
import { Subdivision } from "types/units";

export interface TimelineClipboard {
  clips: Clip[];
  transforms: Transform[];
}

const orderedSubdivisions: Subdivision[] = [
  "1/1",
  "1/2",
  "1/4",
  "1/8",
  "1/16",
  "1/32",
  "1/64",
];

export type TimelineState =
  | "adding"
  | "cutting"
  | "transposing"
  | "repeating"
  | "merging"
  | "idle";

interface Timeline {
  state: TimelineState;

  cellWidth: number;
  subdivision: Subdivision;

  draggingClip: boolean;
  draggingTransform: boolean;

  clipboard: TimelineClipboard;
}

export const defaultTimeline: Timeline = {
  state: "idle",
  cellWidth: DEFAULT_CELL_WIDTH,
  subdivision: "1/16",
  clipboard: { clips: [], transforms: [] },
  draggingClip: false,
  draggingTransform: false,
};

export const timelineSlice = createSlice({
  name: "timeline",
  initialState: defaultTimeline,
  reducers: {
    setCellWidth(state, action: PayloadAction<number>) {
      state.cellWidth = clamp(action.payload, MIN_CELL_WIDTH, MAX_CELL_WIDTH);
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
    startDraggingClip: (state) => {
      state.draggingClip = true;
    },
    stopDraggingClip: (state) => {
      state.draggingClip = false;
    },
    startDraggingTransform: (state) => {
      state.draggingTransform = true;
    },
    stopDraggingTransform: (state) => {
      state.draggingTransform = false;
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
  setSubdivision,
  increaseSubdivision,
  decreaseSubdivision,

  startDraggingClip,
  stopDraggingClip,

  startDraggingTransform,
  stopDraggingTransform,

  setClipboard,
} = timelineSlice.actions;

export default timelineSlice.reducer;
