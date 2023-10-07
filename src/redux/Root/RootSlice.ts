import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { difference, union } from "lodash";
import { ClipId } from "types/Clip";
import { PatternId } from "types/Pattern";
import { TrackId } from "types/Track";
import { TranspositionId } from "types/Transposition";
import { defaultRoot, Toolkit } from "types/Root";

/**
 * The root slice contains general information about the project.
 *
 * @property `setProjectName` - Set the project name.
 * @property `startTour` - Start the tour.
 * @property `endTour` - End the tour and reset the tour step.
 * @property `nextTourStep` - Go to the next tour step.
 * @property `prevTourStep` - Go to the previous tour step.
 * @property `setSelectedPattern` - Set the selected pattern ID or remove the selection if undefined.
 * @property `setSelectedTrack` - Set the selected track ID or remove the selection if undefined.
 * @property `setSelectedClips` - Set the selected clip IDs.
 * @property `setSelectedTranspositions` - Set the selected transposition IDs.
 * @property `addSelectedClips` - Add a list of clip IDs to the selected clip IDs.
 * @property `removeSelectedClips` - Remove a list of clip IDs from the selected clip IDs.
 * @property `deselectAllClips` - Deselect the selected clip IDs.
 * @property `addSelectedTransposition` - Add a transposition ID to the selected transposition IDs.
 * @property `removeSelectedTransposition` - Remove a transposition ID from the selected transposition IDs.
 * @property `deselectAllTranspositions` - Deselect the selected transposition IDs.
 * @property `setToolkitValue` - Set a toolkit value by key.
 * @property `toggleToolkitValue` - Toggle a boolean toolkit value by key.
 * @property `toggleShortcuts` - Toggle the shortcuts menu.
 *
 */
export const rootSlice = createSlice({
  name: "root",
  initialState: defaultRoot,
  reducers: {
    /**
     * Set the project name.
     * @param state The root slice.
     * @param action The string to set.
     */
    setProjectName(state, action: PayloadAction<string>) {
      state.projectName = action.payload;
    },
    /**
     * Start the tour.
     * @param state The root slice.
     */
    startTour: (state) => {
      state.showingTour = true;
    },
    /**
     * End the tour and reset the tour step.
     * @param state The root slice.
     */
    endTour: (state) => {
      state.showingTour = false;
      state.tourStep = 1;
    },
    /**
     * Go to the next tour step.
     * @param state The root slice.
     */
    nextTourStep: (state) => {
      state.tourStep += 1;
    },
    /**
     * Go to the previous tour step.
     * @param state The root slice.
     */
    prevTourStep: (state) => {
      state.tourStep -= 1;
    },
    /**
     * Set the selected track ID or remove the selection if undefined.
     * @param state The root slice.
     * @param action The track ID or undefined.
     */
    setSelectedTrack: (state, action: PayloadAction<TrackId | undefined>) => {
      const trackId = action.payload;
      state.selectedTrackId = trackId;
    },
    /**
     * Set the selected pattern ID or remove the selection if undefined.
     * @param state The root slice.
     * @param action The pattern ID or undefined.
     */
    setSelectedPattern: (
      state,
      action: PayloadAction<PatternId | undefined>
    ) => {
      const patternId = action.payload;
      state.selectedPatternId = patternId;
    },
    /**
     * Set the selected clip IDs.
     * @param state The root slice.
     * @param action The clip IDs.
     */
    setSelectedClips: (state, action: PayloadAction<ClipId[]>) => {
      const clipIds = action.payload;
      state.selectedClipIds = clipIds;
    },
    /**
     * Add a list of clip IDs to the selected clip IDs.
     * @param state The root slice.
     * @param action The clip IDs to add.
     */
    addSelectedClips: (state, action: PayloadAction<ClipId[]>) => {
      const clipIds = action.payload;
      state.selectedClipIds = union(state.selectedClipIds, clipIds);
    },
    /**
     * Remove a clip ID from the selected clip IDs.
     * @param state The root slice.
     * @param action The clip ID to remove.
     */
    removeSelectedClips: (state, action: PayloadAction<ClipId[]>) => {
      const clipIds = action.payload;
      state.selectedClipIds = difference(state.selectedClipIds, clipIds);
    },
    /**
     * Deselect the selected clip IDs.
     * @param state The root slice.
     */
    deselectAllClips: (state) => {
      state.selectedClipIds = [];
    },
    /**
     * Set the selected transposition IDs.
     * @param state The root slice.
     * @param action The transposition IDs.
     */
    setSelectedTranspositions: (
      state,
      action: PayloadAction<TranspositionId[]>
    ) => {
      const transpositionIds = action.payload;
      state.selectedTranspositionIds = transpositionIds;
    },
    /**
     * Add a transposition ID to the selected transposition IDs.
     * @param state The root slice.
     * @param action The transposition ID to add.
     */
    addSelectedTranspositions: (
      state,
      action: PayloadAction<TranspositionId[]>
    ) => {
      const transpositionIds = action.payload;
      state.selectedTranspositionIds = union(
        state.selectedTranspositionIds,
        transpositionIds
      );
    },
    /**
     * Remove a transposition ID from the selected transposition IDs.
     * @param state The root slice.
     * @param action The transposition ID to remove.
     */
    removeSelectedTranspositions: (
      state,
      action: PayloadAction<TranspositionId[]>
    ) => {
      const transpositionId = action.payload;
      state.selectedTranspositionIds = difference(
        state.selectedTranspositionIds,
        transpositionId
      );
    },
    /**
     * Deselect the selected transposition IDs.
     * @param state The root slice.
     */
    deselectAllTranspositions: (state) => {
      state.selectedTranspositionIds = [];
    },
    /**
     * Set a toolkit value by key.
     * @param state The root slice.
     * @param action The key and value to set.
     */
    setToolkitValue: (
      state,
      action: PayloadAction<{ key: keyof Partial<Toolkit>; value: any }>
    ) => {
      if (action.payload === undefined) return;
      const { key, value } = action.payload;
      if (!key) return;
      state.toolkit = { ...state.toolkit, [key]: value };
    },
    /**
     * Toggle a boolean toolkit value by key.
     * @param state The root slice.
     * @param action The key to toggle.
     */
    toggleToolkitValue: (
      state,
      action: PayloadAction<keyof Partial<Toolkit>>
    ) => {
      const key = action.payload;
      if (!key) return;
      state.toolkit = {
        ...state.toolkit,
        [key]: !state.toolkit[key],
      };
    },
    /**
     * Toggle the shortcuts menu.
     * @param state The root slice.
     */
    toggleShortcuts: (state) => {
      state.showingShortcuts = !state.showingShortcuts;
    },
  },
});

export const {
  setProjectName,
  toggleShortcuts,

  startTour,
  endTour,
  nextTourStep,
  prevTourStep,

  setSelectedTrack,
  setSelectedPattern,

  setSelectedClips,
  addSelectedClips,
  removeSelectedClips,
  deselectAllClips,

  setSelectedTranspositions,
  addSelectedTranspositions,
  removeSelectedTranspositions,
  deselectAllTranspositions,

  setToolkitValue,
  toggleToolkitValue,
} = rootSlice.actions;

export default rootSlice.reducer;
