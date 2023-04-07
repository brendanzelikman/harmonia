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
} from "./maps/transformMap";

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
    removeTransform: (state, action: PayloadAction<TransformId>) => {
      const transformationId = action.payload;
      delete state.byId[transformationId];

      const index = state.allIds.findIndex((id) => id === transformationId);
      if (index === -1) return;
      state.allIds.splice(index, 1);
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
  },
});

export const {
  addTransform,
  removeTransform,
  updateTransform,
  removeTransformsByScaleTrackId,
  removeTransformsByPatternTrackId,
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
    return Promise.all(ids.map((id) => dispatch(deleteTransform(id))));
  };

export default transformsSlice.reducer;
