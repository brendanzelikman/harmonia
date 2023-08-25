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
    moveScaleTrackInTrackMap: (
      state,
      action: PayloadAction<{ id: TrackId; index: number }>
    ) => {
      const { id, index } = action.payload;
      if (!state.byId[id]) return;
      const scaleTrackIds = state.allIds;
      if (index < 0 || index >= scaleTrackIds.length) return;
      const currentIndex = scaleTrackIds.findIndex((i) => i === id);
      if (currentIndex === -1) return;
      state.allIds.splice(currentIndex, 1);
      state.allIds.splice(index, 0, id);
    },
    addPatternTrackToTrackMap: (state, action) => {
      const { scaleTrackId, patternTrackId, index } = action.payload;
      if (!state.byId[scaleTrackId]) return;
      // If index exists, add the pattern track at the index
      if (index) {
        const map = state.byId[scaleTrackId];
        if (index < 0 || index >= map.patternTrackIds.length) return;
        map.patternTrackIds.splice(index, 0, patternTrackId);
        return;
      }
      // Otherwise, add the pattern track to the end of the list
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
    movePatternTrackInTrackMap: (
      state,
      action: PayloadAction<{
        scaleTrackId: TrackId;
        patternTrackId: TrackId;
        index: number;
      }>
    ) => {
      const { scaleTrackId, patternTrackId, index } = action.payload;
      if (!state.byId[scaleTrackId]) return;
      const patternTrackIds = state.byId[scaleTrackId].patternTrackIds;
      if (index < 0 || index >= patternTrackIds.length) return;
      const currentIndex = patternTrackIds.findIndex(
        (i) => patternTrackId === i
      );
      if (currentIndex === -1) return;
      patternTrackIds.splice(currentIndex, 1);
      patternTrackIds.splice(index, 0, patternTrackId);
    },
  },
});

export const {
  addScaleTrackToTrackMap,
  removeScaleTrackFromTrackMap,
  moveScaleTrackInTrackMap,
  addPatternTrackToTrackMap,
  removePatternTrackFromTrackMap,
  movePatternTrackInTrackMap,
} = trackMapSlice.actions;

export default trackMapSlice.reducer;
