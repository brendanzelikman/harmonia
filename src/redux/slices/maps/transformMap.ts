import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { initializeState } from "redux/util";
import { Clip, ClipId } from "types/clips";
import { defaultPatternTrack, defaultScaleTrack, TrackId } from "types/tracks";
import { Transform, TransformId } from "types/transform";

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
    addTransformsToTransformMap: (
      state,
      action: PayloadAction<TrackTransformPayload[]>
    ) => {
      action.payload.forEach(({ trackId, transformId }) => {
        if (!state.byId[trackId]) return;
        state.byId[trackId].transformIds.push(transformId);
      });
    },
    addTransformsWithClipsToTransformMap: (
      state,
      action: PayloadAction<{
        clips: Clip[];
        transforms: Transform[];
      }>
    ) => {
      const { transforms } = action.payload;
      transforms.forEach(({ trackId, id }) => {
        if (!state.byId[trackId]) return;
        state.byId[trackId].transformIds.push(id);
      });
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
    removeTransformsFromTransformMap: (
      state,
      action: PayloadAction<TransformId[]>
    ) => {
      action.payload.forEach((transformId) => {
        Object.keys(state.byId).forEach((trackId) => {
          const clipIndex = state.byId[trackId].transformIds.findIndex(
            (id) => id === transformId
          );
          if (clipIndex === -1) return;
          state.byId[trackId].transformIds.splice(clipIndex, 1);
        });
      });
    },
    removeTransformsWithClipsFromTransformMap: (
      state,
      action: PayloadAction<{ clipIds: ClipId[]; transformIds: TransformId[] }>
    ) => {
      const { transformIds } = action.payload;
      transformIds.forEach((transformId) => {
        Object.keys(state.byId).forEach((trackId) => {
          const clipIndex = state.byId[trackId].transformIds.findIndex(
            (id) => id === transformId
          );
          if (clipIndex === -1) return;
          state.byId[trackId].transformIds.splice(clipIndex, 1);
        });
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
  addTransformsToTransformMap,
  addTransformsWithClipsToTransformMap,
  removeTransformsFromTransformMap,
  removeTransformsWithClipsFromTransformMap,
} = transformMapSlice.actions;

export default transformMapSlice.reducer;
