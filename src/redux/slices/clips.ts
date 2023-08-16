import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "redux/store";
import {
  Clip,
  ClipId,
  ClipNoId,
  defaultClip,
  initializeClip,
} from "types/clips";
import { TrackId } from "types/tracks";

import { initializeState } from "redux/util";
import {
  addClipsToClipMap,
  addClipsWithTransformsToClipMap,
  addClipToClipMap,
  removeClipFromClipMap,
  removeClipsFromClipMap,
  removeClipsWithTransformsFromClipMap,
} from "./maps/clipMap";
import { deselectClip } from "./root";
import {
  addTransformsWithClipsToTransformMap,
  removeTransformsWithClipsFromTransformMap,
} from "./maps/transformMap";
import {
  addTransformsWithClips,
  removeTransformsWithClips,
  updateTransformsWithClips,
} from "./transforms";
import {
  defaultTransform,
  initializeTransform,
  Transform,
  TransformId,
} from "types/transform";

const initialState = initializeState<ClipId, Clip>();

type SliceClipArgs = {
  oldClip: Clip;
  firstClip: Clip;
  secondClip: Clip;
};

export const clipsSlice = createSlice({
  name: "clips",
  initialState,
  reducers: {
    addClip: (state, action: PayloadAction<Clip>) => {
      const clip = action.payload;
      state.allIds.push(clip.id);
      state.byId[clip.id] = clip;
    },
    addClips: (state, action: PayloadAction<Clip[]>) => {
      const clips = action.payload;
      clips.forEach((clip) => {
        state.allIds.push(clip.id);
        state.byId[clip.id] = clip;
      });
    },
    addClipsWithTransforms: (
      state,
      action: PayloadAction<{ clips: Clip[]; transforms: Transform[] }>
    ) => {
      const { clips } = action.payload;
      clips.forEach((clip) => {
        state.allIds.push(clip.id);
        state.byId[clip.id] = clip;
      });
    },
    removeClip: (state, action: PayloadAction<ClipId>) => {
      const clipId = action.payload;
      delete state.byId[clipId];

      const index = state.allIds.findIndex((id) => id === clipId);
      if (index === -1) return;
      state.allIds.splice(index, 1);
    },
    removeClips: (state, action: PayloadAction<ClipId[]>) => {
      const clipIds = action.payload;
      clipIds.forEach((clipId) => {
        delete state.byId[clipId];
        const index = state.allIds.findIndex((id) => id === clipId);
        if (index === -1) return;
        state.allIds.splice(index, 1);
      });
    },
    removeClipsWithTransforms: (
      state,
      action: PayloadAction<{ clipIds: ClipId[]; transformIds: TransformId[] }>
    ) => {
      const { clipIds } = action.payload;
      clipIds.forEach((clipId) => {
        delete state.byId[clipId];
        const index = state.allIds.findIndex((id) => id === clipId);
        if (index === -1) return;
        state.allIds.splice(index, 1);
      });
    },
    updateClip: (state, action: PayloadAction<Partial<Clip>>) => {
      const { id, ...rest } = action.payload;
      if (!id) return;
      if (!state.byId[id]) return;
      state.byId[id] = {
        ...state.byId[id],
        ...rest,
      };
    },
    updateClips: (state, action: PayloadAction<Partial<Clip>[]>) => {
      const clips = action.payload;
      clips.forEach((clip) => {
        const { id, ...rest } = clip;
        if (!id) return;
        state.byId[id] = {
          ...state.byId[id],
          ...rest,
        };
      });
    },
    updateClipsWithTransforms: (
      state,
      action: PayloadAction<{
        clips: Partial<Clip>[];
        transforms: Partial<Transform>[];
      }>
    ) => {
      const { clips } = action.payload;
      clips.forEach((clip) => {
        const { id, ...rest } = clip;
        if (!id) return;
        state.byId[id] = {
          ...state.byId[id],
          ...rest,
        };
      });
    },
    sliceClip: (state, action: PayloadAction<SliceClipArgs>) => {
      const { oldClip, firstClip, secondClip } = action.payload;
      delete state.byId[oldClip.id];

      //  Remove the old clip
      const index = state.allIds.findIndex((id) => id === oldClip.id);
      if (index === -1) return;
      state.allIds.splice(index, 1);
      //  Add the new clips
      state.allIds.push(firstClip.id);
      state.allIds.push(secondClip.id);
      state.byId[firstClip.id] = firstClip;
      state.byId[secondClip.id] = secondClip;
    },
    removeClipsByPatternTrackId: (state, action: PayloadAction<TrackId>) => {
      const trackId = action.payload;
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
    clearClipsByPatternTrackId: (state, action: PayloadAction<TrackId>) => {
      const trackId = action.payload;
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
  addClip,
  addClips,
  addClipsWithTransforms,
  removeClip,
  removeClips,
  removeClipsWithTransforms,
  updateClip,
  updateClips,
  updateClipsWithTransforms,
  removeClipsByPatternTrackId,
  clearClipsByPatternTrackId,
} = clipsSlice.actions;
export const _sliceClip = clipsSlice.actions.sliceClip;

export const createClip =
  (clip: Partial<ClipNoId> = defaultClip): AppThunk<Promise<ClipId>> =>
  (dispatch) => {
    return new Promise((resolve) => {
      const newClip = initializeClip({
        ...defaultClip,
        ...clip,
      });
      // Add clip to store
      dispatch(addClip(newClip));
      dispatch(
        addClipToClipMap({
          trackId: newClip.trackId,
          clipId: newClip.id,
        })
      );
      resolve(newClip.id);
    });
  };

export const createClips =
  (clips: Partial<ClipNoId>[]): AppThunk<Promise<{ clipIds: ClipId[] }>> =>
  (dispatch) => {
    return new Promise((resolve) => {
      const initializedClips = clips.map((clip) =>
        initializeClip({ ...defaultClip, ...clip })
      );
      dispatch(addClips(initializedClips));
      const clipMapPayload = initializedClips.map((clip) => ({
        trackId: clip.trackId,
        clipId: clip.id,
      }));
      dispatch(addClipsToClipMap(clipMapPayload));

      const clipIds = initializedClips.map((clip) => clip.id);
      const promiseResult = { clipIds };
      resolve(promiseResult);
    });
  };

export const createClipsAndTransforms =
  (
    clips: Partial<ClipNoId>[],
    transforms: Partial<Transform>[]
  ): AppThunk<Promise<{ clipIds: ClipId[]; transformIds: TransformId[] }>> =>
  (dispatch) => {
    return new Promise((resolve) => {
      const initializedClips = clips.map((clip) =>
        initializeClip({ ...defaultClip, ...clip })
      );
      const initializedTransforms = transforms.map((transform) =>
        initializeTransform({ ...defaultTransform, ...transform })
      );
      const payload = {
        clips: initializedClips,
        transforms: initializedTransforms,
      };
      dispatch(addClipsWithTransforms(payload));
      dispatch(addClipsWithTransformsToClipMap(payload));
      dispatch(addTransformsWithClips(payload));
      dispatch(addTransformsWithClipsToTransformMap(payload));

      const clipIds = initializedClips.map((clip) => clip.id);
      const transformIds = initializedTransforms.map(
        (transform) => transform.id
      );
      const promiseResult = { clipIds, transformIds };
      resolve(promiseResult);
    });
  };

export const updateClipsAndTransforms =
  (
    clips: Partial<Clip>[],
    transforms: Partial<Transform>[]
  ): AppThunk<Promise<{ clipIds: ClipId[]; transformIds: TransformId[] }>> =>
  (dispatch) => {
    return new Promise((resolve) => {
      dispatch(
        updateClipsWithTransforms({
          clips,
          transforms,
        })
      );
      dispatch(
        updateTransformsWithClips({
          clips,
          transforms,
        })
      );
      const clipIds = clips.map((clip) => clip.id!);
      const transformIds = transforms.map((transform) => transform.id!);
      const promiseResult = { clipIds, transformIds };
      resolve(promiseResult);
    });
  };

export const deleteClip =
  (clipId: ClipId): AppThunk =>
  (dispatch) => {
    dispatch(deselectClip(clipId));
    dispatch(removeClip(clipId));
    dispatch(removeClipFromClipMap(clipId));
  };

export const deleteClips =
  (clipIds: ClipId[]): AppThunk =>
  (dispatch) => {
    clipIds.forEach((clipId) => {
      dispatch(deselectClip(clipId));
    });
    dispatch(removeClips(clipIds));
    dispatch(removeClipsFromClipMap(clipIds));
  };

export const deleteClipsAndTransforms =
  (clipIds: ClipId[], transformIds: TransformId[]): AppThunk =>
  (dispatch) => {
    clipIds.forEach((clipId) => {
      dispatch(deselectClip(clipId));
    });
    dispatch(removeClipsWithTransforms({ clipIds, transformIds }));
    dispatch(removeClipsWithTransformsFromClipMap({ clipIds, transformIds }));
    dispatch(removeTransformsWithClips({ clipIds, transformIds }));
    dispatch(
      removeTransformsWithClipsFromTransformMap({ clipIds, transformIds })
    );
  };

export default clipsSlice.reducer;
