import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { union } from "lodash";
import {
  defaultScaleState,
  ScaleId,
  ScaleObject,
  ScaleUpdate,
} from "types/Scale";

// ------------------------------------------------------------
// Scale Payload Types
// ------------------------------------------------------------

/** The list of Scale IDs can be directly set (used for dragging). */
export type SetScaleIdsPayload = ScaleId[];

/** A `Scale` can be added to the store. */
export type AddScalePayload = ScaleObject;

/** A `Scale` can be removed from the store by ID. */
export type RemoveScalePayload = ScaleId;

/** A `Scale` can be updated with an ID specified. */
export type UpdateScalePayload = ScaleUpdate;

// ------------------------------------------------------------
// Scale Slice Definition
// ------------------------------------------------------------

export const scalesSlice = createSlice({
  name: "scales",
  initialState: defaultScaleState,
  reducers: {
    /** Set the list of scale IDs. */
    setScaleIds: (state, action: PayloadAction<SetScaleIdsPayload>) => {
      const scaleIds = action.payload;
      state.allIds = scaleIds;
    },
    /** Add a scale to the slice. */
    addScale: (state, action: PayloadAction<AddScalePayload>) => {
      const scale = action.payload;
      state.byId[scale.id] = scale;
      state.allIds = union(state.allIds, [scale.id]);
    },
    /** Remove a scale from the slice. */
    removeScale: (state, action: PayloadAction<RemoveScalePayload>) => {
      const scaleId = action.payload;
      delete state.byId[scaleId];
      const index = state.allIds.findIndex((id) => id === scaleId);
      if (index > -1) state.allIds.splice(index, 1);
    },
    /** Update a scale in the slice. */
    updateScale: (state, action: PayloadAction<UpdateScalePayload>) => {
      const { id, ...rest } = action.payload;
      if (!id) return;
      state.byId[id] = { ...state.byId[id], ...rest };
    },
  },
});

export const { setScaleIds, addScale, removeScale, updateScale } =
  scalesSlice.actions;

export default scalesSlice.reducer;
