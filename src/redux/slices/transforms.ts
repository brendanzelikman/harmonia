import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "redux/store";
import { initializeState } from "redux/util";
import { TrackId } from "types/tracks";
import {
  defaultTransform,
  initializeTransform,
  Transform,
  TransformId,
  TransformNoId,
} from "types/transform";
import {
  addTransformToTransformMap,
  removeTransformFromTransformMap,
  removeTransformsFromTransformMap,
} from "./maps/transformMap";
import { Clip, ClipId } from "types/clip";
import { union } from "lodash";

const initialTransforms = initializeState<TransformId, Transform>();

export const transformsSlice = createSlice({
  name: "transforms",
  initialState: initialTransforms,
  reducers: {
    addTransform: (state, action: PayloadAction<Transform>) => {
      const transform = action.payload;
      state.byId[transform.id] = transform;
      state.allIds.push(transform.id);
    },
    addTransforms: (state, action: PayloadAction<Transform[]>) => {
      const transforms = action.payload;
      const transformIds = transforms.map((transform) => transform.id);
      state.allIds = union(state.allIds, transformIds);
      transforms.forEach((transform) => {
        state.byId[transform.id] = transform;
      });
    },
    addTransformsWithClips: (
      state,
      action: PayloadAction<{
        clips: Clip[];
        transforms: Transform[];
      }>
    ) => {
      const { clips, transforms } = action.payload;
      transforms.forEach((transform) => {
        state.byId[transform.id] = transform;
        state.allIds.push(transform.id);
      });
    },
    removeTransform: (state, action: PayloadAction<TransformId>) => {
      const transformationId = action.payload;
      delete state.byId[transformationId];

      const index = state.allIds.findIndex((id) => id === transformationId);
      if (index === -1) return;
      state.allIds.splice(index, 1);
    },
    removeTransforms: (state, action: PayloadAction<TransformId[]>) => {
      const transformationIds = action.payload;
      transformationIds.forEach((id) => {
        delete state.byId[id];
      });
      state.allIds = state.allIds.filter(
        (id) => !transformationIds.includes(id)
      );
    },
    removeTransformsWithClips: (
      state,
      action: PayloadAction<{ clipIds: ClipId[]; transformIds: TransformId[] }>
    ) => {
      const { transformIds } = action.payload;
      transformIds.forEach((id) => {
        delete state.byId[id];
      });
      state.allIds = state.allIds.filter((id) => !transformIds.includes(id));
    },
    removeTransformsByScaleTrackId: (state, action: PayloadAction<TrackId>) => {
      const trackId = action.payload;
      const transformIds = state.allIds.filter(
        (id) => state.byId[id].trackId === trackId
      );
      transformIds.forEach((id) => {
        delete state.byId[id];
      });
      state.allIds = state.allIds.filter((id) => !transformIds.includes(id));
    },
    removeTransformsByPatternTrackId: (
      state,
      action: PayloadAction<TrackId>
    ) => {
      const trackId = action.payload;
      const transformIds = state.allIds.filter(
        (id) => state.byId[id].trackId === trackId
      );
      transformIds.forEach((id) => {
        delete state.byId[id];
      });
      state.allIds = state.allIds.filter((id) => !transformIds.includes(id));
    },
    clearTransformsByScaleTrackId: (state, action: PayloadAction<TrackId>) => {
      const trackId = action.payload;
      const transformIds = state.allIds.filter(
        (id) => state.byId[id].trackId === trackId
      );
      transformIds.forEach((id) => {
        delete state.byId[id];
      });
      state.allIds = state.allIds.filter((id) => !transformIds.includes(id));
    },
    clearTransformsByPatternTrackId: (
      state,
      action: PayloadAction<TrackId>
    ) => {
      const trackId = action.payload;
      const transformIds = state.allIds.filter(
        (id) => state.byId[id].trackId === trackId
      );
      transformIds.forEach((id) => {
        delete state.byId[id];
      });
      state.allIds = state.allIds.filter((id) => !transformIds.includes(id));
    },
    updateTransform: (state, action: PayloadAction<Partial<Transform>>) => {
      const { id, ...rest } = action.payload;

      if (!id) return;
      if (!state.byId[id]) return;
      state.byId[id] = {
        ...state.byId[id],
        ...rest,
      };
    },
    updateTransforms: (state, action: PayloadAction<Partial<Transform>[]>) => {
      const transforms = action.payload;
      transforms.forEach((transform) => {
        const { id, ...rest } = transform;
        if (!id) return;
        state.byId[id] = {
          ...state.byId[id],
          ...rest,
        };
      });
    },
    updateTransformsWithClips: (
      state,
      action: PayloadAction<{
        clips: Partial<Clip>[];
        transforms: Partial<Transform>[];
      }>
    ) => {
      const { transforms } = action.payload;
      transforms.forEach((transform) => {
        const { id, ...rest } = transform;

        if (!id) return;
        if (!state.byId[id]) return;
        state.byId[id] = {
          ...state.byId[id],
          ...rest,
        };
      });
    },
  },
});

export const {
  addTransform,
  addTransforms,
  addTransformsWithClips,
  removeTransform,
  removeTransforms,
  removeTransformsWithClips,
  removeTransformsByScaleTrackId,
  removeTransformsByPatternTrackId,
  updateTransform,
  updateTransforms,
  updateTransformsWithClips,
  clearTransformsByScaleTrackId,
  clearTransformsByPatternTrackId,
} = transformsSlice.actions;

export const createTransform =
  (
    transform: Partial<TransformNoId> = defaultTransform
  ): AppThunk<Promise<TransformId>> =>
  (dispatch) => {
    return new Promise((resolve) => {
      const newTransform = initializeTransform({
        ...defaultTransform,
        ...transform,
      });

      // Add clip to store
      dispatch(addTransform(newTransform));

      // Add clip to track
      const { trackId, id } = newTransform;
      dispatch(addTransformToTransformMap({ trackId, transformId: id }));
      resolve(newTransform.id);
    });
  };

export const createTransforms =
  (
    transforms: Partial<TransformNoId>[] = [defaultTransform]
  ): AppThunk<Promise<TransformId[]>> =>
  (dispatch) => {
    return Promise.all(
      transforms.map((transform) => dispatch(createTransform(transform)))
    );
  };
export const deleteTransform =
  (id: TransformId): AppThunk =>
  (dispatch) => {
    dispatch(removeTransform(id));
    dispatch(removeTransformFromTransformMap(id));
  };

export const deleteTransforms =
  (ids: TransformId[]): AppThunk =>
  (dispatch) => {
    dispatch(removeTransforms(ids));
    dispatch(removeTransformsFromTransformMap(ids));
  };

export default transformsSlice.reducer;
