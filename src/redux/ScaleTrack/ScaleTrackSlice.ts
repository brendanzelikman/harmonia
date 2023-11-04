import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { union } from "lodash";
import { RemoveTrackPayload, TrackId } from "types/Track";
import {
  ScaleTrack,
  ScaleTrackUpdate,
  defaultScaleTrackState,
} from "types/ScaleTrack";

// ------------------------------------------------------------
// Payload Types
// ------------------------------------------------------------

/** A ScaleTrack can be added to the store. */
export type AddScaleTrackPayload = ScaleTrack;

/** A ScaleTrack can be removed from the store. */
export type RemoveScaleTrackPayload = RemoveTrackPayload;

/** A ScaleTrack can be updated in the store. */
export type UpdateScaleTrackPayload = ScaleTrackUpdate;

// ------------------------------------------------------------
// Slice Definition
// ------------------------------------------------------------

export const scaleTracksSlice = createSlice({
  name: "scaleTracks",
  initialState: defaultScaleTrackState,
  reducers: {
    /** Add a scale track to the slice. */
    addScaleTrack: (state, action: PayloadAction<AddScaleTrackPayload>) => {
      const scaleTrack = action.payload;
      state.allIds = union(state.allIds, [scaleTrack.id]);
      state.byId[scaleTrack.id] = scaleTrack;
    },
    /** Remove a scale track from the slice. */
    removeScaleTrack: (
      state,
      action: PayloadAction<RemoveScaleTrackPayload>
    ) => {
      const { id } = action.payload;
      delete state.byId[id];

      const index = state.allIds.findIndex((tId) => tId === id);
      if (index === -1) return;
      state.allIds.splice(index, 1);
    },
    /** Update a scale track in the slice. */
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
