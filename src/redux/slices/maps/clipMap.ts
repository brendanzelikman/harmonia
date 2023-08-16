import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { initializeState } from "redux/util";
import { Clip, ClipId } from "types/clips";
import { defaultPatternTrack, TrackId } from "types/tracks";
import { Transform, TransformId } from "types/transform";

interface ClipMapState {
  id: TrackId;
  clipIds: ClipId[];
}

interface TrackClipPayload {
  trackId: TrackId;
  clipId: ClipId;
}

interface SliceClipArgs {
  oldClipId: ClipId;
  firstClipId: ClipId;
  secondClipId: ClipId;
}

const defaultRecord: ClipMapState = {
  id: defaultPatternTrack.id,
  clipIds: [],
};
const initialState = initializeState<TrackId, ClipMapState>([defaultRecord]);

export const clipMapSlice = createSlice({
  name: "clipMap",
  initialState,
  reducers: {
    addPatternTrackToClipMap: (state, action: PayloadAction<TrackId>) => {
      const id = action.payload;
      state.byId[id] = { id, clipIds: [] };
      state.allIds.push(id);
    },
    removePatternTrackFromClipMap: (state, action: PayloadAction<TrackId>) => {
      const trackId = action.payload;
      delete state.byId[trackId];

      const index = state.allIds.findIndex((id) => id === trackId);
      if (index === -1) return;
      state.allIds.splice(index, 1);
    },
    clearPatternTrackFromClipMap: (state, action: PayloadAction<TrackId>) => {
      const trackId = action.payload;
      if (!state.byId?.[trackId]) return;
      state.byId[trackId].clipIds = [];
    },
    addClipToClipMap: (state, action: PayloadAction<TrackClipPayload>) => {
      const { trackId, clipId } = action.payload;
      if (!state.byId?.[trackId]) return;
      state.byId[trackId].clipIds.push(clipId);
    },
    addClipsToClipMap: (state, action: PayloadAction<TrackClipPayload[]>) => {
      const trackClipPayloads = action.payload;
      trackClipPayloads.forEach((payload) => {
        if (!state.byId?.[payload.trackId]) return;
        state.byId[payload.trackId].clipIds.push(payload.clipId);
      });
    },
    addClipsWithTransformsToClipMap: (
      state,
      action: PayloadAction<{
        clips: Clip[];
        transforms: Transform[];
      }>
    ) => {
      const { clips, transforms } = action.payload;
      clips.forEach((clip) => {
        if (!state.byId?.[clip.trackId]) return;
        state.byId[clip.trackId].clipIds.push(clip.id);
      });
    },
    removeClipFromClipMap: (state, action: PayloadAction<ClipId>) => {
      const clipId = action.payload;
      if (!state.byId) return;
      Object.keys(state.byId).forEach((trackId) => {
        const clipIndex = state.byId[trackId].clipIds.findIndex(
          (id) => id === clipId
        );
        if (clipIndex === -1) return;
        state.byId[trackId].clipIds.splice(clipIndex, 1);
      });
    },
    removeClipsFromClipMap: (state, action: PayloadAction<ClipId[]>) => {
      const clipIds = action.payload;
      if (!state.byId) return;
      clipIds.forEach((clipId) => {
        Object.keys(state.byId).forEach((trackId) => {
          const clipIndex = state.byId[trackId].clipIds.findIndex(
            (id) => id === clipId
          );
          if (clipIndex === -1) return;
          state.byId[trackId].clipIds.splice(clipIndex, 1);
        });
      });
    },
    removeClipsWithTransformsFromClipMap: (
      state,
      action: PayloadAction<{ clipIds: ClipId[]; transformIds: TransformId[] }>
    ) => {
      const { clipIds } = action.payload;
      if (!state.byId) return;
      clipIds.forEach((clipId) => {
        Object.keys(state.byId).forEach((trackId) => {
          const clipIndex = state.byId[trackId].clipIds.findIndex(
            (id) => id === clipId
          );
          if (clipIndex === -1) return;
          state.byId[trackId].clipIds.splice(clipIndex, 1);
        });
      });
    },
    sliceClipFromClipMap: (state, action: PayloadAction<SliceClipArgs>) => {
      if (!state.byId) return;
      const { oldClipId, firstClipId, secondClipId } = action.payload;

      let clipTrackId = "";
      // Remove the old clip
      Object.keys(state.byId).forEach((trackId) => {
        const clipIndex = state.byId[trackId].clipIds.findIndex(
          (id) => id === oldClipId
        );
        if (clipIndex === -1) return;
        state.byId[trackId].clipIds.splice(clipIndex, 1);
        clipTrackId = trackId;
      });

      if (!clipTrackId) return;
      // Add the new clips
      state.byId[clipTrackId].clipIds.push(firstClipId);
      state.byId[clipTrackId].clipIds.push(secondClipId);
    },
  },
});

export const {
  addPatternTrackToClipMap,
  removePatternTrackFromClipMap,
  clearPatternTrackFromClipMap,
  addClipToClipMap,
  addClipsToClipMap,
  addClipsWithTransformsToClipMap,
  removeClipFromClipMap,
  removeClipsFromClipMap,
  removeClipsWithTransformsFromClipMap,
  sliceClipFromClipMap,
} = clipMapSlice.actions;

export default clipMapSlice.reducer;
