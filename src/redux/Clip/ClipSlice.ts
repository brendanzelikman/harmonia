import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Clip, ClipId } from "types/Clip";
import { TrackId } from "types/Track";
import { initializeState } from "types/util";
import { MediaPayload, PartialMediaPayload } from "types/Media";
import { union } from "lodash";
import { updateMediaInSession } from "redux/Session";

const initialState = initializeState<ClipId, Clip>();

/**
 * Clips can be added within a bundle.
 */
export type AddClipsPayload = MediaPayload;

/**
 * Clips can be removed within a bundle.
 */
export type RemoveClipsPayload = MediaPayload;

/**
 * Clips can be updated within a bundle.
 */
export type UpdateClipsPayload = PartialMediaPayload;

/**
 * A clip can be sliced into two new clips.
 */
export type SliceClipPayload = {
  oldClip: Clip;
  firstClip: Clip;
  secondClip: Clip;
};

/**
 * Clips can be removed by track ID.
 */
export type RemoveClipsByTrackIdPayload = TrackId;

/**
 * Clips can be cleared by track ID.
 */
export type ClearClipsByTrackIdPayload = TrackId;

/**
 * The clips slice contains all clips in the session.
 * Some functions are underscored to indicate that they should not be called directly.
 *
 * @property `addClips` - Add clips to the store.
 * @property `removeClips` - Remove clips from the store.
 * @property `_updateClips` - Update clips in the store.
 * @property `_sliceClip` - Slice a clip into two new clips.
 * @property `removeClipsByTrackId` - Remove clips by track ID.
 * @property `clearClipsByTrackId` - Clear clips by track ID.
 *
 */
export const clipsSlice = createSlice({
  name: "clips",
  initialState,
  reducers: {
    /**
     * Add clips to the store.
     * @param state The clips state.
     * @param action The payload action.
     */
    addClips: (state, action: PayloadAction<AddClipsPayload>) => {
      const { clips } = action.payload;
      if (!clips?.length) return;
      const clipIds = clips.map((clip) => clip.id);
      state.allIds = union(state.allIds, clipIds);
      clips.forEach((clip) => {
        state.byId[clip.id] = clip;
      });
    },
    /**
     * Remove clips from the store.
     * @param state The clips state.
     * @param action The payload action.
     */
    removeClips: (state, action: PayloadAction<RemoveClipsPayload>) => {
      const { clips } = action.payload;
      if (!clips?.length) return;
      clips.forEach((clip) => {
        delete state.byId[clip.id];
        const index = state.allIds.findIndex((id) => id === clip.id);
        if (index === -1) return;
        state.allIds.splice(index, 1);
      });
    },
    /**
     * Update clips in the store.
     * @param state The clips state.
     * @param action The payload action.
     */
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
    /**
     * Slice a clip into two new clips.
     * @param state The clips state.
     * @param action The payload action.
     */
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
    /**
     * Remove clips by track ID.
     * @param state The clips state.
     * @param action The payload action.
     */
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
    /**
     * Clears clips by track ID.
     * @param state The clips state.
     * @param action The payload action.
     */
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
  removeClips,
  _updateClips,
  _sliceClip,
  removeClipsByTrackId,
  clearClipsByTrackId,
} = clipsSlice.actions;

export const updateClips = (media: PartialMediaPayload) => (dispatch: any) => {
  dispatch(_updateClips(media));
  dispatch(updateMediaInSession(media));
};

export default clipsSlice.reducer;
