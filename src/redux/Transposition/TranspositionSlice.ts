import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TrackId } from "types/Track";
import { defaultTranspositionState, Transposition } from "types/Transposition";
import { union, without } from "lodash";
import {
  RemoveMediaPayload,
  CreateMediaPayload,
  UpdateMediaPayload,
} from "types/Media";

// ------------------------------------------------------------
// Transposition Payload Types
// ------------------------------------------------------------

/** A transposition can only be added as media. */
export type AddTranspositionsPayload = CreateMediaPayload;

/** A transposition can only be updated as media. */
export type UpdateTranspositionsPayload = UpdateMediaPayload;

/** A transposition can only be removed as media. */
export type RemoveTranspositionsPayload = RemoveMediaPayload;

/** A transposition can be sliced into two new transpositions. */
export type SliceTranspositionPayload = {
  oldTransposition: Transposition;
  firstTransposition: Transposition;
  secondTransposition: Transposition;
};

/** A transposition can be removed by track ID. */
export type RemoveTranspositionsByTrackIdPayload = TrackId;

/** A transposition can be cleared by track ID. */
export type ClearTranspositionsByTrackIdPayload = TrackId;

// ------------------------------------------------------------
// Transposition Slice Definition
// ------------------------------------------------------------

export const transpositionsSlice = createSlice({
  name: "transpositions",
  initialState: defaultTranspositionState,
  reducers: {
    /** Add a list of transpositions to the slice. */
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
    /** (PRIVATE) Update a list of transpositions in the slice. */
    _updateTranspositions: (
      state,
      action: PayloadAction<UpdateTranspositionsPayload>
    ) => {
      const { transpositions } = action.payload;
      if (!transpositions?.length) return;
      transpositions.forEach((transposition) => {
        const { id, ...rest } = transposition;
        if (!id) return;
        if (!state.byId[id]) return;
        state.byId[id] = { ...state.byId[id], ...rest };
      });
    },
    /** Remove a list of transpositions from the slice. */
    removeTranspositions: (
      state,
      action: PayloadAction<RemoveTranspositionsPayload>
    ) => {
      const { transpositionIds } = action.payload;
      if (!transpositionIds?.length) return;
      transpositionIds.forEach((id) => {
        delete state.byId[id];
      });
      state.allIds = without(state.allIds, ...transpositionIds);
    },
    /** (PRIVATE) Slice a transposition into two new transpositions. */
    _sliceTransposition: (
      state,
      action: PayloadAction<SliceTranspositionPayload>
    ) => {
      const { oldTransposition, firstTransposition, secondTransposition } =
        action.payload;
      if (!oldTransposition || !firstTransposition || !secondTransposition)
        return;
      delete state.byId[oldTransposition.id];

      //  Remove the old Transposition
      const index = state.allIds.findIndex((id) => id === oldTransposition.id);
      if (index === -1) return;
      state.allIds.splice(index, 1);
      //  Add the new Transpositions
      state.allIds = union(state.allIds, [
        firstTransposition.id,
        secondTransposition.id,
      ]);
      state.byId[firstTransposition.id] = firstTransposition;
      state.byId[secondTransposition.id] = secondTransposition;
    },
    /** Remove all transpositions with a given track ID. */
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
    /** Clear all transpositions with a given track ID. */
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
  },
});

export const {
  addTranspositions,
  _updateTranspositions,
  removeTranspositions,
  _sliceTransposition,
  removeTranspositionsByTrackId,
  clearTranspositionsByTrackId,
} = transpositionsSlice.actions;

export default transpositionsSlice.reducer;
