import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { defaultRoot } from "types/Root";

/**
 * The root slice contains general information about the project.
 *
 * @property `setProjectName` - Set the project name.
 * @property `setTourId` - Set the tour id.
 * @property `startTour` - Start the tour.
 * @property `endTour` - End the tour and reset the tour step.
 * @property `nextTourStep` - Go to the next tour step.
 * @property `prevTourStep` - Go to the previous tour step.
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
     * Set the tour id.
     * @param state The root slice.
     * @param action The ID to set.
     */
    setTourId: (state, action: PayloadAction<string>) => {
      state.tour.id = action.payload;
    },
    /**
     * Start the tour.
     * @param state The root slice.
     */
    startTour: (state) => {
      state.tour.show = true;
    },
    /**
     * End the tour and reset the tour step.
     * @param state The root slice.
     */
    endTour: (state) => {
      state.tour.show = false;
      state.tour.step = 1;
      state.tour.id = "idle";
    },
    /**
     * Go to the next tour step.
     * @param state The root slice.
     */
    nextTourStep: (state) => {
      state.tour.step += 1;
    },
    /**
     * Go to the previous tour step.
     * @param state The root slice.
     */
    prevTourStep: (state) => {
      state.tour.step -= 1;
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
  setTourId,
  startTour,
  endTour,
  nextTourStep,
  prevTourStep,
  toggleShortcuts,
} = rootSlice.actions;

export default rootSlice.reducer;
