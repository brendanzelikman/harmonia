import { clamp } from "lodash";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  MAX_CELL_HEIGHT,
  MAX_CELL_WIDTH,
  MIN_CELL_HEIGHT,
  MIN_CELL_WIDTH,
} from "appConstants";
import { Subdivision } from "tone/build/esm/core/type/Units";
import {
  defaultTimeline,
  TimelineState,
  TimelineClipboard,
} from "types/Timeline";
import { ORDERED_SUBDIVISIONS } from "types/units";

/**
 * The timeline slice is responsible for managing the data grid and oversees all tracked objects.
 * It contains dimensions about the timeline, such as the cell width, height, subdivision, etc.
 *
 * @property `setCellWidth` - Set the width of a timeline cell.
 * @property `setCellHeight` - Set the height of a timeline cell.
 * @property `setSubdivision` - Set the subdivision of a timeline cell.
 * @property `increaseSubdivision` - Increase the subdivision of a timeline cell.
 * @property `decreaseSubdivision` - Decrease the subdivision of a timeline cell.
 * @property `setTimelineState` - Set the timeline state.
 * @property `clearTimelineState` - Clear the timeline state.
 * @property `setClipboard` - Set the clipboard.
 * @property `toggleAddingClip` - Toggle the adding clip state.
 * @property `toggleCuttingClip` - Toggle the cutting clip state.
 * @property `toggleMergingClips` - Toggle the merging clips state.
 * @property `toggleRepeatingClips` - Toggle the repeating clips state.
 * @property `toggleTransposingClip` - Toggle the transposing clip state.
 * @property `startDraggingClip` - Start dragging a clip.
 * @property `stopDraggingClip` - Stop dragging a clip.
 * @property `startDraggingTransposition` - Start dragging a transposition.
 * @property `stopDraggingTransposition` - Stop dragging a transposition.
 *
 */
export const timelineSlice = createSlice({
  name: "timeline",
  initialState: defaultTimeline,
  reducers: {
    /**
     * Set the width of a timeline cell.
     * @param state - The current timeline state.
     * @param action - The payload action containing the cell width.
     */
    setCellWidth(state, action: PayloadAction<number>) {
      state.cell.width = clamp(action.payload, MIN_CELL_WIDTH, MAX_CELL_WIDTH);
    },
    /**
     * Set the height of a timeline cell.
     * @param state - The current timeline state.
     * @param action - The payload action containing the cell height.
     */
    setCellHeight(state, action: PayloadAction<number>) {
      state.cell.height = clamp(
        action.payload,
        MIN_CELL_HEIGHT,
        MAX_CELL_HEIGHT
      );
    },
    /**
     * Set the subdivision of the timeline.
     * @param state - The current timeline state.
     * @param action - The payload action containing the subdivision.
     */
    setSubdivision(state, action: PayloadAction<Subdivision>) {
      state.subdivision = action.payload;
    },
    /**
     * Increase the subdivision of the timeline.
     * @param state - The current timeline state.
     */
    increaseSubdivision(state) {
      const index = ORDERED_SUBDIVISIONS.indexOf(state.subdivision);
      if (index < 0) return;
      if (index < ORDERED_SUBDIVISIONS.length - 1) {
        state.subdivision = ORDERED_SUBDIVISIONS[index + 1];
      }
    },
    /**
     * Decrease the subdivision of the timeline.
     * @param state - The current timeline state.
     */
    decreaseSubdivision(state) {
      const index = ORDERED_SUBDIVISIONS.indexOf(state.subdivision);
      if (index > ORDERED_SUBDIVISIONS.length - 1) return;
      if (index > 0) {
        state.subdivision = ORDERED_SUBDIVISIONS[index - 1];
      }
    },
    /**
     * Set the timeline state.
     * @param state - The current timeline state.
     * @param action - The payload action containing the timeline state.
     */
    setTimelineState: (state, action: PayloadAction<TimelineState>) => {
      state.state = action.payload;
    },
    /**
     * Clear the timeline state.
     * @param state - The current timeline state.
     */
    clearTimelineState: (state) => {
      state.state = "idle";
    },
    /**
     * Set the clipboard to the given media.
     * @param state - The current timeline state.
     * @param action - The payload action containing the clipboard entry.
     */
    setClipboard: (state, action: PayloadAction<TimelineClipboard>) => {
      const clipboard = action.payload;
      state.clipboard = clipboard;
    },
    /**
     * Toggle the adding clip state.
     * @param state - The current timeline state.
     */
    toggleAddingClip: (state) => {
      const isAdding = state.state === "adding";
      state.state = isAdding ? "idle" : "adding";
    },
    /**
     * Toggle the cutting clip state.
     * @param state - The current timeline state.
     */
    toggleCuttingClip: (state) => {
      const isCutting = state.state === "cutting";
      state.state = isCutting ? "idle" : "cutting";
    },
    /**
     * Toggle the merging clips state.
     * @param state - The current timeline state.
     */
    toggleMergingClips: (state) => {
      const isMerging = state.state === "merging";
      state.state = isMerging ? "idle" : "merging";
    },
    /**
     * Toggle the repeating clips state.
     * @param state - The current timeline state.
     */
    toggleRepeatingClips: (state) => {
      const isRepeating = state.state === "repeating";
      state.state = isRepeating ? "idle" : "repeating";
    },
    /**
     * Toggle the transposing clip state.
     * @param state - The current timeline state.
     */
    toggleTransposingClip: (state) => {
      const isTransposing = state.state === "transposing";
      state.state = isTransposing ? "idle" : "transposing";
    },
    /**
     * Start dragging a clip.
     * @param state - The current timeline state.
     */
    startDraggingClip: (state) => {
      state.draggingClip = true;
    },
    /**
     * Stop dragging a clip.
     * @param state - The current timeline state.
     */
    stopDraggingClip: (state) => {
      state.draggingClip = false;
    },
    /**
     * Start dragging a transposition.
     * @param state - The current timeline state.
     */
    startDraggingTransposition: (state) => {
      state.draggingTransposition = true;
    },
    /**
     * Stop dragging a transposition.
     * @param state - The current timeline state.
     */
    stopDraggingTransposition: (state) => {
      state.draggingTransposition = false;
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
  startDraggingClip,
  stopDraggingClip,
  startDraggingTransposition,
  stopDraggingTransposition,
} = timelineSlice.actions;

export default timelineSlice.reducer;
