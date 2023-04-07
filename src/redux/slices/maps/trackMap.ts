import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { initializeState } from "redux/util";
import { defaultPatternTrack, defaultScaleTrack, TrackId } from "types/tracks";

interface TrackMapState {
  id: TrackId;
  patternTrackIds: TrackId[];
}

const defaultRecord: TrackMapState = {
  id: defaultScaleTrack.id,
  patternTrackIds: [defaultPatternTrack.id],
};
const initialState = initializeState<TrackId, TrackMapState>([defaultRecord]);

export const trackMapSlice = createSlice({
  name: "trackMap",
  initialState,
  reducers: {
    addScaleTrackToTrackMap: (state, action: PayloadAction<TrackId>) => {
      const id = action.payload;
      state.byId[id] = {
        id,
        patternTrackIds: [],
      };
      state.allIds.push(id);
    },
    removeScaleTrackFromTrackMap: (state, action: PayloadAction<TrackId>) => {
      const id = action.payload;
      delete state.byId[id];

      const index = state.allIds.findIndex((id) => id === id);
      if (index === -1) return;
      state.allIds.splice(index, 1);
    },
    addPatternTrackToTrackMap: (state, action) => {
      const { scaleTrackId, patternTrackId } = action.payload;
      if (!state.byId[scaleTrackId]) return;
      state.byId[scaleTrackId].patternTrackIds.push(patternTrackId);
    },
    removePatternTrackFromTrackMap: (state, action: PayloadAction<TrackId>) => {
      const patternTrackId = action.payload;
      for (const scaleTrackId in state.byId) {
        const patternTrackIndex = state.byId[
          scaleTrackId
        ].patternTrackIds.findIndex((id) => id === patternTrackId);
        if (patternTrackIndex === -1) continue;
        state.byId[scaleTrackId].patternTrackIds.splice(patternTrackIndex, 1);
      }
    },
  },
});

export const {
  addScaleTrackToTrackMap,
  removeScaleTrackFromTrackMap,
  addPatternTrackToTrackMap,
  removePatternTrackFromTrackMap,
} = trackMapSlice.actions;

export default trackMapSlice.reducer;
