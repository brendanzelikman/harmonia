import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { union } from "lodash";
import { initializeState } from "types/util";
import {
  ScaleId,
  defaultNestedScale,
  NestedScaleId,
  NestedScaleObject,
} from "types/Scale";
import { Note } from "types/units";
import { ScaleTrackScaleName } from "types/ScaleTrack";

// The initial scale has the track scale name
const initialScale = { ...defaultNestedScale, name: ScaleTrackScaleName };

/**
 * The list of Scale IDs can be directly set (used for dragging).
 */
export type SetScaleIdsPayload = ScaleId[];

/**
 * A `Scale` can be added to the store.
 */
export type AddScalePayload = NestedScaleObject;

/**
 * A `Scale` can be removed from the store by ID.
 */
export type RemoveScalePayload = NestedScaleId;

/**
 * A `Scale` can be updated with a partial `NestedScaleObject`.
 */
export type UpdateScalePayload = Partial<NestedScaleObject>;

/**
 * A `Note` can be added to a `Scale` by ID.
 */
export type AddNoteToScalePayload = { id: NestedScaleId; note: Note };

/**
 * A `Note` can be removed from a `Scale` by ID.
 */
export type RemoveNoteFromScalePayload = { id: NestedScaleId; note: Note };

/**
 * A `Scale` can be transposed by a number of semitones.
 */
export type TransposeScalePayload = { id: NestedScaleId; offset: number };

/**
 * A `Scale` can be rotated by a number of semitones.
 */
export type RotateScalePayload = { id: NestedScaleId; offset: number };

/**
 * A `Scale` can be cleared by ID.
 */
export type ClearScalePayload = NestedScaleId;

const initialState = initializeState<NestedScaleId, NestedScaleObject>([
  initialScale,
]);

/**
 * The scales slice contains all custom scales in the store.
 *
 * @property `setScaleIds` - Set the list of scale IDs.
 * @property `addScale` - Add a scale to the store.
 * @property `removeScale` - Remove a scale from the store.
 * @property `updateScale` - Update a scale in the store.
 *
 */
export const scalesSlice = createSlice({
  name: "scales",
  initialState,
  reducers: {
    /**
     * Set the list of scale IDs.
     * @param state The `scales` state.
     * @param action The payload action containing the list of scale IDs.
     */
    setScaleIds: (state, action: PayloadAction<SetScaleIdsPayload>) => {
      const scaleIds = action.payload;
      state.allIds = scaleIds;
    },
    /**
     * Add a scale to the store.
     * @param state The `scales` state.
     * @param action The payload action containing the scale.
     */
    addScale: (state, action: PayloadAction<AddScalePayload>) => {
      const scale = action.payload;
      state.allIds = union(state.allIds, [scale.id]);
      state.byId[scale.id] = scale;
    },
    /**
     * Remove a scale from the store.
     * @param state The `scales` state.
     * @param action The payload action containing the scale ID.
     */
    removeScale: (state, action: PayloadAction<RemoveScalePayload>) => {
      const scaleId = action.payload;
      const index = state.allIds.findIndex((id) => id === scaleId);
      if (index === -1) return;
      state.allIds.splice(index, 1);
      delete state.byId[scaleId];
    },
    /**
     * Update a scale in the store.
     * @param state The `scales` state.
     * @param action The payload action containing the scale ID and partial scale.
     */
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
