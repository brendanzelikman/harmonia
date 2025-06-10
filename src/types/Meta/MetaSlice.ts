import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { initializeProjectMetadata } from "./MetaTypes";

// ------------------------------------------------------------
// Metadata Slice Definition
// ------------------------------------------------------------

export const metaSlice = createSlice({
  name: "meta",
  initialState: initializeProjectMetadata(),
  reducers: {
    setProjectName(state, action: PayloadAction<string>) {
      state.name = action.payload;
    },
  },
});

export const { setProjectName } = metaSlice.actions;
