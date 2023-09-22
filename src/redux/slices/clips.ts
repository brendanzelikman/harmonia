import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "redux/store";
import {
  Clip,
  ClipId,
  ClipNoId,
  defaultClip,
  initializeClip,
} from "types/clip";
import { TrackId } from "types/tracks";
import { initializeState } from "redux/util";
import { deselectClip, deselectTransposition } from "./root";
import {
  addTranspositions,
  removeTranspositions,
  updateTranspositions,
} from "./transpositions";
import {
  defaultTransposition,
  initializeTransposition,
  Transposition,
  TranspositionId,
} from "types/transposition";
import { PartialObject, union } from "lodash";
import {
  addClipsAndTranspositionsToSession,
  addClipsToSession,
  removeClipsAndTranspositionsFromSession,
  removeClipsFromSession,
} from "./sessionMap";
import { ObjectPayload, PartialObjectPayload } from "redux/slices";

const initialState = initializeState<ClipId, Clip>();

export type SliceClipPayload = {
  oldClip: Clip;
  firstClip: Clip;
  secondClip: Clip;
};
export type AddClipsPayload = ObjectPayload;
export type RemoveClipsPayload = ObjectPayload;
export type UpdateClipsPayload = PartialObjectPayload;
export type RemoveClipsByTrackIdPayload = TrackId;
export type ClearClipsByTrackIdPayload = TrackId;

export const clipsSlice = createSlice({
  name: "clips",
  initialState,
  reducers: {
    addClips: (state, action: PayloadAction<AddClipsPayload>) => {
      const { clips } = action.payload;
      if (!clips?.length) return;
      const clipIds = clips.map((clip) => clip.id);
      state.allIds = union(state.allIds, clipIds);
      clips.forEach((clip) => {
        state.byId[clip.id] = clip;
      });
    },
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
    updateClips: (state, action: PayloadAction<UpdateClipsPayload>) => {
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
    sliceClip: (state, action: PayloadAction<SliceClipPayload>) => {
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
    // Delete clips when a track is deleted
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
    // Delete clips when a track is cleared
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
  updateClips,
  sliceClip,
  removeClipsByTrackId,
  clearClipsByTrackId,
} = clipsSlice.actions;
export const _sliceClip = clipsSlice.actions.sliceClip;

export const createClips =
  (clipNoIds: Partial<ClipNoId>[]): AppThunk<Promise<{ clipIds: ClipId[] }>> =>
  (dispatch) => {
    return new Promise((resolve) => {
      const clips = clipNoIds.map((clip) =>
        initializeClip({ ...defaultClip, ...clip })
      );
      const payload = { clips };
      dispatch(addClips(payload));
      dispatch(addClipsToSession(payload));
      const clipIds = clips.map((clip) => clip.id);
      const promiseResult = { clipIds };
      resolve(promiseResult);
    });
  };

export const deleteClips =
  (clips: Clip[]): AppThunk =>
  (dispatch) => {
    if (!clips?.length) return;
    if (clips.length) {
      clips.forEach((clip) => {
        dispatch(deselectClip(clip.id));
      });
    }
    dispatch(removeClips({ clips }));
    dispatch(removeClipsFromSession({ clips }));
  };

export const createClipsAndTranspositions =
  (
    clips: Partial<ClipNoId>[],
    transpositions: Partial<Transposition>[]
  ): AppThunk<
    Promise<{ clipIds: ClipId[]; transpositionIds: TranspositionId[] }>
  > =>
  (dispatch) => {
    return new Promise((resolve) => {
      const initializedClips = clips.map((clip) =>
        initializeClip({ ...defaultClip, ...clip })
      );
      const initializedTranspositions = transpositions.map((transposition) =>
        initializeTransposition({ ...defaultTransposition, ...transposition })
      );
      const payload = {
        clips: initializedClips,
        transpositions: initializedTranspositions,
      };
      dispatch(addClips(payload));
      dispatch(addTranspositions(payload));
      dispatch(
        addClipsAndTranspositionsToSession({
          clips: initializedClips,
          transpositions: initializedTranspositions,
        })
      );
      const clipIds = initializedClips.map((c) => c.id);
      const transpositionIds = initializedTranspositions.map((t) => t.id);
      const promiseResult = { clipIds, transpositionIds };
      resolve(promiseResult);
    });
  };

export const updateClipsAndTranspositions =
  (
    clips: Partial<Clip>[],
    transpositions: Partial<Transposition>[]
  ): AppThunk<
    Promise<{ clipIds: ClipId[]; transpositionIds: TranspositionId[] }>
  > =>
  (dispatch) => {
    return new Promise((resolve) => {
      const payload = { clips, transpositions };
      dispatch(updateClips(payload));
      dispatch(updateTranspositions(payload));
      const clipIds = clips?.map((clip) => clip.id!) || [];
      const transpositionIds =
        transpositions?.map((transposition) => transposition.id!) || [];
      const promiseResult = { clipIds, transpositionIds };
      resolve(promiseResult);
    });
  };

export const deleteClipsAndTranspositions =
  (clips: Clip[], transpositions: Transposition[]): AppThunk =>
  (dispatch) => {
    if (!clips?.length && !transpositions?.length) return;
    if (clips.length) {
      clips.forEach((clip) => {
        dispatch(deselectClip(clip.id));
      });
    }
    if (transpositions.length) {
      transpositions.forEach((transposition) => {
        dispatch(deselectTransposition(transposition.id));
      });
    }
    dispatch(removeClips({ clips, transpositions }));
    dispatch(removeTranspositions({ transpositions }));
    dispatch(
      removeClipsAndTranspositionsFromSession({ clips, transpositions })
    );
  };

export default clipsSlice.reducer;
