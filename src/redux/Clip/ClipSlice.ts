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

/** A list of clips can be added to the slice. */
export interface AddClipsPayload extends CreateMediaPayload {
  callerId?: TrackId;
}

/** A list of clips can be updated in the slice. */
export type UpdateClipsPayload = UpdateMediaPayload;

/** A list of clips can be removed by ID. */
export interface RemoveClipsPayload extends RemoveMediaPayload {
  callerId?: TrackId;
  tag?: string;
}

/** A clip can be sliced into two new clips. */
export type SliceClipPayload = {
  oldClip: Clip;
  firstClip: Clip;
  secondClip: Clip;
};

/** A list of clips can be merged into a new clip. */
export type MergeClipsPayload = {
  oldClips: Clip[];
  newClip: Clip;
};

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
    /** Update a list of clips in the slice. */
    updateClips: (state, action: PayloadAction<UpdateClipsPayload>) => {
      const { clips } = action.payload;
      if (!clips?.length) return;
      clips.forEach((clip) => {
        const { id } = clip;
        if (!id) return;
        state.byId[id] = { ...state.byId[id], ...clip } as Clip;
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

      //  Remove the old clip
      const index = state.allIds.findIndex((id) => id === oldClip.id);
      if (index === -1) return;
      state.allIds.splice(index, 1);
      delete state.byId[oldClip.id];

      //  Add the new clips
      state.allIds = union(state.allIds, [firstClip.id, secondClip.id]);
      state.byId[firstClip.id] = firstClip;
      state.byId[secondClip.id] = secondClip;
    },
    /** Merge a list of clips into a new clip. */
    _mergeClips: (state, action: PayloadAction<MergeClipsPayload>) => {
      const { oldClips, newClip } = action.payload;
      if (!oldClips?.length || !newClip) return;

      // Remove the old clips
      oldClips.forEach((clip) => {
        const index = state.allIds.findIndex((id) => id === clip.id);
        if (index === -1) return;
        state.allIds.splice(index, 1);
        delete state.byId[clip.id];
      });

      // Add the new clip
      state.allIds = union(state.allIds, [newClip.id]);
      state.byId[newClip.id] = newClip;
    },
  },
});

export const { addClips, updateClips, removeClips, _sliceClip, _mergeClips } =
  clipsSlice.actions;

export default clipsSlice.reducer;
