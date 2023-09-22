import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk } from "redux/store";
import { initializeState } from "redux/util";
import { TrackId } from "types/tracks";
import {
  defaultTransposition,
  initializeTransposition,
  Transposition,
  TranspositionId,
  TranspositionNoId,
} from "types/transposition";
import { without } from "lodash";
import {
  addTranspositionsToSession,
  removeTranspositionsFromSession,
} from "./sessionMap";
import { ObjectPayload, PartialObjectPayload } from "redux/slices";

const initialTranspositions = initializeState<TranspositionId, Transposition>();

export type AddTranspositionsPayload = ObjectPayload;
export type RemoveTranspositionsPayload = ObjectPayload;
export type UpdateTranspositionsPayload = PartialObjectPayload;
export type RemoveTranspositionsByTrackIdPayload = TrackId;
export type ClearTranspositionsByTrackIdPayload = TrackId;

export const transpositionsSlice = createSlice({
  name: "transpositions",
  initialState: initialTranspositions,
  reducers: {
    addTranspositions: (
      state,
      action: PayloadAction<AddTranspositionsPayload>
    ) => {
      const { transpositions } = action.payload;
      if (!transpositions?.length) return;
      transpositions.forEach((transposition) => {
        state.byId[transposition.id] = transposition;
        state.allIds.push(transposition.id);
      });
    },
    removeTranspositions: (
      state,
      action: PayloadAction<RemoveTranspositionsPayload>
    ) => {
      const { transpositions } = action.payload;
      if (!transpositions?.length) return;
      const transpositionIds = transpositions.map(({ id }) => id);
      transpositionIds.forEach((id) => {
        delete state.byId[id];
      });
      state.allIds = without(state.allIds, ...transpositionIds);
    },
    // Delete transpositions when removing a track
    removeTranspositionsByTrackId: (
      state,
      action: PayloadAction<RemoveTranspositionsByTrackIdPayload>
    ) => {
      const trackId = action.payload;
      if (!trackId) return;
      const transpositionIds = state.allIds.filter(
        (id) => state.byId[id].trackId === trackId
      );
      transpositionIds.forEach((id) => {
        delete state.byId[id];
      });
      state.allIds = without(state.allIds, ...transpositionIds);
    },
    // Delete transpositions when clearing a track
    clearTranspositionsByTrackId: (
      state,
      action: PayloadAction<ClearTranspositionsByTrackIdPayload>
    ) => {
      const trackId = action.payload;
      if (!trackId) return;
      const transpositionIds = state.allIds.filter(
        (id) => state.byId[id].trackId === trackId
      );
      transpositionIds.forEach((id) => {
        delete state.byId[id];
      });
      state.allIds = without(state.allIds, ...transpositionIds);
    },
    updateTranspositions: (
      state,
      action: PayloadAction<UpdateTranspositionsPayload>
    ) => {
      const { transpositions } = action.payload;
      if (!transpositions?.length) return;
      transpositions.forEach((transposition) => {
        const { id, ...rest } = transposition;

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
  addTranspositions,
  removeTranspositions,
  updateTranspositions,
  removeTranspositionsByTrackId,
  clearTranspositionsByTrackId,
} = transpositionsSlice.actions;

export const createTranspositions =
  (
    transpositionNoIds: Partial<TranspositionNoId>[]
  ): AppThunk<Promise<TranspositionId[]>> =>
  (dispatch) => {
    return new Promise((resolve) => {
      const transpositions = transpositionNoIds.map((transposition) =>
        initializeTransposition({ ...defaultTransposition, ...transposition })
      );
      const payload = { transpositions };
      dispatch(addTranspositions(payload));
      dispatch(addTranspositionsToSession(payload));
      resolve(transpositions.map((t) => t.id));
    });
  };

export const deleteTranspositions =
  (transpositions: Transposition[]): AppThunk =>
  (dispatch) => {
    dispatch(removeTranspositions({ transpositions }));
    dispatch(removeTranspositionsFromSession({ transpositions }));
  };

export default transpositionsSlice.reducer;
