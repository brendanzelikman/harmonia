import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { union } from "lodash";
import { initializeState } from "types/util";
import { ScaleId } from "types/Scale";
import { TrackId } from "types/Track";
import { ScaleTrack, defaultScaleTrack } from "types/ScaleTrack";

/**
 * A ScaleTrack can be added to the store.
 */
export type AddScaleTrackPayload = ScaleTrack;

/**
 * A ScaleTrack can be removed from the store by ID.
 */
export type RemoveScaleTrackPayload = TrackId;

/**
 * A ScaleTrack can be updated in the store.
 */
export type UpdateScaleTrackPayload = Partial<ScaleTrack>;

/**
 * The scaleTracks slice contains all of the ScaleTracks in the store.
 *
 * @property {@link addScaleTrack} - Add a ScaleTrack to the store.
 * @property {@link removeScaleTrack} - Remove a ScaleTrack from the store.
 * @property {@link updateScaleTrack} - Update a ScaleTrack in the store.
 *
 */

const initialState = initializeState<ScaleId, ScaleTrack>([defaultScaleTrack]);

export const scaleTracksSlice = createSlice({
  name: "scaleTracks",
  initialState,
  reducers: {
    /**
     * Add a ScaleTrack to the store.
     * @param state The scaleTracks state.
     * @param action The ScaleTrack to add.
     */
    addScaleTrack: (state, action: PayloadAction<AddScaleTrackPayload>) => {
      const scaleTrack = action.payload;
      state.allIds = union(state.allIds, [scaleTrack.id]);
      state.byId[scaleTrack.id] = scaleTrack;
    },
    /**
     * Remove a ScaleTrack from the store.
     * @param state The scaleTracks state.
     * @param action The ScaleTrack ID to remove.
     */
    removeScaleTrack: (
      state,
      action: PayloadAction<RemoveScaleTrackPayload>
    ) => {
      const trackId = action.payload;
      delete state.byId[trackId];

      const index = state.allIds.findIndex((id) => id === trackId);
      if (index === -1) return;
      state.allIds.splice(index, 1);
    },
    /**
     * Update a ScaleTrack in the store.
     * @param state The scaleTracks state.
     * @param action The ScaleTrack to update.
     */
    updateScaleTrack: (
      state,
      action: PayloadAction<Partial<UpdateScaleTrackPayload>>
    ) => {
      const { id, ...rest } = action.payload;
      if (!id || !state.byId[id]) return;
      state.byId[id] = { ...state.byId[id], ...rest };
    },
  },
});

export const { addScaleTrack, removeScaleTrack, updateScaleTrack } =
  scaleTracksSlice.actions;

export default scaleTracksSlice.reducer;
