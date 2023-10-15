import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { initializeProject } from "types/Project";
/**
 * The project slice contains high-level information about the project.
 *
 * @property `setProjectName` - Set the project name.
 * @property `setProjectId` - Set the project ID.
 * @property `updateProjectTimestamp` - Update the project timestamp.
 */
export const projectSlice = createSlice({
  name: "project",
  initialState: initializeProject(),
  reducers: {
    /**
     * Set the project name.
     * @param state The project slice.
     * @param action The string to set.
     */
    setProjectName(state, action: PayloadAction<string>) {
      state.name = action.payload;
    },
    /**
     * Set the project ID.
     * @param state The project slice.
     * @param action The ID to set.
     */
    setProjectId: (state, action: PayloadAction<string>) => {
      state.id = action.payload;
    },
    /**
     * Update the project's timestamp indicating last update.
     * @param state The project slice.
     */
    updateProjectTimestamp: (state) => {
      state.lastUpdated = new Date().toISOString();
    },
  },
});

export const { setProjectName, setProjectId, updateProjectTimestamp } =
  projectSlice.actions;

export default projectSlice.reducer;
