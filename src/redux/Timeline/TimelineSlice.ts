import { clamp } from "lodash";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  MAX_CELL_HEIGHT,
  MAX_CELL_WIDTH,
  MIN_CELL_HEIGHT,
  MIN_CELL_WIDTH,
} from "utils/constants";
import { Subdivision } from "tone/build/esm/core/type/Units";
import { defaultTimeline, TimelineState } from "types/Timeline";
import { ORDERED_SUBDIVISIONS } from "types/units";
import {
  MediaClipboard,
  MediaDraft,
  MediaDragState,
  MediaSelection,
} from "types/Media";
import { TrackId } from "types/Track";

/**
 * The timeline slice is responsible for managing the data grid and oversees all tracked objects.
 * It contains dimensions about the timeline, such as the cell width, height, subdivision, etc.
 *
 * @property `setTimelineState` - Set the timeline state.
 * @property `clearTimelineState` - Clear the timeline state.
 * @property `setCellWidth` - Set the width of a timeline cell.
 * @property `setCellHeight` - Set the height of a timeline cell.
 * @property `setSubdivision` - Set the subdivision of a timeline cell.
 * @property `increaseSubdivision` - Increase the subdivision of a timeline cell.
 * @property `decreaseSubdivision` - Decrease the subdivision of a timeline cell.
 * @property `setSelectedTrackId` - Set the selected track ID.
 * @property `updateMediaClipboard` - Update the clipboard with the given media.
 * @property `updateMediaDraft` - Update the drafted media.
 * @property `updateMediaSelection` - Update the selected media.
 * @property `updateMediaDragState` - Update the drag state of the media.
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
     * Set the selected track ID.
     * @param state - The current timeline state.
     * @param action - The payload action containing the track ID.
     */
    setSelectedTrackId: (state, action: PayloadAction<TrackId | undefined>) => {
      state.selectedTrackId = action.payload;
    },
    /**
     * Update the clipboard with the given media.
     * @param state - The current timeline state.
     * @param action - The payload action containing the media.
     */
    updateMediaClipboard: (
      state,
      action: PayloadAction<Partial<MediaClipboard>>
    ) => {
      const { mediaClipboard } = state;
      const { clips, transpositions } = action.payload;
      if (clips) {
        mediaClipboard.clips = clips;
      }
      if (transpositions) {
        mediaClipboard.transpositions = transpositions;
      }
    },
    /**
     * Update the drafted media.
     * @param state - The current timeline state.
     * @param action - The payload action containing a partial media draft.
     */
    updateMediaDraft: (state, action: PayloadAction<Partial<MediaDraft>>) => {
      const { mediaDraft } = state;
      const { clip, transposition } = action.payload;
      if (clip) {
        mediaDraft.clip = { ...mediaDraft.clip, ...clip };
      }
      if (transposition)
        mediaDraft.transposition = {
          ...mediaDraft.transposition,
          ...transposition,
          offsets: {
            ...mediaDraft.transposition.offsets,
            ...transposition.offsets,
          },
        };
    },
    /**
     * Update the selected media.
     * @param state - The current timeline state.
     * @param action - The payload action containing a partial media selection.
     */
    updateMediaSelection: (
      state,
      action: PayloadAction<Partial<MediaSelection>>
    ) => {
      const { mediaSelection } = state;
      const { clipIds, transpositionIds } = action.payload;
      if (clipIds) {
        mediaSelection.clipIds = clipIds;
      }
      if (transpositionIds) {
        mediaSelection.transpositionIds = transpositionIds;
      }
    },
    /**
     * Update the drag state of the media.
     * @param state - The current timeline state.
     * @param action - The payload action containing a partial media drag state.
     */
    updateMediaDragState: (
      state,
      action: PayloadAction<Partial<MediaDragState>>
    ) => {
      const { mediaDragState } = state;
      const { draggingClip, draggingTransposition } = action.payload;
      if (draggingClip !== undefined) {
        mediaDragState.draggingClip = draggingClip;
      }
      if (draggingTransposition !== undefined) {
        mediaDragState.draggingTransposition = draggingTransposition;
      }
    },
  },
});

export const {
  setTimelineState,
  clearTimelineState,

  setCellWidth,
  setCellHeight,
  setSubdivision,
  increaseSubdivision,
  decreaseSubdivision,

  setSelectedTrackId,
  updateMediaSelection,
  updateMediaClipboard,
  updateMediaDraft,
  updateMediaDragState,
} = timelineSlice.actions;

export default timelineSlice.reducer;
