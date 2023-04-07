import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { initializeState } from "redux/util";
import { defaultPatternTrack, defaultScaleTrack, TrackId } from "types/tracks";
import { TransformId } from "types/transform";

interface TransformMapState {
  id: TrackId;
  transformIds: TransformId[];
}
interface TrackTransformPayload {
  trackId: TrackId;
  transformId: TransformId;
}

const initialState = initializeState<TrackId, TransformMapState>([
  { id: defaultScaleTrack.id, transformIds: [] },
  { id: defaultPatternTrack.id, transformIds: [] },
]);

export const transformMapSlice = createSlice({
  name: "transformMap",
  initialState,
  reducers: {
    addScaleTrackToTransformMap: (state, action: PayloadAction<TrackId>) => {
      const id = action.payload;
      state.byId[id] = { id, transformIds: [] };
      state.allIds.push(id);
    },
    addPatternTrackToTransformMap: (state, action: PayloadAction<TrackId>) => {
      const id = action.payload;
      state.byId[id] = { id, transformIds: [] };
      state.allIds.push(id);
    },
    removeScaleTrackFromTransformMap: (
      state,
      action: PayloadAction<TrackId>
    ) => {
      const trackId = action.payload;
      delete state.byId[trackId];

      const index = state.allIds.findIndex((id) => id === trackId);
      if (index === -1) return;
      state.allIds.splice(index, 1);
    },
    removePatternTrackFromTransformMap: (
      state,
      action: PayloadAction<TrackId>
    ) => {
      const trackId = action.payload;
      delete state.byId[trackId];

      const index = state.allIds.findIndex((id) => id === trackId);
      if (index === -1) return;
      state.allIds.splice(index, 1);
    },
    clearScaleTrackFromTransformMap: (
      state,
      action: PayloadAction<TrackId>
    ) => {
      const trackId = action.payload;
      if (!state.byId[trackId]) return;
      state.byId[trackId].transformIds = [];
    },
    clearPatternTrackFromTransformMap: (
      state,
      action: PayloadAction<TrackId>
    ) => {
      const trackId = action.payload;
      if (!state.byId[trackId]) return;
      state.byId[trackId].transformIds = [];
    },
    addTransformToTransformMap: (
      state,
      action: PayloadAction<TrackTransformPayload>
    ) => {
      const { trackId, transformId } = action.payload;
      if (!state.byId[trackId]) return;
      state.byId[trackId].transformIds.push(transformId);
    },
    removeTransformFromTransformMap: (
      state,
      action: PayloadAction<TransformId>
    ) => {
      const transformId = action.payload;
      Object.keys(state.byId).forEach((trackId) => {
        const clipIndex = state.byId[trackId].transformIds.findIndex(
          (id) => id === transformId
        );
        if (clipIndex === -1) return;
        state.byId[trackId].transformIds.splice(clipIndex, 1);
      });
    },
  },
});

export const {
  addScaleTrackToTransformMap,
  removeScaleTrackFromTransformMap,
  clearScaleTrackFromTransformMap,
  addPatternTrackToTransformMap,
  removePatternTrackFromTransformMap,
  clearPatternTrackFromTransformMap,
  addTransformToTransformMap,
  removeTransformFromTransformMap,
} = transformMapSlice.actions;

export default transformMapSlice.reducer;
