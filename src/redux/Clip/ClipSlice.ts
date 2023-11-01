import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Clip, defaultClipState } from "types/Clip";
import { TrackId } from "types/Track";
import {
  RemoveMediaPayload,
  CreateMediaPayload,
  UpdateMediaPayload,
} from "types/Media";
import { union } from "lodash";

// ------------------------------------------------------------
// Payload Types
// ------------------------------------------------------------

/** Clips can only be added as media. */
export type AddClipsPayload = CreateMediaPayload;

/** Clips can only be updated as media. */
export type UpdateClipsPayload = UpdateMediaPayload;

/** Clips can only be removed as media IDs. */
export type RemoveClipsPayload = RemoveMediaPayload;

/** A clip can be sliced into two new clips. */
export type SliceClipPayload = {
  oldClip: Clip;
  firstClip: Clip;
  secondClip: Clip;
};

/** Clips can be removed by track ID. */
export type RemoveClipsByTrackIdPayload = TrackId;

/** Clips can be cleared by track ID. */
export type ClearClipsByTrackIdPayload = TrackId;

// ------------------------------------------------------------
// Slice Definitions
// ------------------------------------------------------------

export const clipsSlice = createSlice({
  name: "clips",
  initialState: defaultClipState,
  reducers: {
    /** Add a list of clips to the slice. */
    addClips: (state, action: PayloadAction<AddClipsPayload>) => {
      const { clips } = action.payload;
      if (!clips?.length) return;
      const clipIds = clips.map((clip) => clip.id);
      state.allIds = union(state.allIds, clipIds);
      clips.forEach((clip) => {
        state.byId[clip.id] = clip;
      });
    },
    /** (PRIVATE) Update a list of clips in the slice. */
    _updateClips: (state, action: PayloadAction<UpdateClipsPayload>) => {
      const { clips } = action.payload;
      if (!clips?.length) return;
      clips.forEach((clip) => {
        const { id, ...rest } = clip;
        if (!id) return;
        state.byId[id] = {
          ...state.byId[id],
          ...rest,
        };
      });
    },
    /** Remove a list of clips from the slice. */
    removeClips: (state, action: PayloadAction<RemoveClipsPayload>) => {
      const { clipIds } = action.payload;
      if (!clipIds?.length) return;
      clipIds.forEach((clipId) => {
        delete state.byId[clipId];
        const index = state.allIds.findIndex((id) => id === clipId);
        if (index === -1) return;
        state.allIds.splice(index, 1);
      });
    },
    /** Slice a clip into two new clips. */
    _sliceClip: (state, action: PayloadAction<SliceClipPayload>) => {
      const { oldClip, firstClip, secondClip } = action.payload;
      if (!oldClip || !firstClip || !secondClip) return;
      delete state.byId[oldClip.id];

      //  Remove the old clip
      const index = state.allIds.findIndex((id) => id === oldClip.id);
      if (index === -1) return;
      state.allIds.splice(index, 1);
      //  Add the new clips
      state.allIds = union(state.allIds, [firstClip.id, secondClip.id]);
      state.byId[firstClip.id] = firstClip;
      state.byId[secondClip.id] = secondClip;
    },
    /** Remove a list of clips by track ID. */
    removeClipsByTrackId: (
      state,
      action: PayloadAction<RemoveClipsByTrackIdPayload>
    ) => {
      const trackId = action.payload;
      if (!trackId) return;
      const clips = Object.values(state.byId).filter(
        (clip) => clip.trackId === trackId
      );
      clips.forEach((clip) => {
        delete state.byId[clip.id];
        const index = state.allIds.findIndex((id) => id === clip.id);
        if (index === -1) return;
        state.allIds.splice(index, 1);
      });
    },
    /** Clear a list of clips by track ID. */
    clearClipsByTrackId: (
      state,
      action: PayloadAction<ClearClipsByTrackIdPayload>
    ) => {
      const trackId = action.payload;
      if (!trackId) return;
      const clips = Object.values(state.byId).filter(
        (clip) => clip.trackId === trackId
      );
      clips.forEach((clip) => {
        delete state.byId[clip.id];
        const index = state.allIds.findIndex((id) => id === clip.id);
        if (index === -1) return;
        state.allIds.splice(index, 1);
      });
    },
  },
});

export const {
  addClips,
  _updateClips,
  removeClips,
  _sliceClip,
  removeClipsByTrackId,
  clearClipsByTrackId,
} = clipsSlice.actions;

export default clipsSlice.reducer;
