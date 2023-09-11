import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { union } from "lodash";
import { initializeState } from "redux/util";
import { ScaleId } from "types/scale";
import { defaultScaleTrack, ScaleTrack, TrackId } from "types/tracks";

const initialState = initializeState<ScaleId, ScaleTrack>([defaultScaleTrack]);

export const scaleTracksSlice = createSlice({
  name: "scaleTracks",
  initialState,
  reducers: {
    // Add a scale track to the collection
    addScaleTrack: (state, action: PayloadAction<ScaleTrack>) => {
      const scaleTrack = action.payload;
      state.allIds = union(state.allIds, [scaleTrack.id]);
      state.byId[scaleTrack.id] = scaleTrack;
    },
    // Remove a scale track from the collection
    removeScaleTrack: (state, action: PayloadAction<TrackId>) => {
      const trackId = action.payload;
      delete state.byId[trackId];

      const index = state.allIds.findIndex((id) => id === trackId);
      if (index === -1) return;
      state.allIds.splice(index, 1);
    },
    // Update a scale track in the collection
    updateScaleTrack: (state, action: PayloadAction<Partial<ScaleTrack>>) => {
      const { id, ...rest } = action.payload;
      if (!id || !state.byId[id]) return;
      state.byId[id] = { ...state.byId[id], ...rest };
    },
  },
});

export const { addScaleTrack, removeScaleTrack, updateScaleTrack } =
  scaleTracksSlice.actions;

export default scaleTracksSlice.reducer;
