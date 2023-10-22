import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { initializeProjectMetadata } from "types/Project";
/**
 * The meta slice contains high-level information about the project.
 *
 * @property `setProjectName` - Set the project name.
 * @property `setProjectId` - Set the project ID.
 * @property `updateProjectTimestamp` - Update the project timestamp.
 */
export const metadataSlice = createSlice({
  name: "meta",
  initialState: initializeProjectMetadata(),
  reducers: {
    /**
     * Set the project name.
     * @param project The project slice.
     * @param action The string to set.
     */
    setProjectName(state, action: PayloadAction<string>) {
      state.name = action.payload;
    },
    /**
     * Set the project ID.
     * @param project The project slice.
     * @param action The ID to set.
     */
    setProjectId: (state, action: PayloadAction<string>) => {
      state.id = action.payload;
    },
    /**
     * Update the project's timestamp indicating last update.
     * @param project The project slice.
     */
    updateProjectTimestamp: (state) => {
      state.lastUpdated = new Date().toISOString();
    },
  },
});

export const { setProjectName, setProjectId, updateProjectTimestamp } =
  metadataSlice.actions;

export default metadataSlice.reducer;
