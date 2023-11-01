import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { initializeProjectMetadata } from "types/Project";

// ------------------------------------------------------------
// Metadata Slice Definition
// ------------------------------------------------------------

export const metadataSlice = createSlice({
  name: "meta",
  initialState: initializeProjectMetadata(),
  reducers: {
    /** Update the project's name. */
    updateProjectName(state, action: PayloadAction<string>) {
      state.name = action.payload;
    },
    /** Update the project's timestamp. */
    updateProjectTimestamp: (state) => {
      state.lastUpdated = new Date().toISOString();
    },
  },
});

export const { updateProjectName, updateProjectTimestamp } =
  metadataSlice.actions;

export default metadataSlice.reducer;
